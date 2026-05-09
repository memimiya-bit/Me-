# 项目节点数据库

## 目录

- [project_master（项目主表）](#project_master项目主表)
- [node_mapping（节点映射表）](#node_mapping节点映射表)
- [project_bom（项目物料清单表）](#project_bom项目物料清单表)

---

## project_master（项目主表）

**表描述：** 以产品季/项目周期为单位管理项目主数据，使用 season_code 实现季节性隔离

**主键：** project_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| project_id | text | 是 | 项目唯一ID |
| project_name | text | 是 | 项目名称 |
| season_code | text | 是 | 季节代码（SS24/AW25） |
| project_type | enum | 是 | 项目类型 |
| launch_date | date | 是 | 上市日期 |
| target_turnover | decimal(18,2) | 否 | 目标营业额 |
| target_margin | decimal(5,2) | 否 | 目标毛利率（%） |
| responsible_dept | text | 是 | 主责部门 |
| project_manager | text | 否 | 项目经理ID |
| brand_id | text | 否 | 关联品牌ID |
| style_count | integer | 否 | 款数 |
| sku_count | integer | 否 | SKU数 |
| budget_allocated | decimal(18,2) | 否 | 预算金额 |
| actual_cost | decimal(18,2) | 否 | 实际成本 |
| cost_variance | decimal(10,2) | 否 | 成本差异（%） |
| progress | decimal(5,2) | 否 | 项目进度（%） |
| project_status | enum | 是 | 项目状态 |
| priority | enum | 否 | 优先级 |
| risk_level | enum | 否 | 风险等级 |
| sustainability_goal | integer | 否 | 可持续目标（%） |
| carbon_budget | decimal(10,2) | 否 | 碳预算（kg CO2） |
| quality_target | decimal(5,2) | 否 | 质量目标（%） |
| dt_kickoff | date | 否 | 启动日期 |
| dt_sample_confirmed | date | 否 | 样衣确认日期 |
| dt_production_start | date | 否 | 大货开始日期 |
| dt_shipment | date | 否 | 出货日期 |
| dt_launch | date | 否 | 上市日期 |
| is_archived | boolean | 否 | 是否归档 |
| archive_date | date | 否 | 归档日期 |
| related_project_ids | text | 否 | 关联项目ID列表（JSON） |
| notes | text | 否 | 备注 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

season_code:
- SS24（2024春夏）
- AW24（2024秋冬）
- SS25（2025春夏）
- AW25（2025秋冬）
- FY24（2024全年款）

project_type:
- 主线款
- 快反款
- 联名款
- 特卖款
- 定制款

project_status:
- 规划中
- 开发中
- 打样中
- 大货中
- 已出货
- 已上市
- 已结束
- 已取消

priority:
- P0（紧急）
- P1（高）
- P2（中）
- P3（低）

risk_level:
- 高风险
- 中风险
- 低风险

**索引：**
- 主索引：project_id
- 普通索引：season_code
- 普通索引：project_type
- 普通索引：project_status
- 普通索引：launch_date
- 普通索引：responsible_dept

**关系：**
- 1:N → node_mapping（项目-节点映射）
- 1:N → project_bom（项目-BOM）
- N:1 → org_governance（部门关联）

---

## node_mapping（节点映射表）

**表描述：** 动态绑定产业链节点与项目，实现项目周期内的节点角色管理

**主键：** mapping_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| mapping_id | text | 是 | 映射ID |
| project_id | text | 是 | 关联项目ID |
| node_type | enum | 是 | 节点类型 |
| entity_id | text | 是 | 关联实体ID |
| entity_name | text | 是 | 实体名称 |
| node_role | enum | 是 | 节点角色 |
| responsibility | text | 否 | 责任描述 |
| milestone_deadline | datetime | 是 | 里程碑截止时间 |
| milestone_timezone | text | 否 | 截止时间时区 |
| actual_completion | datetime | 否 | 实际完成时间 |
| completion_status | enum | 否 | 完成状态 |
| quality_gate | text | 否 | 质量门控点 |
| payment_terms | text | 否 | 付款条件 |
| cost_allocation | decimal(18,2) | 否 | 成本分配 |
| is_critical_path | boolean | 否 | 是否关键路径 |
| is_backup | boolean | 否 | 是否备选节点 |
| backup_of_mapping_id | text | 否 | 备选对应的mapping_id |
| collaboration_level | enum | 否 | 协作深度 |
| data_exchange_format | enum | 否 | 数据交换格式 |
| esg_score | integer | 否 | ESG评分（0-100） |
| compliance_cert | multi_select | 否 | 合规认证 |
| issue_count | integer | 否 | 问题数量 |
| last_communication | datetime | 否 | 最近沟通时间 |
| escalation_count | integer | 否 | 升级次数 |
| notes | text | 否 | 备注 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

node_type:
- 上游（原料/面料/辅料）
- 中游（OEM/ODM/OBM）
- 下游（品牌/渠道/零售）

node_role:
- 主责方
- 协作方
- 审核方
- 支持方

completion_status:
- 未开始
- 进行中
- 已完成
- 已延期
- 已取消

collaboration_level:
- 独家合作
- 优先合作
- 备选合作
- 临时合作

data_exchange_format:
- EDI
- API
- Excel
- 邮件
- 纸质

compliance_cert:
- ISO9001
- ISO14001
- SA8000
- OEKO-TEX
- GOTS
- ZDHC

**索引：**
- 主索引：mapping_id
- 普通索引：project_id
- 普通索引：node_type
- 普通索引：entity_id
- 普通索引：node_role
- 普通索引：milestone_deadline
- 普通索引：completion_status

**关系：**
- N:1 → project_master（项目-节点映射）
- N:1 → org_governance（实体关联）
- N:1 → supply_chain_upstream（供应商关联）
- N:1 → supply_chain_midstream（工厂关联）
- N:1 → supply_chain_downstream（品牌关联）

---

## project_bom（项目物料清单表）

**表描述：** 冻结项目期原料配置，避免市场价格波动导致数据失真

**主键：** bom_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| bom_id | text | 是 | BOM唯一ID |
| project_id | text | 是 | 关联项目ID |
| product_id | text | 否 | 产品ID |
| style_no | text | 否 | 款号 |
| version | text | 否 | BOM版本 |
| material_snapshot | text | 是 | 原料快照（JSON） |
| tech_pack_hash | text | 否 | 工艺包哈希 |
| tech_pack_url | text | 否 | 工艺包链接 |
| sizing_spec | text | 否 | 尺码规格（JSON） |
| color_options | text | 否 | 颜色选项（JSON） |
| total_material_cost | decimal(18,2) | 否 | 原料总成本 |
| cost_breakdown | text | 否 | 成本拆解（JSON） |
| sustainability_index | decimal(5,2) | 否 | 可持续指数 |
| carbon_footprint | decimal(10,2) | 否 | 碳足迹（kg CO2） |
| quality_standard | text | 否 | 质量标准 |
| test_requirements | text | 否 | 测试要求（JSON） |
| bom_status | enum | 是 | BOM状态 |
| approved_by | text | 否 | 审批人 |
| dt_approved | datetime | 否 | 审批时间 |
| effective_start | date | 否 | 生效开始日期 |
| effective_end | date | 否 | 生效结束日期 |
| is_frozen | boolean | 否 | 是否冻结 |
| freeze_reason | text | 否 | 冻结原因 |
| frozen_by | text | 否 | 冻结人 |
| dt_frozen | datetime | 否 | 冻结时间 |
| replacement_bom_id | text | 否 | 替换BOM ID |
| notes | text | 否 | 备注 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**material_snapshot JSON结构示例：**
```json
{
  "fabric": {
    "type": "有机棉",
    "supplier_id": "S003",
    "supplier_name": "绿色纺织",
    "qty_per_unit": 1.5,
    "unit": "米",
    "unit_price": 28.00,
    "sustainability": "GOTS",
    "certifications": ["GOTS", "OEKO-TEX"]
  },
  "trim": [
    {
      "type": "拉链",
      "spec": "YKK-5mm",
      "supplier_id": "S007",
      "qty_per_unit": 6,
      "unit": "条",
      "unit_price": 1.50
    },
    {
      "type": "纽扣",
      "spec": "贝壳扣-15mm",
      "supplier_id": "S008",
      "qty_per_unit": 8,
      "unit": "颗",
      "unit_price": 0.30
    }
  ],
  "packaging": {
    "type": "opp袋+纸盒",
    "supplier_id": "S012",
    "unit_price": 2.00
  }
}
```

**枚举值：**

bom_status:
- 草稿
- 审核中
- 已审批
- 已冻结
- 已作废

**索引：**
- 主索引：bom_id
- 普通索引：project_id
- 普通索引：product_id
- 普通索引：style_no
- 普通索引：bom_status
- 普通索引：tech_pack_hash

**关系：**
- N:1 → project_master（项目-BOM）
- N:1 → supply_chain_upstream（原料供应商）
- 关联 supply_chain_mapping（节点映射）

---

## 项目节点关系图

```
project_master (SS24主线款项目)
┌─────────────────────────────────────────────────────────────────┐
│ project_id: PRJ-SS24-001                                         │
│ season_code: SS24                                               │
│ project_type: 主线款                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ node_mapping                                                    │
│ ┌─────────────────┬─────────────────┬─────────────────┐         │
│ │ 上游节点        │ 中游节点        │ 下游节点        │         │
│ │                 │                 │                 │         │
│ │ 棉花供应商      │ 面料研发部      │ 品牌电商部      │         │
│ │ entity_id:S003  │ entity_id:F001  │ entity_id:B001  │         │
│ │ node_role:协作方│ node_role:主责方│ node_role:主责方│         │
│ │ deadline:03-15  │ deadline:04-30  │ deadline:06-01  │         │
│ └─────────────────┴─────────────────┴─────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ project_bom                                                     │
│ ┌─────────────────────────────────────────────────────────┐     │
│ │ material_snapshot:                                       │     │
│ │   fabric: 有机棉, supplier=S003, qty=1.5m, GOTS认证     │     │
│ │   trim: YKK拉链, 纽扣                                   │     │
│ │ tech_pack_hash: abc123...                               │     │
│ │ sustainability_index: 85                                │     │
│ └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 季节代码设计说明

### 编码规则

| 格式 | 示例 | 说明 |
|------|------|------|
| SS + YY | SS24 | 20XX年春夏 |
| AW + YY | AW24 | 20XX年秋夏 |
| FY + YY | FY24 | 全年款 |

### 生产周期映射

| 季节 | 开发期 | 生产期 | 上市期 |
|------|--------|--------|--------|
| SS | 前年Q3-Q4 | Q4-Q1 | Q1-Q2 |
| AW | 当年Q1-Q2 | Q2-Q3 | Q3-Q4 |
| FY | 无季节限制 | 按订单 | 随时 |

### 数据隔离策略

- 项目数据按 season_code 独立存储
- 跨季对比需显式关联
- 180天后自动归档至冷库
