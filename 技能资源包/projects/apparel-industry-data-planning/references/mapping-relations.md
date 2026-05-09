# 关键映射关系

## 目录

- [supply_chain_mapping（供应链节点映射表）](#supply_chain_mapping供应链节点映射表)
- [product_bom（产品物料清单表）](#product_bomb产品物料清单表)
- [demand_supply_bridge（供需桥接表）](#demand_supply_bridge供需桥接表)

---

## supply_chain_mapping（供应链节点映射表）

**表描述：** 核心枢纽表，定义服装产业链节点间的拓扑关系，实现纵向供应链贯通

**主键：** node_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| node_id | text | 是 | 节点唯一ID |
| node_name | text | 是 | 节点名称 |
| node_type | enum | 是 | 节点类型 |
| node_level | integer | 否 | 节点层级（1=原料端，5=消费端） |
| upstream_id | text | 否 | 上游节点ID（供应商） |
| midstream_id | text | 否 | 中游节点ID（工厂） |
| downstream_id | text | 否 | 下游节点ID（品牌/渠道） |
| supplier_id | text | 否 | 关联供应商ID |
| factory_id | text | 否 | 关联工厂ID |
| brand_id | text | 否 | 关联品牌ID |
| parent_node_id | text | 否 | 父节点ID（树形结构） |
| child_node_ids | text | 否 | 子节点ID列表（JSON） |
| relation_type | enum | 否 | 关系类型 |
| lead_time_days | integer | 否 | 节点间交期（天） |
| cost_markup | decimal(5,2) | 否 | 成本加成比例（%） |
| min_cooperation_qty | integer | 否 | 最小合作量 |
| capacity_available | integer | 否 | 可用产能 |
| reliability_score | decimal(3,1) | 否 | 可靠性评分（0-5） |
| risk_level | enum | 否 | 风险等级 |
| backup_node_id | text | 否 | 备选节点ID |
| is_critical_path | boolean | 否 | 是否关键路径 |
| geographic_cluster | text | 否 | 地理集群（如东南亚/中国） |
| sustainability_score | integer | 否 | 可持续评分（0-100） |
| certification_status | enum | 否 | 认证状态 |
| cooperation_years | integer | 否 | 合作年限 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

node_type:
- 纤维原料商
- 面料生产商
- 辅料供应商
- 面料贸易商
- 成衣制造商（OEM）
- 设计制造商（ODM）
- 自有品牌商（OBM）
- 品牌运营商
- 批发商
- 零售商
- 电商平台
- 直播机构
- 物流服务商
- 消费者

relation_type:
- 独家合作
- 优先合作
- 备选合作
- 试合作

risk_level:
- 高风险
- 中风险
- 低风险

certification_status:
- 待认证
- 认证中
- 已认证
- 认证过期

**索引：**
- 主索引：node_id
- 普通索引：node_type
- 普通索引：upstream_id
- 普通索引：midstream_id
- 普通索引：downstream_id
- 普通索引：supplier_id
- 普通索引：factory_id
- 普通索引：brand_id
- 普通索引：is_critical_path
- 普通索引：risk_level

---

## product_bom（产品物料清单表）

**表描述：** 连接设计、生产、原料的全链路产品数据，支持BOM管理和工艺追溯

**主键：** product_bom_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| product_bom_id | text | 是 | BOM唯一ID |
| product_id | text | 是 | 产品ID |
| product_name | text | 是 | 产品名称 |
| style_no | text | 否 | 款号 |
| version | text | 否 | BOM版本 |
| material_list | text | 是 | 物料清单（JSON数组） |
| process_steps | text | 否 | 工艺工序（JSON数组） |
| sustainability_index | decimal(5,2) | 否 | 可持续指数（0-100） |
| cost_standard | decimal(18,2) | 否 | 标准成本 |
| cost_breakdown | text | 否 | 成本拆解（JSON） |
| factory_id | text | 否 | 指定工厂ID |
| lead_time_days | integer | 否 | BOM交期（天） |
| moq | integer | 否 | 最小起订量 |
| size_spec | text | 否 | 尺码规格（JSON） |
| color_options | text | 否 | 颜色选项（JSON数组） |
| packaging_spec | text | 否 | 包装规格 |
| quality_standard | text | 否 | 质量标准 |
| test_requirements | text | 否 | 测试要求（JSON数组） |
| design_drawing | text | 否 | 设计图纸链接 |
| tech_pack | text | 否 | 技术包链接 |
| bom_status | enum | 否 | BOM状态 |
| effective_date | date | 否 | 生效日期 |
| expiry_date | date | 否 | 失效日期 |
| approved_by | text | 否 | 审批人 |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**material_list JSON结构：**
```json
[
  {
    "material_code": "MTL-001",
    "material_name": "棉面料",
    "material_type": "面料",
    "supplier_id": "SUP-001",
    "unit_consumption": 1.5,
    "unit": "米",
    "unit_price": 25.00,
    "is_sustainable": true,
    "certification": "GOTS"
  }
]
```

**process_steps JSON结构：**
```json
[
  {
    "step_no": 1,
    "step_name": "裁剪",
    "operation": "裁剪",
    "machine_required": "裁床",
    "std_time_min": 30,
    "quality_point": true
  },
  {
    "step_no": 2,
    "step_name": "缝制",
    "operation": "缝制",
    "machine_required": "平车",
    "std_time_min": 45,
    "quality_point": true
  }
]
```

**索引：**
- 主索引：product_bom_id
- 普通索引：product_id
- 普通索引：style_no
- 普通索引：factory_id
- 普通索引：bom_status

**关系：**
- 关联 supply_chain_midstream（工厂ID）
- 关联 production_workflow（订单生产）
- 关联 consumer_behavior（消费者定制需求）

---

## demand_supply_bridge（供需桥接表）

**表描述：** 动态关联市场需求与生产计划的预测-响应桥梁，实现需求驱动柔性供应链

**主键：** bridge_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| bridge_id | text | 是 | 桥接ID |
| trend_id | text | 否 | 趋势ID |
| forecast_period | text | 是 | 预测周期（YYYY-MM） |
| demand_segment | enum | 是 | 需求细分 |
| product_category | enum | 是 | 产品品类 |
| forecast_quantity | integer | 否 | 预测数量 |
| actual_quantity | integer | 否 | 实际数量 |
| forecast_accuracy | decimal(5,2) | 否 | 预测准确率（%） |
| inventory_turnover | decimal(5,2) | 否 | 库存周转率 |
| production_adjustment | decimal(5,2) | 否 | 生产调整比例（%） |
| demand_source | enum | 是 | 需求来源 |
| demand_weight | decimal(5,2) | 否 | 需求权重 |
| priority_level | enum | 否 | 优先级 |
| order_pool_id | text | 否 | 订单池ID |
| matched_factory_id | text | 否 | 已匹配工厂ID |
| capacity_available | integer | 否 | 可用产能 |
| capacity_utilized | decimal(5,2) | 否 | 产能利用率（%） |
| lead_time_confirmed | integer | 否 | 确认交期（天） |
| material_ready | boolean | 否 | 原料就绪 |
| production_status | enum | 否 | 生产状态 |
| fulfillment_rate | decimal(5,2) | 否 | 履行率（%） |
| safety_stock_level | integer | 否 | 安全库存水位 |
| reorder_trigger | boolean | 否 | 是否触发补货 |
| bullwhip_indicator | decimal(5,2) | 否 | 牛鞭效应指标 |
| demand_trend | enum | 否 | 需求趋势 |
| price_sensitivity | decimal(5,2) | 否 | 价格敏感度 |
| seasonal_factor | decimal(5,2) | 否 | 季节因子 |
| marketing_impact | decimal(5,2) | 否 | 营销影响系数 |
| consumer_feedback_score | decimal(3,1) | 否 | 消费者反馈评分 |
| return_rate_trend | decimal(5,2) | 否 | 退货率趋势 |
| dt_forecast | date | 否 | 预测日期 |
| dt_production_start | date | 否 | 生产开始日期 |
| dt_delivery_required | date | 否 | 要求交付日期 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

demand_segment:
- 基础款
- 时尚款
- 爆款
- 新品
- 定制款

product_category:
- 上装
- 下装
- 连衣裙
- 外套
- 配饰

demand_source:
- 历史销售
- 市场调研
- 客户订单
- 渠道预测
- AI预测

priority_level:
- P0（紧急）
- P1（高）
- P2（中）
- P3（低）

production_status:
- 待生产
- 生产中
- 已完成
- 已交付
- 已取消

demand_trend:
- 上升
- 平稳
- 下降
- 波动

**索引：**
- 主索引：bridge_id
- 普通索引：trend_id
- 普通索引：forecast_period
- 普通索引：demand_segment
- 普通索引：product_category
- 普通索引：production_status

**关系：**
- 关联 consumer_behavior（消费者需求分析）
- 关联 supply_chain_mapping（供应链节点匹配）
- 关联 supply_chain_midstream（工厂产能）

---

## 映射关系示例

### 纵向链路映射

```
纤维原料商 (supplier_id) 
    ↓
面料生产商 (material_list中的supplier_id)
    ↓
成衣制造商 (factory_id)
    ↓
品牌商 (brand_id)
    ↓
零售商/电商 (sales_channel)
    ↓
消费者 (consumer_id)
```

### 横向供需桥接

```
consumer_behavior (需求分析)
    ↓
demand_supply_bridge (预测/匹配)
    ↓
supply_chain_mapping (节点定位)
    ↓
product_bom (BOM展开)
    ↓
production_workflow (生产执行)
    ↓
logistics_flow (物流配送)
```

---

## 牛鞭效应控制机制

### 关键字段

| 字段 | 作用 |
|------|------|
| bullwhip_indicator | 量化牛鞭效应程度 |
| inventory_level | 实时库存水位 |
| safety_stock_level | 安全库存阈值 |
| reorder_trigger | 补货触发标志 |

### 控制规则

| 条件 | 触发动作 |
|------|----------|
| bullwhip_indicator > 20% | 预警 + 需求平滑调整 |
| inventory_level < safety_stock | 紧急补货 + 优先排产 |
| forecast_accuracy < 70% | 降低预测权重 + 增加安全库存 |

---

## 数字化升级预留接口

| 功能 | 预留字段 | 说明 |
|------|----------|------|
| 3D设计协同 | tech_pack, design_drawing | 设计数据包 |
| 碳足迹追踪 | carbon_footprint | 全链路碳排放 |
| ESG评分 | sustainability_score | 环境社会责任治理 |
| 区块链溯源 | node_id, product_bom_id | 溯源链上节点 |
| AI预测 | forecast_accuracy, trend_id | 预测模型集成 |
