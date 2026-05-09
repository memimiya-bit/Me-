# 性能优化规范

## 目录
- [查询性能优化](#查询性能优化)
- [写入性能优化](#写入性能优化)
- [缓存策略](#缓存策略)

---

## 查询性能优化

### 物化视图优化

#### 人员维度物化视图

```sql
CREATE MATERIALIZED VIEW person_dimension_view AS
SELECT 
    person_id,
    person_role,
    department,
    week_number,
    COUNT(*) as task_count,
    AVG(risk_score) as avg_risk_score,
    MAX(risk_score) as max_risk_score,
    STRING_AGG(DISTINCT rgb_status, ',') as status_summary,
    COUNT(DISTINCT project_id) as project_count
FROM time_series_core
WHERE week_number >= EXTRACT(WEEK FROM CURRENT_DATE) - 4
GROUP BY person_id, person_role, department, week_number
WITH DATA;

-- 创建唯一索引
CREATE UNIQUE INDEX idx_pdv_unique 
    ON person_dimension_view (person_id, week_number);

-- 创建刷新索引
CREATE INDEX idx_pdv_week ON person_dimension_view (week_number);
```

#### 项目维度物化视图

```sql
CREATE MATERIALIZED VIEW project_dimension_view AS
SELECT
    project_id,
    module_code,
    week_number,
    MAX(risk_score) as max_risk_score,
    AVG(risk_score) as avg_risk_score,
    MODE() WITHIN GROUP (ORDER BY rgb_status) as dominant_status,
    COUNT(*) as record_count,
    COUNT(DISTINCT person_id) as person_count,
    COUNT(DISTINCT sku_id) as sku_count
FROM time_series_core
WHERE week_number >= EXTRACT(WEEK FROM CURRENT_DATE) - 8
GROUP BY project_id, module_code, week_number
WITH DATA;

-- 创建唯一索引
CREATE UNIQUE INDEX idx_pmv_unique 
    ON project_dimension_view (project_id, module_code, week_number);

-- 创建刷新索引
CREATE INDEX idx_pmv_week ON project_dimension_view (week_number);
CREATE INDEX idx_pmv_module ON project_dimension_view (module_code);
```

### 自动刷新策略

```sql
-- 创建刷新函数
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS 
$$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY person_dimension_view;
    REFRESH MATERIALIZED VIEW CONCURRENTLY project_dimension_view;
END;
$$ LANGUAGE plpgsql;

-- 每日凌晨2点自动刷新
SELECT cron.schedule(
    'nightly_refresh', 
    '0 2 * * *', 
    'SELECT refresh_materialized_views()'
);

-- 手动刷新（紧急情况）
-- SELECT refresh_materialized_views();
```

### 高频查询模板

#### 1. 人员风险排名查询

```sql
-- 查询指定周内风险最高的人员
SELECT 
    person_id,
    person_role,
    department,
    AVG(risk_score) as avg_risk_score,
    MAX(risk_score) as max_risk_score,
    COUNT(CASE WHEN rgb_status = '🔴' THEN 1 END) as critical_count
FROM time_series_core
WHERE week_number = EXTRACT(WEEK FROM CURRENT_DATE) - 1
GROUP BY person_id, person_role, department
ORDER BY avg_risk_score DESC
LIMIT 20;
```

#### 2. 项目健康度查询

```sql
-- 查询指定项目的各模块健康度
WITH project_health AS (
    SELECT 
        project_id,
        module_code,
        AVG(risk_score) as risk_score,
        MODE() WITHIN GROUP (ORDER BY rgb_status) as status
    FROM time_series_core
    WHERE project_id = $1
      AND week_number >= EXTRACT(WEEK FROM CURRENT_DATE) - 4
    GROUP BY project_id, module_code
)
SELECT 
    ph.*,
    pm.project_name,
    pm.project_status,
    pm.deadline
FROM project_health ph
JOIN project_master pm ON ph.project_id = pm.project_id
ORDER BY ph.risk_score DESC;
```

#### 3. RGB状态分布查询

```sql
-- 查询各模块RGB状态分布
SELECT 
    module_code,
    rgb_status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY module_code), 2) as percentage
FROM time_series_core
WHERE week_number >= EXTRACT(WEEK FROM CURRENT_DATE) - 2
GROUP BY module_code, rgb_status
ORDER BY module_code, rgb_status;
```

---

## 写入性能优化

### 批量写入优化

```python
class BatchWriteOptimizer:
    def __init__(self):
        self.batch_size = 1000      # 最佳批量大小
        self.flush_interval = 5    # 秒
        self.write_buffer = []
        self.last_flush_time = time.time()
        self.max_retries = 3
        self.retry_delay = 1
    
    def add_record(self, record: dict) -> bool:
        """添加单条记录到缓冲区"""
        self.write_buffer.append(record)
        
        # 检查是否需要刷新
        if (len(self.write_buffer) >= self.batch_size or 
            time.time() - self.last_flush_time >= self.flush_interval):
            return self.flush_buffer()
        return True
    
    def flush_buffer(self) -> bool:
        """批量刷新缓冲区"""
        if not self.write_buffer:
            return True
        
        for attempt in range(self.max_retries):
            try:
                # 批量插入
                batch_insert(self.write_buffer)
                
                # 记录写入性能
                self.log_write_performance(len(self.write_buffer))
                
                # 清空缓冲区
                self.write_buffer = []
                self.last_flush_time = time.time()
                return True
                
            except Exception as e:
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                else:
                    self.handle_write_error(e)
                    return self.fallback_to_single_write()
        return False
    
    def fallback_to_single_write(self) -> bool:
        """降级到单条写入"""
        failed_records = self.write_buffer.copy()
        self.write_buffer = []
        
        success_count = 0
        for record in failed_records:
            if single_insert(record):
                success_count += 1
            else:
                self.log_failed_record(record)
        
        return success_count == len(failed_records)
```

### SQL批量写入

```sql
-- 批量插入语句
INSERT INTO time_series_core (
    record_id, person_id, person_role, department,
    week_number, calendar_date, season_factor,
    project_id, sku_id, module_code,
    data_payload, rgb_status, risk_score,
    data_source
)
VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14),
    ($15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28),
    -- ... 更多记录
ON CONFLICT (record_id) DO UPDATE SET
    data_payload = EXCLUDED.data_payload,
    rgb_status = EXCLUDED.rgb_status,
    risk_score = EXCLUDED.risk_score,
    updated_at = CURRENT_TIMESTAMP,
    version = time_series_core.version + 1;
```

### 并发写入控制

```sql
-- 使用 advisory lock 控制并发
CREATE OR REPLACE FUNCTION concurrent_batch_insert(
    records JSONB[]
)
RETURNS INT AS 
$$
DECLARE
    lock_key BIGINT := 1234567890;
    inserted_count INT := 0;
BEGIN
    -- 获取锁（等待最多5秒）
    IF NOT pg_try_advisory_lock(lock_key) THEN
        RAISE NOTICE 'Could not acquire lock, waiting...';
        PERFORM pg_advisory_lock(lock_key);
    END IF;
    
    BEGIN
        INSERT INTO time_series_core (...)
        SELECT * FROM jsonb_to_recordset($1) 
            AS t(...)
        ON CONFLICT (record_id) DO UPDATE SET ...;
        
        GET DIAGNOSTICS inserted_count = ROW_COUNT;
    EXCEPTION WHEN OTHERS THEN
        RAISE;
    END;
    
    PERFORM pg_advisory_unlock(lock_key);
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 缓存策略

### Redis缓存架构

```
┌─────────────────────────────────────────────────────────────┐
│                        应用层                               │
│           ↓ read          ↓ write                          │
├─────────────────────────────────────────────────────────────┤
│                      Redis 缓存层                           │
│  ├─ L1: 物化视图缓存 (TTL: 1h)                             │
│  ├─ L2: 高频查询结果缓存 (TTL: 5m)                         │
│  └─ L3: 单条记录缓存 (TTL: 30s)                           │
├─────────────────────────────────────────────────────────────┤
│                      PostgreSQL                            │
│           物化视图         时序核心表                       │
└─────────────────────────────────────────────────────────────┘
```

### 缓存键设计

```python
class CacheKeyBuilder:
    """缓存键构建器"""
    
    PREFIX = "qr:ts:"
    
    @classmethod
    def person_risk(cls, person_id: str, week: int) -> str:
        """人员风险缓存"""
        return f"{cls.PREFIX}person_risk:{person_id}:{week}"
    
    @classmethod
    def project_health(cls, project_id: str) -> str:
        """项目健康度缓存"""
        return f"{cls.PREFIX}project_health:{project_id}"
    
    @classmethod
    def module_status(cls, module: str, week: int) -> str:
        """模块状态分布缓存"""
        return f"{cls.PREFIX}module_status:{module}:{week}"
    
    @classmethod
    def dashboard_summary(cls) -> str:
        """仪表盘汇总缓存"""
        return f"{cls.PREFIX}dashboard:summary"
```

### 缓存失效策略

```python
def invalidate_cache(event_type: str, data: dict):
    """根据事件类型失效相关缓存"""
    
    if event_type == "record_update":
        # 失效相关的人和项目缓存
        keys = [
            CacheKeyBuilder.person_risk(data['person_id'], data['week_number']),
            CacheKeyBuilder.project_health(data['project_id']),
        ]
        redis.delete(*keys)
        
    elif event_type == "project_completed":
        # 失效项目所有相关缓存
        pattern = f"{CacheKeyBuilder.PREFIX}*:{data['project_id']}*"
        redis.delete(*redis.keys(pattern))
        
    elif event_type == "week_close":
        # 失效指定周的所有缓存
        pattern = f"{CacheKeyBuilder.PREFIX}*:{data['week_number']}"
        redis.delete(*redis.keys(pattern))
        
    # 总是失效仪表盘缓存
    redis.delete(CacheKeyBuilder.dashboard_summary())
```

---

## 性能监控

### 关键性能指标

| 指标 | 目标值 | 预警阈值 | 处理策略 |
|------|-------|---------|---------|
| 查询延迟 P50 | <100ms | >200ms | 检查索引 |
| 查询延迟 P95 | <500ms | >1s | 扩容只读副本 |
| 查询延迟 P99 | <2s | >5s | 分析慢查询 |
| 写入吞吐量 | >1000/s | <500/s | 优化批量策略 |
| 缓存命中率 | >90% | <80% | 优化缓存键 |
| 物化视图刷新时间 | <60s | >300s | 优化物化视图 |

### 慢查询日志

```sql
-- 启用慢查询日志
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- 1秒

-- 查询慢查询
SELECT 
    query,
    calls,
    mean_time,
    total_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 20;
```
