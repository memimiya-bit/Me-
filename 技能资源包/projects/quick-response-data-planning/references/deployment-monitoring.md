# 部署与监控规范

## 目录
- [部署架构](#部署架构)
- [监控指标](#监控指标)
- [灾难恢复](#灾难恢复)
- [运维流程](#运维流程)

---

## 部署架构

### 生产环境拓扑

```
┌────────────────────────────────────────────────────────────────────┐
│                         应用服务器集群                              │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ API节点1 │  │ API节点2 │  │ API节点3 │  │ API节点4 │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│  ├─ API服务 (4节点，负载均衡)                                      │
│  ├─ 批处理服务 (2节点)                                             │
│  └─ 实时计算服务 (2节点)                                           │
├────────────────────────────────────────────────────────────────────┤
│                         数据库集群                                  │
├────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL 14 + TimescaleDB 主集群             │   │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐                  │   │
│  │  │ 读写节点 │────│ 只读副本 │────│ 只读副本 │                  │   │
│  │  │  (主)   │    │  (从1)  │    │  (从2)  │                  │   │
│  │  └─────────┘    └─────────┘    └─────────┘                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ├─ Redis Cluster (缓存层)                                         │
│  ├─ Elasticsearch Cluster (搜索/日志)                             │
│  └─ MinIO (数据湖/归档存储)                                       │
├────────────────────────────────────────────────────────────────────┤
│                         监控告警系统                                │
├────────────────────────────────────────────────────────────────────┤
│  ├─ Prometheus (时序监控)                                         │
│  ├─ Grafana (可视化仪表盘)                                        │
│  ├─ AlertManager (告警管理)                                       │
│  └─ ELK Stack (日志分析)                                          │
└────────────────────────────────────────────────────────────────────┘
```

### 组件规格

| 组件 | 规格 | 数量 | 用途 |
|------|------|------|------|
| API节点 | 8C16G | 4 | 业务接口 |
| 批处理节点 | 16C32G | 2 | 数据处理 |
| 实时计算节点 | 8C16G | 2 | 流式计算 |
| PostgreSQL主节点 | 32C64G, 2TB SSD | 1 | 读写 |
| PostgreSQL只读节点 | 32C64G, 2TB SSD | 2 | 读负载 |
| Redis Cluster | 8C16G | 3主3从 | 缓存 |
| Elasticsearch | 16C32G | 3节点 | 日志搜索 |
| MinIO | 8C16G | 4节点 | 对象存储 |

### TimescaleDB配置

```sql
-- 启用TimescaleDB扩展
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 将时序表转换为超表
SELECT create_hypertable(
    'time_series_core', 
    'calendar_date',
    chunk_time_interval => INTERVAL '1 week',
    migrate_data => true
);

-- 创建压缩策略
ALTER TABLE time_series_core SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'project_id'
);

-- 添加压缩策略（1周后压缩）
SELECT add_compression_policy(
    'time_series_core', 
    INTERVAL '7 days'
);

-- 添加连续聚合（每小时汇总）
CREATE MATERIALIZED VIEW hour_summary
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', created_at) as hour,
    module_code,
    rgb_status,
    COUNT(*) as record_count,
    AVG(risk_score) as avg_risk_score
FROM time_series_core
GROUP BY 1, 2, 3
WITH NO DATA;

SELECT add_continuous_aggregate_policy(
    'hour_summary',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour'
);
```

---

## 监控指标

### 数据库性能监控

```sql
-- 监控查询性能
SELECT 
    query,
    calls,
    mean_time,
    total_time,
    rows,
    shared_blks_hit,
    shared_blks_read
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- 监控连接数
SELECT 
    state,
    COUNT(*) as count,
    MAX(now() - state_change) as max_duration
FROM pg_stat_activity
GROUP BY state;

-- 监控表膨胀
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    n_live_tup,
    n_dead_tup,
    CASE WHEN n_live_tup > 0 
         THEN ROUND(100.0 * n_dead_tup / n_live_tup, 2)
         ELSE 0 
    END as dead_tup_pct
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 业务指标监控

```sql
-- RGB状态分布
SELECT 
    module_code,
    rgb_status,
    COUNT(*) as count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY module_code), 2) as pct
FROM time_series_core
WHERE week_number >= EXTRACT(WEEK FROM CURRENT_DATE) - 2
GROUP BY module_code, rgb_status;

-- 风险评分趋势
SELECT 
    week_number,
    AVG(risk_score) as avg_risk,
    MAX(risk_score) as max_risk,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY risk_score) as p95_risk
FROM time_series_core
WHERE week_number >= EXTRACT(WEEK FROM CURRENT_DATE) - 8
GROUP BY week_number
ORDER BY week_number;

-- 人员负载分布
SELECT 
    department,
    person_role,
    COUNT(DISTINCT person_id) as person_count,
    AVG(task_count) as avg_tasks_per_person
FROM (
    SELECT 
        department,
        person_role,
        person_id,
        COUNT(*) as task_count
    FROM time_series_core
    WHERE week_number = EXTRACT(WEEK FROM CURRENT_DATE)
    GROUP BY department, person_role, person_id
) t
GROUP BY department, person_role;
```

### Prometheus告警规则

```yaml
# prometheus-alerts.yml
groups:
  - name: quick_response_alerts
    rules:
      # 数据库性能
      - alert: DatabaseQueryLatencyHigh
        expr: pg_stat_statements_mean_time > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "数据库查询延迟过高"
          description: "P95查询延迟: {{ $value }}s"
      
      # 数据质量
      - alert: DataIntegrityIssue
        expr: data_quality_score < 0.95
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "数据完整性问题"
          description: "数据完整率: {{ $value }}"
      
      # 业务指标
      - alert: HighRedLightRatio
        expr: |
          (COUNT(DISTINCT project_id) FILTER WHERE rgb_status = '🔴') 
          / COUNT(DISTINCT project_id) > 0.2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "红灯项目占比过高"
          description: "红灯项目占比: {{ $value | humanizePercentage }}"
```

---

## 灾难恢复

### 备份策略

```bash
#!/bin/bash
# backup.sh

# 每日全量备份（凌晨1点）
0 1 * * * pg_dump -Fc -f /backup/full_backup_$(date +%Y%m%d).dump qr_db

# 每小时增量备份（除凌晨1点外）
30 * * * * pg_basebackup -Xf -P -Ft -D /backup/incremental_$(date +%Y%m%d_%H%M%S)

# 跨地域复制
30 2 * * * rsync -avz /backup/* backup-server:/异地备份路径/

# 备份保留策略
find /backup -name "full_*.dump" -mtime +7 -delete
find /backup -name "incremental_*" -mtime +30 -delete
```

### RPO/RTO目标

| 指标 | 目标值 | 说明 |
|------|-------|------|
| RPO | ≤5分钟 | 恢复点目标，最多丢失5分钟数据 |
| RTO | ≤30分钟 | 恢复时间目标，30分钟内恢复服务 |

### 故障切换流程

```sql
-- 主数据库故障检测
SELECT pg_is_in_recovery();

-- 触发故障切换
-- 1. 停止主库写入
-- 2. 提升从库为主库
SELECT pg_ctl promote -D /data/primary

-- 3. 更新连接字符串
-- host=新的主库地址 port=5432 dbname=qr_db

-- 4. 验证数据一致性
SELECT 
    pg_current_wal_lsn() as primary_lsn,
    pg_last_wal_receive_lsn() as replica_lsn;
```

### 演练计划

```yaml
# 每年4次演练
drill_schedule:
  - Q1: 单节点故障演练
  - Q2: 全量数据恢复演练
  - Q3: 跨地域切换演练
  - Q4: 综合灾难恢复演练

# 演练内容
drill_content:
  - 模拟主库宕机
  - 触发自动故障切换
  - 验证数据完整性
  - 测量RTO实际值
  - 恢复主库服务
  - 生成演练报告
```

---

## 运维流程

### 变更管理

```sql
-- 变更记录表
CREATE TABLE deployment_log (
    id SERIAL PRIMARY KEY,
    change_type VARCHAR(50),
    change_description TEXT,
    executed_by VARCHAR(50),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rollback_script TEXT,
    status VARCHAR(20) DEFAULT 'pending'
);

-- 记录Schema变更
CREATE OR REPLACE FUNCTION log_schema_change()
RETURNS event_trigger AS 
$$
BEGIN
    INSERT INTO deployment_log (change_type, change_description, executed_by)
    SELECT 
        'SCHEMA_CHANGE',
        tg_tag || ' on ' || object_identity,
        session_user
    FROM pg_event_trigger_ddl_commands();
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER schema_change_logger
    ON ddl_command_end
    EXECUTE FUNCTION log_schema_change();
```

### 容量规划

```sql
-- 数据增长预测
WITH weekly_growth AS (
    SELECT 
        week_number,
        COUNT(*) as record_count,
        pg_size_pretty(pg_total_relation_size('time_series_core')) as total_size
    FROM time_series_core
    WHERE week_number >= EXTRACT(WEEK FROM CURRENT_DATE) - 12
    GROUP BY week_number
)
SELECT 
    week_number,
    record_count,
    total_size,
    LAG(record_count) OVER (ORDER BY week_number) as prev_count,
    record_count - LAG(record_count) OVER (ORDER BY week_number) as growth,
    ROUND(100.0 * (record_count - LAG(record_count) OVER (ORDER BY week_number)) 
          / NULLIF(LAG(record_count) OVER (ORDER BY week_number), 0), 2) as growth_rate
FROM weekly_growth
ORDER BY week_number;

-- 存储容量预测
SELECT 
    current_size,
    weekly_growth_rate,
    days_until_full,
    recommended_action
FROM (
    SELECT 
        pg_size_pretty(pg_total_relation_size('time_series_core')) as current_size,
        (SELECT COUNT(*) FROM time_series_core WHERE week_number >= EXTRACT(WEEK FROM CURRENT_DATE) - 4) / 4 as avg_weekly_records,
        2 * 1024 * 1024 * 1024 * 1024 as total_capacity_bytes,
        CASE 
            WHEN days_until_full < 90 THEN '立即扩容'
            WHEN days_until_full < 180 THEN '计划扩容'
            ELSE '容量充足'
        END as recommended_action
    FROM (
        SELECT 
            (2 * 1024 * 1024 * 1024 * 1024 - pg_total_relation_size('time_series_core')) 
            / NULLIF((SELECT COUNT(*) FROM time_series_core WHERE week_number >= EXTRACT(WEEK FROM CURRENT_DATE) - 4) / 28.0 * 1024 * 1024, 0) as days_until_full
    ) t
) result;
```

---

## 运维检查清单

### 每日检查

- [ ] 数据库连接数 < 80% 最大连接数
- [ ] 慢查询数量 < 10
- [ ] 物化视图刷新成功
- [ ] 备份任务完成
- [ ] 告警数量 < 阈值

### 每周检查

- [ ] 磁盘使用率 < 70%
- [ ] 索引使用情况
- [ ] 表膨胀情况
- [ ] 物化视图命中率
- [ ] 缓存命中率

### 每月检查

- [ ] 容量规划评估
- [ ] 性能趋势分析
- [ ] 安全审计
- [ ] 变更回顾
- [ ] 灾难恢复演练
