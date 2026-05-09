# 产业链实体层

## 目录

- [supply_chain_upstream（供应链上游表）](#supply_chain_upstream供应链上游表)
- [supply_chain_midstream（供应链中游表）](#supply_chain_midstream供应链中游表)
- [supply_chain_downstream（供应链下游表）](#supply_chain_downstream供应链下游表)

---

## supply_chain_upstream（供应链上游表）

**表描述：** 存储供应链上游企业数据，包括原料商、面料商、辅料商

**主键：** supplier_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| supplier_id | text | 是 | 供应商唯一ID |
| supplier_name | text | 是 | 供应商名称 |
| supplier_type | enum | 是 | 供应商类型 |
| material_type | enum | 是 | 原料类型 |
| country_region | text | 否 | 产地国家/地区 |
| production_base | text | 否 | 生产基地 |
| price_volatility | enum | 否 | 价格波动性：高/中/低 |
| min_order_qty | decimal(10,2) | 否 | 最小起订量 |
| lead_time_days | integer | 否 | 标准交期（天） |
| sustainability_score | integer | 否 | 可持续评分（0-100） |
| certifications | multi_select | 否 | 认证证书 |
| price_range | text | 否 | 价格区间（JSON） |
| payment_terms | text | 否 | 付款条件 |
| contact_person | text | 否 | 对接人 |
| contact_phone | text | 否 | 联系电话 |
| sample_availability | boolean | 否 | 是否可提供样品 |
| sustainability_cert | multi_select | 否 | 可持续认证 |
| carbon_footprint | decimal(10,2) | 否 | 碳足迹（kg CO2/unit） |
| material_inventory_id | text | 否 | 关联原料库存ID |
| rating | decimal(3,1) | 否 | 供应商评级（0-5） |
| cooperation_status | enum | 是 | 合作状态：活跃/暂停/终止（默认活跃） |
| dt_first_cooperation | date | 否 | 首次合作日期 |
| dt_last_order | date | 否 | 最近下单日期 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

supplier_type:
- 纤维供应商
- 面料供应商
- 辅料供应商
- 包装供应商

material_type:
- 天然纤维（棉/麻/丝/毛）
- 化学纤维（涤纶/尼龙/氨纶）
- 混纺面料
- 牛仔面料
- 针织面料
- 辅料（纽扣/拉链/标签）
- 包装材料

price_volatility:
- 高
- 中
- 低

certifications:
- ISO9001
- ISO14001
- OEKO-TEX
- GOTS
- bluesign
- WRAP

sustainability_cert:
- 有机棉认证
- 再生纤维认证
- 低碳生产认证

**索引：**
- 主索引：supplier_id
- 普通索引：supplier_type
- 普通索引：material_type
- 普通索引：sustainability_score
- 普通索引：country_region

**关系：**
- 1:N → material_inventory（通过原料ID关联）

---

## supply_chain_midstream（供应链中游表）

**表描述：** 存储供应链中游企业数据，包括OEM/ODM/OBM工厂

**主键：** factory_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| factory_id | text | 是 | 工厂唯一ID |
| factory_name | text | 是 | 工厂名称 |
| production_type | enum | 是 | 生产类型 |
| country_region | text | 是 | 所在国家/地区 |
| city | text | 否 | 所在城市 |
| capacity_monthly | integer | 否 | 月产能（件） |
| capacity_utilization | decimal(5,2) | 否 | 产能利用率（%） |
| min_order_qty | integer | 否 | 最小订单量 |
| lead_time_days | integer | 否 | 标准交期（天） |
| quality_cert | multi_select | 是 | 质量认证 |
| tech_capability | multi_select | 否 | 技术能力 |
| specialization | multi_select | 否 | 专业领域 |
| equipment_level | enum | 否 | 设备水平 |
| worker_count | integer | 否 | 工人数量 |
| sustainability_score | integer | 否 | 可持续评分（0-100） |
| compliance_audit | enum | 否 | 合规审计：待审计/通过/不通过 |
| last_audit_date | date | 否 | 最近审计日期 |
| price_level | enum | 否 | 价格水平：高/中/低 |
| payment_terms | text | 否 | 付款条件 |
| contact_person | text | 否 | 对接人 |
| product_bom_id | text | 否 | 关联产品BOM ID |
| moq_flexibility | enum | 否 | 起订量弹性：高/中/低 |
| fast_reaction | boolean | 否 | 是否支持快反 |
| carbon_footprint | decimal(10,2) | 否 | 碳足迹（kg CO2/unit） |
| cooperation_brands | text | 否 | 合作品牌（JSON数组） |
| rating | decimal(3,1) | 否 | 综合评级（0-5） |
| cooperation_status | enum | 是 | 合作状态：活跃/暂停/终止（默认活跃） |
| dt_first_cooperation | date | 否 | 首次合作日期 |
| dt_last_production | date | 否 | 最近生产日期 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

production_type:
- OEM（代工生产）
- ODM（设计制造）
- OBM（自有品牌）
- CM（来料加工）

quality_cert:
- ISO9001
- ISO14001
- SA8000
- BSCI
- SEDEX
- WRAP

tech_capability:
- 裁剪缝制
- 印花绣花
- 水洗工艺
- 特殊面料处理
- 智能化生产
- 3D量体

specialization:
- 牛仔
- 针织
- 梭织
- 运动装
- 童装
- 内衣

equipment_level:
- 传统设备
- 半自动化
- 全自动化
- 智能化

**索引：**
- 主索引：factory_id
- 普通索引：production_type
- 普通索引：country_region
- 普通索引：sustainability_score
- 普通索引：quality_cert

**关系：**
- N:1 → product_bom（通过factory_id关联）

---

## supply_chain_downstream（供应链下游表）

**表描述：** 存储供应链下游企业数据，包括品牌商、零售商、电商

**主键：** brand_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| brand_id | text | 是 | 品牌/渠道唯一ID |
| brand_name | text | 是 | 品牌/渠道名称 |
| brand_type | enum | 是 | 类型 |
| sales_channel | multi_select | 是 | 销售渠道 |
| consumer_segment | multi_select | 否 | 目标客群 |
| brand_positioning | enum | 否 | 品牌定位 |
| price_range | text | 否 | 价格带 |
| annual_revenue | decimal(18,2) | 否 | 年营收（万元） |
| market_share | decimal(5,2) | 否 | 市场份额（%） |
| demand_forecast | text | 否 | 需求预测（JSON） |
| order_pattern | text | 否 | 订单模式（JSON） |
| return_rate | decimal(5,2) | 否 | 退货率（%） |
| consumer_satisfaction | decimal(3,1) | 否 | 消费者满意度（0-5） |
| social_media_followers | integer | 否 | 社交媒体粉丝数 |
| digital_maturity | enum | 否 | 数字化成熟度 |
| inventory_turnover | decimal(5,2) | 否 | 库存周转率 |
| cooperation_suppliers | text | 否 | 合作供应商（JSON数组） |
| payment_terms | text | 否 | 付款条件 |
| credit_rating | enum | 否 | 信用等级 |
| contact_person | text | 否 | 对接人 |
| sales_transaction_id | text | 否 | 关联销售交易ID |
| dt_last_order | date | 否 | 最近下单日期 |
| cooperation_status | enum | 是 | 合作状态：活跃/暂停/终止（默认活跃） |
| dt_first_cooperation | date | 否 | 首次合作日期 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

brand_type:
- 品牌商
- 零售商
- 电商平台
- 直播机构
- 代理商
- 批发商

sales_channel:
- 线下门店
- 百货专柜
- 专卖店
- 电商平台
- 直播电商
- 社群团购
- 跨境电商

consumer_segment:
- 青少年
- 年轻白领
- 成熟职场
- 中老年
- 儿童
- 孕产妇

brand_positioning:
- 高端奢侈品
- 中高端
- 大众消费
- 快时尚
- 平价
- 特卖尾货

digital_maturity:
- 传统
- 电商起步
- 全渠道
- 数字化运营

credit_rating:
- AAA
- AA
- A
- BBB
- BB
- B

**索引：**
- 主索引：brand_id
- 普通索引：brand_type
- 普通索引：sales_channel
- 普通索引：consumer_segment
- 普通索引：return_rate

**关系：**
- 1:N → sales_transaction（通过brand_id关联）

---

## 产业链关系图

```
supply_chain_upstream          supply_chain_midstream         supply_chain_downstream
┌──────────────────┐         ┌──────────────────┐           ┌──────────────────┐
│ 纤维供应商       │         │ OEM工厂          │           │ 品牌商           │
│ - supplier_id    │────────→│ - factory_id    │──────────→│ - brand_id       │
│ - material_type  │  原料    │ - production_type│  代工     │ - sales_channel  │
│ - sustainability │  供应    │ - tech_capability │  生产     │ - consumer_seg   │
│   _score         │         │ - quality_cert   │           │ - demand_forecast│
└──────────────────┘         └──────────────────┘           └──────────────────┘
         │                             │                             │
         │ 1:N                         │ N:1                          │ 1:N
         ▼                             ▼                             ▼
┌──────────────────┐         ┌──────────────────┐           ┌──────────────────┐
│ material_inventory│        │   product_bom   │           │sales_transaction │
│ 原料库存表        │         │   产品BOM表      │           │  销售交易表       │
└──────────────────┘         └──────────────────┘           └──────────────────┘
```

---

## 字段命名规范

### 供应链通用字段

| 字段含义 | 命名 | 示例 |
|----------|------|------|
| 供应商ID | supplier_id | SUP-001 |
| 工厂ID | factory_id | FAC-001 |
| 品牌ID | brand_id | BRD-001 |
| 合作状态 | cooperation_status | 活跃/暂停/终止 |
| 可持续评分 | sustainability_score | 0-100 |
| 碳足迹 | carbon_footprint | kg CO2/unit |
| 最小起订量 | min_order_qty | MOQ |

### 上游特有字段

| 字段含义 | 命名 | 示例 |
|----------|------|------|
| 原料类型 | material_type | 棉/涤纶/辅料 |
| 价格波动性 | price_volatility | 高/中/低 |
| 产地 | country_region | 中国/越南 |
| 可持续认证 | sustainability_cert | GOTS/OEKO-TEX |

### 中游特有字段

| 字段含义 | 命名 | 示例 |
|----------|------|------|
| 生产类型 | production_type | OEM/ODM/OBM |
| 技术能力 | tech_capability | 印花/绣花/水洗 |
| 设备水平 | equipment_level | 全自动化 |
| 快反支持 | fast_reaction | true/false |

### 下游特有字段

| 字段含义 | 命名 | 示例 |
|----------|------|------|
| 销售渠道 | sales_channel | 电商/直播/线下 |
| 目标客群 | consumer_segment | 白领/学生 |
| 品牌定位 | brand_positioning | 高端/快时尚 |
| 退货率 | return_rate | 5.5% |
