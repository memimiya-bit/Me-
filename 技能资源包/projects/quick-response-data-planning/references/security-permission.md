# 安全与权限控制

## 目录
- [角色权限矩阵](#角色权限矩阵)
- [行级安全策略](#行级安全策略)
- [数据脱敏](#数据脱敏)
- [审计追踪](#审计追踪)

---

## 角色权限矩阵

### 部门-角色-模块映射

```sql
CREATE VIEW person_role_view AS
SELECT 
    person_id,
    department,
    person_role,
    CASE 
        WHEN department = '商品部' AND person_role = '买手' 
            THEN 'M1,M4_M5,M7'
        WHEN department = '合规部' AND person_role = '合规专员' 
            THEN 'M2'
        WHEN department = '运营部' AND person_role = '运营专员' 
            THEN 'M3,M4_M5'
        WHEN department = '设计部' AND person_role = '设计师' 
            THEN 'M1,M6,M7'
        WHEN department = '采购部' AND person_role = '采购专员' 
            THEN 'M7'
        WHEN department = '质量管理' AND person_role = '质量分析师' 
            THEN 'M6'
        WHEN department = 'PMO' 
            THEN 'GLOBAL,M1,M2,M3,M4_M5,M6,M7'
        ELSE 'READ_ONLY'
    END as allowed_modules
FROM (
    SELECT DISTINCT person_id, department, person_role 
    FROM time_series_core
) t
GROUP BY person_id, department, person_role;
```

### 权限矩阵表

| 角色 | M1 | M2 | M3 | M4_M5 | M6 | M7 | GLOBAL |
|------|----|----|----|----|----|----|----|
| 买手 | RW | R | - | RW | - | RW | - |
| 合规专员 | R | RW | - | R | - | - | R |
| 运营专员 | R | - | RW | RW | - | - | - |
| 设计师 | RW | R | - | R | R | R | - |
| 采购专员 | R | - | - | R | - | RW | - |
| 质量分析师 | R | - | R | - | RW | R | - |
| PMO | RW | RW | RW | RW | RW | RW | RW |

*R=只读, RW=读写, -=无权限*

---

## 行级安全策略

### 启用行级安全

```sql
-- 启用行级安全
ALTER TABLE time_series_core ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY time_series_access_policy ON time_series_core
    FOR SELECT TO application_user
    USING (
        -- 方案1：基于角色视图的权限检查
        person_id IN (
            SELECT person_id FROM person_role_view 
            WHERE allowed_modules LIKE '%' || module_code || '%'
        )
        OR 
        -- 方案2：PMO部门可访问所有数据
        department = 'PMO'
        OR
        -- 方案3：仅查看自己的数据
        person_id = CURRENT_USER
    );

-- 创建插入策略
CREATE POLICY time_series_insert_policy ON time_series_core
    FOR INSERT TO application_user
    WITH CHECK (
        person_id = CURRENT_USER
        OR department = 'PMO'
    );

-- 创建更新策略
CREATE POLICY time_series_update_policy ON time_series_core
    FOR UPDATE TO application_user
    USING (
        person_id = CURRENT_USER
        OR department = 'PMO'
    )
    WITH CHECK (
        person_id = CURRENT_USER
        OR department = 'PMO'
    );
```

### 动态行级安全

```sql
-- 创建函数：基于当前用户获取允许的模块列表
CREATE OR REPLACE FUNCTION get_allowed_modules()
RETURNS TEXT[] AS 
$$
DECLARE
    user_modules TEXT;
BEGIN
    SELECT allowed_modules INTO user_modules
    FROM person_role_view
    WHERE person_id = CURRENT_USER
    LIMIT 1;
    
    IF user_modules IS NULL THEN
        RETURN ARRAY[]::TEXT[];
    END IF;
    
    RETURN STRING_TO_ARRAY(user_modules, ',');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用动态策略
CREATE POLICY time_series_dynamic_policy ON time_series_core
    FOR SELECT TO application_user
    USING (
        module_code = ANY(get_allowed_modules())
        OR department = 'PMO'
    );
```

---

## 数据脱敏

### 敏感字段脱敏

```sql
-- 创建脱敏视图
CREATE VIEW time_series_anonymized AS
SELECT
    record_id,
    
    -- 人维度：保留基础信息
    person_id,
    department,
    
    -- 周维度：完整保留
    week_number,
    calendar_date,
    season_factor,
    
    -- 项目维度：完整保留
    project_id,
    sku_id,
    module_code,
    
    -- 业务数据：根据部门脱敏
    CASE 
        WHEN department = '商品部' THEN data_payload 
        ELSE '{}'::jsonb 
    END as data_payload,
    
    -- RGB状态：完整保留
    rgb_status,
    risk_score,
    
    -- 系统字段：完整保留
    created_at,
    updated_at
FROM time_series_core;

-- JSONB字段选择性脱敏函数
CREATE OR REPLACE FUNCTION mask_sensitive_data(
    payload JSONB,
    dept VARCHAR
) RETURNS JSONB AS 
$$
DECLARE
    masked JSONB := payload;
BEGIN
    IF dept = '商品部' THEN
        -- 商品部可看到完整数据
        RETURN masked;
    ELSIF dept = '运营部' THEN
        -- 运营部：隐藏成本字段
        masked := masked - 'cost_breakdown' - 'margin';
        RETURN masked;
    ELSIF dept = '设计部' THEN
        -- 设计部：隐藏财务字段
        masked := masked - 'purchase_price' - 'target_margin';
        RETURN masked;
    ELSE
        -- 其他部门：仅保留基础信息
        RETURN jsonb_build_object(
            'module', masked->>'module',
            'sku_code', masked->>'sku_code',
            'rgb_status', masked->>'rgb_status'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### 脱敏规则矩阵

| 字段类型 | 商品部 | 合规部 | 运营部 | 设计部 | 其他 |
|---------|-------|-------|-------|-------|------|
| 成本数据 | 可见 | 隐藏 | 隐藏 | 隐藏 | 隐藏 |
| 用户画像 | 可见 | 隐藏 | 可见 | 可见 | 隐藏 |
| 合规数据 | 可见 | 完整 | 可见 | 可见 | 部分 |
| 项目信息 | 可见 | 可见 | 可见 | 可见 | 可见 |

---

## 审计追踪

### 审计日志表

```sql
CREATE TABLE data_audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 操作信息
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation_type VARCHAR(10) NOT NULL 
        CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
    
    -- 数据变更
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],  -- 记录变更的字段列表
    
    -- 审计信息
    changed_by VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    -- 业务上下文
    business_reason VARCHAR(200),
    approval_id UUID
);

-- 创建索引
CREATE INDEX idx_audit_table_record ON data_audit_log (table_name, record_id);
CREATE INDEX idx_audit_changed_by ON data_audit_log (changed_by, changed_at);
CREATE INDEX idx_audit_time ON data_audit_log (changed_at);
```

### 审计触发器

```sql
CREATE OR REPLACE FUNCTION audit_time_series_changes()
RETURNS TRIGGER AS 
$$
DECLARE
    changed_fields TEXT[];
    old_json JSONB;
    new_json JSONB;
BEGIN
    -- 计算变更字段
    IF TG_OP = 'DELETE' THEN
        old_json := to_jsonb(OLD);
        new_json := NULL;
        changed_fields := ARRAY(SELECT key FROM jsonb_object_keys(old_json) AS key);
    ELSIF TG_OP = 'UPDATE' THEN
        old_json := to_jsonb(OLD);
        new_json := to_jsonb(NEW);
        changed_fields := ARRAY(
            SELECT key FROM jsonb_object_keys(old_json) AS key
            WHERE old_json->key IS DISTINCT FROM new_json->key
        );
    ELSIF TG_OP = 'INSERT' THEN
        old_json := NULL;
        new_json := to_jsonb(NEW);
        changed_fields := ARRAY(SELECT key FROM jsonb_object_keys(new_json) AS key);
    END IF;
    
    -- 插入审计日志
    INSERT INTO data_audit_log (
        table_name, record_id, operation_type,
        old_data, new_data, changed_fields,
        changed_by, ip_address, user_agent, session_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.record_id, OLD.record_id),
        TG_OP,
        old_json,
        new_json,
        changed_fields,
        CURRENT_USER,
        inet_client_addr(),
        current_setting('application.name', true),
        pg_backend_pid()::VARCHAR
    );
    
    -- 返回对应操作的结果
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER time_series_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON time_series_core
    FOR EACH ROW EXECUTE FUNCTION audit_time_series_changes();
```

### 审计查询示例

```sql
-- 1. 查询指定记录的历史变更
SELECT 
    changed_at,
    changed_by,
    operation_type,
    changed_fields,
    old_data,
    new_data
FROM data_audit_log
WHERE table_name = 'time_series_core'
  AND record_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY changed_at DESC;

-- 2. 查询指定人员的所有操作
SELECT 
    changed_at,
    table_name,
    operation_type,
    record_id,
    changed_fields
FROM data_audit_log
WHERE changed_by = 'EMP-001'
  AND changed_at >= NOW() - INTERVAL '7 days'
ORDER BY changed_at DESC;

-- 3. 查询敏感字段变更
SELECT 
    changed_at,
    changed_by,
    table_name,
    record_id,
    new_data->>'rgb_status' as new_status,
    old_data->>'risk_score' as old_risk
FROM data_audit_log
WHERE 'rgb_status' = ANY(changed_fields)
   OR 'risk_score' = ANY(changed_fields)
ORDER BY changed_at DESC;

-- 4. 数据变更趋势分析
SELECT 
    DATE(changed_at) as date,
    operation_type,
    COUNT(*) as count,
    COUNT(DISTINCT changed_by) as user_count
FROM data_audit_log
WHERE changed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(changed_at), operation_type
ORDER BY date DESC;
```

### 合规报告生成

```sql
-- 生成月度审计报告
CREATE OR REPLACE FUNCTION generate_audit_report(
    start_date DATE,
    end_date DATE
) RETURNS TABLE (
    report_date DATE,
    total_operations BIGINT,
    insert_count BIGINT,
    update_count BIGINT,
    delete_count BIGINT,
    unique_users BIGINT,
    sensitive_changes BIGINT
) AS 
$$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(dal.changed_at) as report_date,
        COUNT(*) as total_operations,
        COUNT(*) FILTER (WHERE dal.operation_type = 'INSERT') as insert_count,
        COUNT(*) FILTER (WHERE dal.operation_type = 'UPDATE') as update_count,
        COUNT(*) FILTER (WHERE dal.operation_type = 'DELETE') as delete_count,
        COUNT(DISTINCT dal.changed_by) as unique_users,
        COUNT(*) FILTER (
            WHERE dal.changed_fields && ARRAY['rgb_status', 'risk_score', 'cost']
        ) as sensitive_changes
    FROM data_audit_log dal
    WHERE dal.changed_at >= start_date
      AND dal.changed_at < end_date + INTERVAL '1 day'
    GROUP BY DATE(dal.changed_at)
    ORDER BY report_date DESC;
END;
$$ LANGUAGE plpgsql;

-- 使用示例
SELECT * FROM generate_audit_report(
    CURRENT_DATE - INTERVAL '1 month',
    CURRENT_DATE
);
```

---

## 安全监控

### 异常操作检测

```sql
-- 检测异常批量操作
CREATE OR REPLACE FUNCTION detect_anomalous_operations()
RETURNS TABLE (
    detection_time TIMESTAMP,
    user_id VARCHAR,
    operation_count INT,
    is_anomalous BOOLEAN,
    risk_level VARCHAR
) AS 
$$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            changed_by,
            COUNT(*) as operation_count,
            COUNT(DISTINCT table_name) as table_count,
            MAX(changed_at) as last_operation
        FROM data_audit_log
        WHERE changed_at >= NOW() - INTERVAL '1 hour'
        GROUP BY changed_by
    )
    SELECT 
        NOW() as detection_time,
        us.changed_by,
        us.operation_count,
        CASE 
            WHEN us.operation_count > 1000 THEN true
            WHEN us.table_count > 5 THEN true
            ELSE false
        END as is_anomalous,
        CASE 
            WHEN us.operation_count > 5000 THEN 'HIGH'
            WHEN us.operation_count > 1000 THEN 'MEDIUM'
            ELSE 'LOW'
        END as risk_level
    FROM user_stats us
    WHERE us.operation_count > 100
    ORDER BY us.operation_count DESC;
END;
$$ LANGUAGE plpgsql;
```
