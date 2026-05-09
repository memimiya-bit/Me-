# 协同机制与行业保障

## 目录

- [双库协同机制](#双库协同机制)
- [快反供应链触发](#快反供应链触发)
- [跨季成本分析](#跨季成本分析)
- [ESG风险阻断](#esg风险阻断)
- [行业特需保障措施](#行业特需保障措施)

---

## 双库协同机制

### 数据联动架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         双库联动架构                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   project_node_db                    org_collab_db                   │
│   ┌─────────────────┐              ┌─────────────────┐              │
│   │ project_master   │───project_id──│ collab_instance │              │
│   │                 │              │                 │              │
│   │ node_mapping    │───entity_id──│                 │              │
│   │                 │              │                 │              │
│   │ project_bom     │              │ org_collab_     │              │
│   │                 │              │ agreement       │              │
│   └────────┬────────┘              └────────┬────────┘              │
│            │                                │                        │
│            │           ┌───────────────┐   │                        │
│            └───────────┤ supply_chain_ │───┘                        │
│                        │ mapping       │                             │
│                        └───────────────┘                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 联动关键点

| 联动场景 | 触发条件 | 联动结果 |
|----------|----------|----------|
| 快反供应链触发 | collab_instance.response_time > 4h | 自动创建快反项目 |
| 跨季成本分析 | 对比不同季节的 data_exchange_std | 成本差异报告 |
| ESG风险阻断 | relationship_history 含 ESG 违规 | 锁定关联项目 |
| 节点协作升级 | node_mapping.escalation_count > 3 | 创建专项协作协议 |
| BOM价格锁定 | project_bom.is_frozen = true | 禁止修改原料快照 |

---

## 快反供应链触发

### 触发流程

```
直播爆款补货请求
        │
        ▼
collab_instance 创建
trigger_event = "直播爆款补货"
        │
        ▼
response_time > 4h ?
        │
   YES  │  NO
    │    │
    ▼    ▼
自动创建快反项目     正常记录
    │
    ▼
project_master.project_type = "快反款"
project_master.season_code = 当前季节
    │
    ▼
node_mapping 快速绑定协作节点
    │
    ▼
project_bom 简化配置
    │
    ▼
通知相关团队
```

### 快反项目配置

| 配置项 | 快反模式 | 说明 |
|--------|----------|------|
| project_type | 快反款 | 快速响应类型 |
| season_code | 当前季节 | 临时季节代码 |
| min_response_time_hours | 2 | 快反响应要求 |
| sla_warning_threshold | 80% | SLA告警阈值 |
| is_backup | true | 启用备选节点 |

### 自动创建脚本逻辑

```python
def trigger_fast_reaction_project(instance):
    """快反供应链触发"""
    if instance.trigger_event == "直播爆款补货" and \
       instance.response_time_hours > 4:
        
        # 创建快反项目
        project = {
            "project_id": generate_project_id("FR"),
            "project_type": "快反款",
            "season_code": get_current_season(),
            "project_status": "规划中",
            "related_instance_id": instance.instance_id
        }
        
        # 快速绑定节点
        node_mapping = {
            "project_id": project["project_id"],
            "node_type": "中游",
            "node_role": "主责方",
            "milestone_deadline": datetime.now() + timedelta(hours=48)
        }
        
        return project, node_mapping
```

---

## 跨季成本分析

### 分析维度

| 维度 | 说明 |
|------|------|
| 季节对比 | SS24 vs AW24 同类型项目成本 |
| 协议对比 | 不同 data_exchange_std 的成本差异 |
| 节点对比 | 不同供应商/工厂的成本结构 |
| 趋势分析 | 成本随季节的变化趋势 |

### 成本对比SQL

```sql
-- 跨季原料成本对比
SELECT 
    pm.season_code,
    pm.project_type,
    AVG(pb.total_material_cost) as avg_material_cost,
    COUNT(*) as project_count
FROM project_master pm
JOIN project_bom pb ON pm.project_id = pb.project_id
WHERE pm.project_type = '主线款'
  AND pm.season_code IN ('SS24', 'AW24')
  AND pm.project_status IN ('已结束', '已上市')
GROUP BY pm.season_code, pm.project_type
ORDER BY pm.season_code;

-- 协作成本对比
SELECT 
    oca.agreement_type,
    oca.data_exchange_std,
    pm.season_code,
    AVG(oca.agreement_value) as avg_agreement_value,
    AVG(ci.response_time_hours) as avg_response_time
FROM org_collab_agreement oca
JOIN collab_instance ci ON oca.agreement_id = ci.agreement_id
JOIN project_master pm ON ci.related_project_id = pm.project_id
WHERE pm.season_code IN ('SS24', 'AW24')
GROUP BY oca.agreement_type, oca.data_exchange_std, pm.season_code;
```

### 成本分析报告结构

```json
{
  "report_type": "跨季成本分析",
  "period": "SS24 vs AW24",
  "summary": {
    "total_projects": 24,
    "total_cost_ss24": 15000000,
    "total_cost_aw24": 18000000,
    "cost_change_rate": 20.0
  },
  "by_project_type": {
    "主线款": {
      "ss24_avg": 500000,
      "aw24_avg": 600000,
      "change_rate": 20.0
    },
    "快反款": {
      "ss24_avg": 100000,
      "aw24_avg": 150000,
      "change_rate": 50.0
    }
  },
  "by_exchange_std": {
    "API": {"avg_response_time": 2.5, "avg_cost": 50000},
    "EDI": {"avg_response_time": 8.0, "avg_cost": 80000}
  }
}
```

---

## ESG风险阻断

### ESG风险类型

| 风险类型 | 说明 | 触发规则 |
|----------|------|----------|
| ZDHC化学品超标 | 化学品管控不合规 | ZDHC审计不通过 |
| 劳工违规 | 工人权益保障问题 | SA8000审计不通过 |
| 环保处罚 | 环境污染问题 | 环保部门处罚记录 |
| 碳排放超标 | 碳足迹超过配额 | carbon_budget 超限 |

### 阻断流程

```
relationship_history 新增记录
        │
        │ esg_violation = true
        ▼
锁定相关协议
        │
        ▼
查询受影响项目
        │
        ▼
暂停项目执行
        │
        ▼
通知相关团队
        │
        ▼
启动风险评估
        │
        ▼
等待整改确认
        │
   整改完成   │  整改失败
    │        │
    ▼        ▼
恢复项目    终止合作
```

### ESG风险阻断SQL

```sql
-- 查询需要阻断的项目
SELECT DISTINCT
    pm.project_id,
    pm.project_name,
    rh.change_reason,
    rh.esg_violation_type,
    pm.project_status
FROM relationship_history rh
JOIN org_collab_agreement oca ON rh.agreement_id = oca.agreement_id
JOIN collab_instance ci ON oca.agreement_id = ci.agreement_id
JOIN project_master pm ON ci.related_project_id = pm.project_id
WHERE rh.esg_violation = true
  AND pm.project_status IN ('开发中', '打样中', '大货中')
  AND pm.active_status = true;

-- 批量锁定项目
UPDATE project_master
SET project_status = '已暂停',
    notes = CONCAT(notes, ' [ESG风险阻断-', CURRENT_DATE, ']')
WHERE project_id IN (
    SELECT DISTINCT related_project_id
    FROM collab_instance
    WHERE agreement_id IN (
        SELECT agreement_id
        FROM relationship_history
        WHERE esg_violation = true
          AND valid_from <= CURRENT_DATE
          AND valid_to >= CURRENT_DATE
    )
);
```

---

## 行业特需保障措施

### 季节性数据归档

#### 归档规则

| 规则 | 说明 | 配置 |
|------|------|------|
| 归档周期 | 上市日期 + 180天 | archive_rule |
| 归档条件 | project_status = 已结束/已取消 | status_filter |
| 归档位置 | 冷库存储 | archive_storage |
| 保留周期 | 永久保留 | retention_period |

#### 归档配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| archive_rule_id | text | 规则ID |
| archive_condition | text | 归档条件（JSON） |
| archive_after_days | integer | 归档等待天数 |
| archive_storage_path | text | 归档存储路径 |
| archive_enabled | boolean | 是否启用 |
| archive_schedule | text | 执行周期 |

#### 归档SQL

```sql
-- 自动归档过期项目
INSERT INTO project_archive
SELECT *, CURRENT_TIMESTAMP as archived_at
FROM project_master
WHERE (launch_date + INTERVAL 180 DAY) < CURRENT_DATE
  AND project_status IN ('已结束', '已取消')
  AND is_archived = false;

-- 更新归档标记
UPDATE project_master
SET is_archived = true,
    archive_date = CURRENT_DATE
WHERE project_id IN (
    SELECT project_id FROM project_archive
    WHERE archived_at >= CURRENT_DATE - INTERVAL 1 DAY
);
```

### 多时区支持

#### 时区配置

| 时区代码 | 时区名称 | 覆盖区域 |
|----------|----------|----------|
| UTC | 协调世界时 | 基准时间 |
| CST | 中国标准时间 | 中国大陆 |
| ICT | 印度支那时间 | 越南、柬埔寨 |
| IST | 印度标准时间 | 印度 |
| JST | 日本标准时间 | 日本 |
| KST | 韩国标准时间 | 韩国 |

#### 多时区存储规范

```json
{
  "milestone_deadline": "2024-05-15T17:00:00Z",
  "milestone_local_time": "2024-05-15T23:00:00+07:00",
  "milestone_timezone": "ICT",
  "timezone_note": "越南工厂当地时间"
}
```

#### 时区转换示例

```python
from datetime import datetime
from zoneinfo import ZoneInfo

def convert_to_utc(local_time, timezone):
    """本地时间转UTC"""
    tz = ZoneInfo(timezone)
    local_dt = datetime.fromisoformat(local_time, tz)
    return local_dt.astimezone(ZoneInfo('UTC')).isoformat()

def convert_to_local(utc_time, timezone):
    """UTC转本地时间"""
    tz = ZoneInfo(timezone)
    utc_dt = datetime.fromisoformat(utc_time)
    local_dt = utc_dt.astimezone(tz)
    return local_dt.isoformat()

# 示例
utc_time = "2024-05-15T10:00:00Z"
ict_time = convert_to_local(utc_time, "Asia/Ho_Chi_Minh")
# 输出: 2024-05-15T17:00:00+07:00
```

### 牛鞭效应控制机制

#### 监控指标

| 指标 | 计算公式 | 正常范围 | 告警阈值 |
|------|----------|----------|----------|
| 需求波动系数 | Var(订单量) / Var(需求量) | 1.0-1.3 | > 1.5 |
| 补货延迟指数 | 平均补货周期 / 目标补货周期 | 1.0-1.2 | > 1.5 |
| 库存偏差率 | 实际库存 / 预测库存 | 0.9-1.1 | < 0.8 或 > 1.2 |

#### 控制规则

| 条件 | 触发动作 |
|------|----------|
| bullwhip_indicator > 1.5 | 启动需求平滑算法 |
| 补货延迟 > 50% | 增加安全库存 |
| 连续3次超量订单 | 核实需求真实性 |

#### 牛鞭效应监控SQL

```sql
-- 计算牛鞭效应指标
WITH demand_data AS (
    SELECT 
        DATE_TRUNC('week', from_timestamp) as week,
        SUM(data_payload->>'quantity') as demand,
        COUNT(*) as order_count
    FROM collab_instance
    WHERE trigger_event = '补货请求'
    GROUP BY DATE_TRUNC('week', from_timestamp)
),
calculated_indicators AS (
    SELECT 
        week,
        demand,
        order_count,
        LAG(demand) OVER (ORDER BY week) as prev_demand,
        VAR_POP(demand) OVER () as demand_variance,
        VAR_POP(order_count) OVER () as order_variance
    FROM demand_data
)
SELECT 
    week,
    demand_variance / NULLIF(order_variance, 0) as bullwhip_indicator
FROM calculated_indicators
WHERE demand_variance / NULLIF(order_variance, 0) > 1.5;
```

---

## 监控与告警配置

### 关键告警规则

| 告警类型 | 条件 | 级别 | 通知方式 |
|----------|------|------|----------|
| 项目延期 | milestone_deadline < 当前日期且status != 已完成 | 高 | 邮件+短信 |
| SLA违约 | response_time > max_response_time_hours | 高 | 邮件+即时消息 |
| ESG风险 | esg_violation = true | 紧急 | 电话+邮件 |
| 快反超时 | response_time > 4h 且 trigger_event = 直播爆款补货 | 高 | 邮件+即时消息 |
| 协议到期 | effective_end - 当前日期 < 30天 | 中 | 邮件 |
| 归档预警 | 满足归档条件但未归档 | 低 | 邮件 |

### 监控报表

| 报表名称 | 频率 | 内容 |
|----------|------|------|
| 项目进度日报 | 每日 | 里程碑完成情况 |
| SLA达成周报 | 每周 | SLA达成率统计 |
| 成本分析月报 | 每月 | 跨季成本对比 |
| ESG风险季报 | 每季 | ESG合规状态 |
| 归档状态年报 | 每年 | 数据归档情况 |
