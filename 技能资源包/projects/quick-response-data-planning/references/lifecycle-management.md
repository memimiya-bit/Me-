# 数据生命周期管理

## 目录
- [分层存储架构](#分层存储架构)
- [自动迁移规则](#自动迁移规则)
- [归档策略](#归档策略)

---

## 分层存储架构

### 四层存储模型

```
┌────────────────────────────────────────────────────────────────┐
│                         活跃层 (Hot)                           │
│  最近7天数据 | 全字段 | 实时查询 | BRIN索引                   │
├────────────────────────────────────────────────────────────────┤
│                         热数据层 (Warm)                        │
│  8-30天数据 | 核心字段 | 报表查询 | B-Tree索引                │
├────────────────────────────────────────────────────────────────┤
│                         冷数据层 (Cold)                        │
│  31-180天数据 | 汇总字段 | 分析查询 | 位图索引                │
├────────────────────────────────────────────────────────────────┤
│                         归档层 (Archive)                      │
│  180天+数据 | 基础字段 | 审计追溯 | 压缩存储                  │
└────────────────────────────────────────────────────────────────┘
```

### 各层特征

| 层级 | 数据范围 | 字段保留 | 查询性能 | 存储成本 |
|------|---------|---------|---------|---------|
| 活跃层 | 0-7天 | 全字段 | <100ms | 高 |
| 热数据层 | 8-30天 | 全字段 | <500ms | 中 |
| 冷数据层 | 31-180天 | 核心字段 | <2s | 低 |
| 归档层 | 180天+ | 基础字段 | <10s | 极低 |

---

## 自动迁移规则

### 迁移触发条件

```sql
-- 活跃层 → 热数据层（7天后）
-- 条件：最后更新时间 > 7天
CREATE OR REPLACE FUNCTION migrate_hot_to_warm()
RETURNS void AS 
$$
BEGIN
    INSERT INTO time_series_core_warm
    SELECT * FROM time_series_core 
    WHERE updated_at < NOW() - INTERVAL '7 days';
    
    DELETE FROM time_series_core 
    WHERE updated_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 热数据层 → 冷数据层（30天后）
-- 条件：最后更新时间 > 30天
CREATE OR REPLACE FUNCTION migrate_warm_to_cold()
RETURNS void AS 
$$
BEGIN
    INSERT INTO time_series_core_cold
    SELECT record_id, person_id, department, week_number,
           calendar_date, project_id, module_code,
           rgb_status, risk_score, created_at
    FROM time_series_core_warm
    WHERE updated_at < NOW() - INTERVAL '30 days';
    
    DELETE FROM time_series_core_warm 
    WHERE updated_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 冷数据层 → 归档层（180天后）
-- 条件：calendar_date + 180天 < 当前日期
CREATE OR REPLACE FUNCTION migrate_cold_to_archive()
RETURNS void AS 
$$
BEGIN
    INSERT INTO time_series_core_archive
    SELECT record_id, person_id, department, week_number,
           calendar_date, project_id, module_code,
           rgb_status, created_at
    FROM time_series_core_cold
    WHERE calendar_date < CURRENT_DATE - INTERVAL '180 days';
    
    DELETE FROM time_series_core_cold 
    WHERE calendar_date < CURRENT_DATE - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;
```

### 项目完成数据自动归档

```sql
-- 项目状态为已完成且完成时间 > 90天，自动归档
CREATE OR REPLACE FUNCTION archive_completed_projects()
RETURNS void AS 
$$
BEGIN
    INSERT INTO time_series_core_archive
    SELECT tsc.*
    FROM time_series_core tsc
    JOIN project_master pm ON tsc.project_id = pm.project_id
    WHERE pm.status = 'completed'
      AND pm.completed_at < NOW() - INTERVAL '90 days';
    
    DELETE FROM time_series_core tsc
    WHERE EXISTS (
        SELECT 1 FROM project_master pm
        WHERE pm.project_id = tsc.project_id
          AND pm.status = 'completed'
          AND pm.completed_at < NOW() - INTERVAL '90 days'
    );
END;
$$ LANGUAGE plpgsql;
```

### 定时任务配置

```sql
-- 使用pg_cron调度迁移任务
SELECT cron.schedule(
    'hot_to_warm', 
    '0 3 * * *',  -- 每天凌晨3点
    'SELECT migrate_hot_to_warm()'
);

SELECT cron.schedule(
    'warm_to_cold',
    '0 4 * * *',  -- 每天凌晨4点
    'SELECT migrate_warm_to_cold()'
);

SELECT cron.schedule(
    'cold_to_archive',
    '0 5 * * *',  -- 每天凌晨5点
    'SELECT migrate_cold_to_archive()'
);

SELECT cron.schedule(
    'archive_completed_projects',
    '0 2 * * *',  -- 每天凌晨2点
    'SELECT archive_completed_projects()'
);
```

---

## 归档策略

### 服装行业特殊归档规则

| 数据类型 | 归档周期 | 说明 |
|---------|---------|------|
| 工艺单 | 季节+2年 | 过季+2年归档 |
| 质检报告 | 3年 | 法规要求 |
| 合同文件 | 5年 | 合同有效期+2年 |
| 财务数据 | 7年 | 税务要求 |
| 历史项目 | 180天 | 项目完成后180天 |

### 归档表结构

```sql
-- 归档表（压缩存储）
CREATE TABLE time_series_core_archive (
    record_id UUID,
    person_id VARCHAR(50),
    department VARCHAR(30),
    week_number INT,
    calendar_date DATE,
    project_id VARCHAR(50),
    module_code VARCHAR(10),
    rgb_status VARCHAR(10),
    created_at TIMESTAMP,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archive_reason VARCHAR(50)
) PARTITION BY RANGE (calendar_date);

-- 按年分区
CREATE TABLE time_series_core_archive_2024 
    PARTITION OF time_series_core_archive
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE time_series_core_archive_2025 
    PARTITION OF time_series_core_archive
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 数据恢复机制

```sql
-- 从归档层恢复数据到活跃层
CREATE OR REPLACE FUNCTION restore_from_archive(
    p_record_ids UUID[]
)
RETURNS void AS 
$$
BEGIN
    INSERT INTO time_series_core
    SELECT * FROM time_series_core_archive
    WHERE record_id = ANY(p_record_ids);
    
    DELETE FROM time_series_core_archive
    WHERE record_id = ANY(p_record_ids);
END;
$$ LANGUAGE plpgsql;
```

### 多时区支持

```sql
-- 所有时间字段存储UTC时间
ALTER TABLE time_series_core 
    ALTER COLUMN created_at SET DATA TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

-- 工厂时区配置表
CREATE TABLE factory_timezone (
    factory_id VARCHAR(50) PRIMARY KEY,
    factory_name VARCHAR(100),
    timezone VARCHAR(50),           -- 如 'Asia/Ho_Chi_Minh'
    timezone_offset VARCHAR(10),    -- 如 '+07:00'
    local_milestone_deadline TIMESTAMPTZ
);

-- 查询时转换时区
SELECT 
    tsc.*,
    ft.timezone,
    tsc.calendar_date AT TIME ZONE ft.timezone AS local_date
FROM time_series_core tsc
JOIN factory_timezone ft ON tsc.factory_id = ft.factory_id;
```

---

## 数据保留策略

### 各类数据保留周期

```sql
CREATE TABLE retention_policy (
    data_category VARCHAR(50) PRIMARY KEY,
    retention_days INT NOT NULL,
    archive_trigger_days INT,
    deletion_allowed BOOLEAN DEFAULT false,
    legal_requirement VARCHAR(100),
    description TEXT
);

INSERT INTO retention_policy (data_category, retention_days, archive_trigger_days, deletion_allowed, legal_requirement, description)
VALUES 
    ('工艺单', 730, 365, false, '合同法', '过季+2年'),
    ('质检报告', 1095, 730, false, '产品质量法', '3年'),
    ('合同文件', 1825, 1095, false, '合同法', '5年'),
    ('财务数据', 2555, 1825, false, '税法', '7年'),
    ('时序业务数据', 180, 90, true, null, '180天'),
    ('审计日志', 2555, 1825, false, '审计法', '7年');
```

---

## 监控指标

| 指标 | 告警阈值 | 说明 |
|------|---------|------|
| 活跃层数据量 | >80%容量 | 扩容预警 |
| 归档延迟 | >24h | 迁移任务异常 |
| 查询响应时间 | >2s | 性能预警 |
| 存储使用率 | >90% | 存储预警 |
