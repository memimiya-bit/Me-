# 业务流程数据层

## 目录

- [production_workflow（生产流程表）](#production_workflow生产流程表)
- [logistics_flow（物流流程表）](#logistics_flow物流流程表)
- [consumer_behavior（消费者行为表）](#consumer_behavior消费者行为表)

---

## production_workflow（生产流程表）

**表描述：** 存储服装生产全流程数据，包括设计、打样、量产、质检环节

**主键：** order_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| order_id | text | 是 | 订单唯一ID |
| design_id | text | 否 | 设计款式ID |
| factory_id | text | 是 | 关联工厂ID |
| product_bom_id | text | 否 | 关联BOM清单ID |
| material_usage | text | 是 | 原料用量（JSON） |
| qc_results | text | 否 | 质检结果（JSON） |
| lead_time_days | integer | 否 | 交期（天） |
| cost_breakdown | text | 否 | 成本拆解（JSON） |
| order_status | enum | 是 | 订单状态 |
| order_type | enum | 否 | 订单类型 |
| style_no | text | 否 | 款号 |
| colorways | text | 否 | 颜色数量 |
| size_range | text | 否 | 尺码范围 |
| quantity_ordered | integer | 是 | 订单数量 |
| quantity_produced | integer | 否 | 已生产数量 |
| quantity_shipped | integer | 否 | 已发货数量 |
| production_progress | decimal(5,2) | 否 | 生产进度（%） |
| dt_order_placed | date | 是 | 下单日期 |
| dt_production_start | date | 否 | 生产开始日期 |
| dt_qc_pass | date | 否 | 质检通过日期 |
| dt_shipment | date | 否 | 发货日期 |
| dt_delivery | date | 否 | 交付日期 |
| tech_capability_required | multi_select | 否 | 所需技术能力 |
| tech_capability_actual | multi_select | 否 | 实际使用技术 |
| quality_gate_results | text | 否 | 质量门控结果（JSON） |
| defect_rate | decimal(5,2) | 否 | 不合格率（%） |
| carbon_footprint | decimal(10,2) | 否 | 碳足迹（kg CO2） |
| packaging_spec | text | 否 | 包装规格 |
| shipping_mark | text | 否 | 唛头信息 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

order_status:
- 已下单
- 打样中
- 确认中
- 生产中
- 质检中
- 已完成
- 已发货
- 已交付
- 已取消

order_type:
- 量产订单
- 样品订单
- 快反订单
- 返单
- 定制订单

**索引：**
- 主索引：order_id
- 普通索引：factory_id
- 普通索引：design_id
- 普通索引：order_status
- 普通索引：style_no

**关系：**
- 关联 product_bom（BOM清单ID）
- 关联 supply_chain_mapping（节点ID映射）
- 关联 supply_chain_midstream（工厂ID）

---

## logistics_flow（物流流程表）

**表描述：** 存储服装供应链物流数据，包括库存水位、在途运输、节点追踪

**主键：** shipment_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| shipment_id | text | 是 | 物流单号唯一ID |
| from_node_type | enum | 是 | 起运节点类型 |
| from_node_id | text | 是 | 起运节点ID |
| to_node_type | enum | 是 | 目的节点类型 |
| to_node_id | text | 是 | 目的节点ID |
| inventory_level | integer | 否 | 当前库存量 |
| safety_stock | integer | 否 | 安全库存 |
| reorder_point | integer | 否 | 补货点 |
| transit_quantity | integer | 否 | 在途数量 |
| transit_time_days | integer | 否 | 在途天数 |
| transit_status | enum | 是 | 在途状态 |
| shipping_method | enum | 否 | 运输方式 |
| carrier_name | text | 否 | 承运商 |
| tracking_no | text | 否 | 运单号 |
| departure_date | date | 否 | 发运日期 |
| estimated_arrival | date | 否 | 预计到达 |
| actual_arrival | date | 否 | 实际到达 |
| lead_time_days | integer | 否 | 实际交期（天） |
| shipping_cost | decimal(10,2) | 否 | 运费 |
| carbon_footprint | decimal(10,2) | 否 | 碳排放（kg CO2） |
| package_count | integer | 否 | 件数 |
| weight_kg | decimal(8,2) | 否 | 重量（kg） |
| volume_cbm | decimal(8,3) | 否 | 体积（m³） |
| customs_declaration | text | 否 | 报关信息（JSON） |
| warehouse_location | text | 否 | 仓库库位 |
| temperature_control | boolean | 否 | 是否温控 |
| insurance_value | decimal(18,2) | 否 | 保险金额 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

from_node_type:
- 原料商
- 面料商
- 辅料商
- 工厂
- 品牌仓
- 区域仓
- 门店

to_node_type:
- 原料商
- 面料商
- 辅料商
- 工厂
- 品牌仓
- 区域仓
- 门店
- 消费者

transit_status:
- 仓库待发
- 运输中
- 到达中转
- 清关中
- 已到达
- 已签收

shipping_method:
- 海运
- 空运
- 陆运
- 快递
- 多式联运

**索引：**
- 主索引：shipment_id
- 普通索引：from_node_id
- 普通索引：to_node_id
- 普通索引：transit_status
- 普通索引：carrier_name

**关系：**
- 关联 supply_chain_mapping（节点ID映射）

---

## consumer_behavior（消费者行为表）

**表描述：** 存储消费者行为数据，支持C2M反向定制和精准营销

**主键：** consumer_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| consumer_id | text | 是 | 消费者唯一ID |
| consumer_name | text | 否 | 消费者昵称 |
| member_level | enum | 否 | 会员等级 |
| age_range | enum | 否 | 年龄段 |
| gender | enum | 否 | 性别 |
| location | text | 否 | 所在地区 |
| purchase_history | text | 否 | 购买历史（JSON数组） |
| size_preference | text | 否 | 尺码偏好（JSON） |
| color_preference | text | 否 | 颜色偏好（JSON） |
| style_preference | text | 否 | 风格偏好（JSON） |
| return_rate | decimal(5,2) | 否 | 历史退货率（%） |
| return_reasons | text | 否 | 退货原因（JSON数组） |
| social_media_tags | text | 否 | 社交标签（JSON数组） |
| engagement_score | integer | 否 | 互动评分（0-100） |
| lifetime_value | decimal(18,2) | 否 | 客户终身价值（元） |
| avg_order_value | decimal(10,2) | 否 | 平均订单金额 |
| purchase_frequency | integer | 否 | 年购买频次 |
| first_purchase_date | date | 否 | 首购日期 |
| last_purchase_date | date | 否 | 最近购买日期 |
| demand_analysis_id | text | 否 | 关联需求分析ID |
| c2m_customization | boolean | 否 | 是否参与C2M定制 |
| body_measurement | text | 否 | 体型数据（JSON） |
| style_profile | text | 否 | 风格画像（JSON） |
| fit_feedback | text | 否 | 尺码反馈（JSON） |
| review_count | integer | 否 | 评价数量 |
| avg_rating | decimal(3,1) | 否 | 平均评分 |
| wishlist_items | text | 否 | 愿望清单（JSON数组） |
| cart_abandon_count | integer | 否 | 加购未购买次数 |
| channel_source | enum | 否 | 获客渠道 |
| privacy_consent | boolean | 否 | 隐私授权 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

member_level:
- 普通会员
- 银卡会员
- 金卡会员
- 钻石会员
- VIP

age_range:
- 18岁以下
- 18-24岁
- 25-34岁
- 35-44岁
- 45-54岁
- 55岁以上

gender:
- 男
- 女
- 未知

channel_source:
- 自然搜索
- 付费广告
- 社交媒体
- 直播
- KOL推荐
- 线下门店
- 朋友推荐

**索引：**
- 主索引：consumer_id
- 普通索引：member_level
- 普通索引：return_rate
- 普通索引：lifetime_value
- 普通索引：last_purchase_date

**关系：**
- 关联 demand_analysis（用于C2M反向定制）

---

## 业务流程关系图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ production_     │────→│ logistics_flow  │────→│ consumer_       │
│ workflow        │     │                 │     │ behavior        │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ order_id        │     │ shipment_id     │     │ consumer_id     │
│ factory_id      │     │ from/to_node    │     │ purchase_history│
│ material_usage  │     │ inventory_level │     │ size_preference │
│ qc_results      │     │ transit_status  │     │ return_rate     │
│ lead_time       │     │ carbon_footprint│     │ demand_analysis │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ product_bom     │     │ supply_chain_   │     │ demand_supply_  │
│ (BOM清单)       │     │ mapping         │     │ bridge          │
└─────────────────┘     │ (节点映射)       │     │ (供需桥接)      │
                         └─────────────────┘     └─────────────────┘
```

---

## 字段命名规范

### 生产流程字段

| 字段含义 | 命名 | 示例 |
|----------|------|------|
| 订单ID | order_id | ORD-2024-001 |
| 设计ID | design_id | DES-S2024-01 |
| 原料用量 | material_usage | JSON对象 |
| 质检结果 | qc_results | JSON对象 |
| 成本拆解 | cost_breakdown | JSON对象 |
| 款号 | style_no | FW2024-001 |
| 生产进度 | production_progress | 85% |
| 不合格率 | defect_rate | 2.5% |
| 碳足迹 | carbon_footprint | kg CO2 |

### 物流流程字段

| 字段含义 | 命名 | 示例 |
|----------|------|------|
| 物流单号 | shipment_id | SHP-2024-001 |
| 起运节点 | from_node | 原料商/工厂 |
| 目的节点 | to_node | 品牌仓/门店 |
| 库存水位 | inventory_level | 5000件 |
| 安全库存 | safety_stock | 1000件 |
| 补货点 | reorder_point | 1500件 |
| 在途状态 | transit_status | 运输中 |
| 运输方式 | shipping_method | 海运/空运 |
| 碳排放 | carbon_footprint | kg CO2 |

### 消费者行为字段

| 字段含义 | 命名 | 示例 |
|----------|------|------|
| 消费者ID | consumer_id | CON-001 |
| 会员等级 | member_level | 钻石会员 |
| 尺码偏好 | size_preference | JSON对象 |
| 退货率 | return_rate | 5.5% |
| 社交标签 | social_media_tags | JSON数组 |
| 客户终身价值 | lifetime_value | 50000元 |
| C2M定制 | c2m_customization | true/false |
| 体型数据 | body_measurement | JSON对象 |
| 风格画像 | style_profile | JSON对象 |
