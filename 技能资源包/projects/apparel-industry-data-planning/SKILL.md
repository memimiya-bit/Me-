---
name: apparel-industry-data-planning
description: 面向服装行业的多维表格数据层规划技能，设计供应链、生产、销售全链路数据结构；适用于服装企业数字化转型、供应链管理及产业链数据整合
---

# 服装行业数据层规划技能

## 任务目标

本技能用于帮助用户完成服装行业企业级多维表格的底层数据架构设计，涵盖组织管理、供应链上下游、生产流程及消费者洞察全链路数据规划。

**核心能力包含：**
- 组织实体层设计：构建企业内部治理与职能架构数据模型
- 产业链实体层设计：建立上游原料商、中游制造商、下游品牌商数据关联
- 业务流程数据层设计：实现设计-生产-质检-物流全流程数据贯通
- 关键映射关系构建：支撑纵向供应链与横向供需匹配的拓扑网络

**触发条件：**
- 用户需要"规划服装行业数据层"
- 用户需要"设计供应链数据结构"
- 用户提到"产业链"、"上下游映射"
- 用户需要"服装行业特定表结构"
- 用户询问"快时尚供应链"、"服装溯源"相关数据设计

## 服装行业数据层架构概览

### 四层数据架构

```
┌─────────────────────────────────────────────────────────────┐
│                    组织实体层                                │
│  org_governance | org_functional | business_process         │
├─────────────────────────────────────────────────────────────┤
│                    产业链实体层                              │
│  supply_chain_upstream | supply_chain_midstream             │
│  | supply_chain_downstream                                  │
├─────────────────────────────────────────────────────────────┤
│                    业务流程数据层                            │
│  production_workflow | logistics_flow | consumer_behavior   │
├─────────────────────────────────────────────────────────────┤
│                    关键映射关系层                            │
│  supply_chain_mapping | product_bom | demand_supply_bridge  │
└─────────────────────────────────────────────────────────────┘
```

### 产业链拓扑结构

```
纤维原料商 ──→ 面料生产商 ──→ 成衣制造商 ──→ 品牌商 ──→ 零售商 ──→ 消费者
   │              │              │            │          │          │
   └──────────────┴──────────────┴────────────┴──────────┴──────────┘
                              关键映射枢纽表
```

## 设计原则

### 1. 双链路数据贯通

**纵向链路**：通过 supply_chain_mapping 实现"纤维原料→面料生产→成衣制造→终端销售"全链路ID映射

**横向链路**：demand_supply_bridge 表打通消费端数据（电商评论/退货率）与生产端参数（版型修正/用料调整）

### 2. 动态属性支持

- 关键表包含 sustainability_score 字段，支持 ESG 趋势追踪
- consumer_behavior 采用 JSON 结构存储个性化标签，适配 C2M 定制需求
- 原料表包含 price_volatility 字段，追踪季节性价格波动

### 3. 协同关系显性化

- 牛鞭效应控制：logistics_flow 记录各环节库存水位，自动触发预警
- 技术协同追踪：production_workflow 关联 tech_capability 字段，识别工艺改进需求

## 工作流程

### 步骤一：业务域识别

确认需要规划的服装行业业务域：

| 业务域 | 核心实体 | 适用场景 |
|--------|----------|----------|
| 组织管理 | 治理结构、职能部门、业务流程 | 企业内部管理数字化 |
| 供应链上游 | 原料商、面料商、辅料商 | 供应商管理 |
| 供应链中游 | OEM/ODM工厂、产能管理 | 生产协同 |
| 供应链下游 | 品牌商、零售商、电商 | 渠道管理 |
| 消费者洞察 | 购买行为、偏好分析 | C2M定制 |

### 步骤二：实体识别与映射

根据业务域识别核心数据实体：

| 业务域 | 主数据实体 | 映射关系 |
|--------|------------|----------|
| 组织管理 | org_governance, org_functional | 1:N 关联 |
| 供应链上游 | supply_chain_upstream | 1:N→material_inventory |
| 供应链中游 | supply_chain_midstream | N:1→product_bom |
| 供应链下游 | supply_chain_downstream | 1:N→sales_transaction |
| 消费者洞察 | consumer_behavior | 关联demand_analysis |

### 步骤三：映射关系配置

配置数据表之间的关联关系：

| 映射类型 | 示例 |
|----------|------|
| 一对一 | 订单 ↔ 品牌（品牌接单） |
| 一对多 | 品牌商 ↔ 多个销售订单 |
| 多对多 | 工厂 ↔ 多个品牌（代工关系） |
| 计算映射 | 成本 = 原料成本 + 加工成本 + 物流成本 |
| 枢纽映射 | supply_chain_mapping 连接全链路节点 |

### 步骤四：行业特性字段配置

根据业务需求启用行业特性字段：

| 特性 | 说明 | 适用表 |
|------|------|--------|
| ESG追踪 | sustainability_score | supply_chain_upstream, supply_chain_midstream |
| 碳足迹 | carbon_footprint | logistics_flow, product_bom |
| C2M定制 | consumer_tags (JSON) | consumer_behavior |
| 品质认证 | quality_cert | supply_chain_midstream |
| 快反能力 | lead_time, 产能弹性 | production_workflow |

### 步骤五：生成数据层方案

输出包含：
1. **核心表清单**：表名、描述、主键、字段数
2. **映射关系图**：可视化展示表间关系
3. **行业特性配置**：启用的特性字段清单
4. **扩展建议**：数字化升级预留接口

## 字段命名规范（服装行业扩展）

### 标准前缀

| 字段类别 | 命名格式 | 示例 |
|----------|----------|------|
| ID字段 | 实体类型_id | supplier_id, factory_id, brand_id |
| 原料类型 | material_type | 纤维/面料/辅料 |
| 生产能力 | production_type | OEM/ODM/OBM |
| 销售渠道 | sales_channel | 线下/电商/直播 |
| 可持续评分 | sustainability_score | 0-100评分 |
| 交期 | lead_time | 天数 |

### 服装行业特定类型

| 枚举值 | 字段类型 | 说明 |
|--------|----------|------|
| material_type | 枚举 | 纤维/面料/辅料/包装 |
| production_type | 枚举 | OEM/ODM/OBM |
| sales_channel | 枚举 | 线下/电商/直播/社群 |
| quality_cert | 多选 | ISO9001/OEKO-TEX/GOTS等 |

## 使用示例

### 示例一：快时尚快反供应链数据层

**场景：** 用户需要为快时尚品牌规划供应链数据层，支持小单快反模式

**输入：**
- 业务域：全链路（上游+中游+下游）
- 核心需求：小单快反、实时库存、快速追单

**规划流程：**
1. 上游：supply_chain_upstream（原料商弹性供货能力）
2. 中游：supply_chain_midstream（工厂交期和起订量）
3. 下游：supply_chain_downstream（电商+直播销售数据）
4. 核心映射：supply_chain_mapping（快速定位可用产能）
5. 供需桥接：demand_supply_bridge（实时追单响应）

**输出：** 9张核心表 + 全链路映射关系 + 快反配置建议

### 示例二：奢侈品溯源数据层

**场景：** 用户需要为奢侈品品牌设计溯源数据层，实现全流程可追溯

**输入：**
- 业务域：供应链中游 + 业务流程
- 核心需求：批次追溯、品质认证、环保合规

**规划流程：**
1. 核心表：supply_chain_midstream（含 quality_cert, sustainability_score）
2. 生产流程：production_workflow（含批次ID、质检结果）
3. 物流追溯：logistics_flow（含碳足迹记录）
4. 产品BOM：product_bom（含原料来源地）
5. 消费者：consumer_behavior（含正品验证）

**输出：** 批次追溯表结构 + 碳足迹计算字段 + 防伪验证接口

### 示例三：C2M定制数据层

**场景：** 用户需要为定制服装品牌规划C2M反向定制数据层

**输入：**
- 业务域：消费者洞察 + 生产流程
- 核心需求：用户偏好分析、柔性生产、版型库

**规划流程：**
1. 消费者数据：consumer_behavior（含体型数据、偏好标签JSON）
2. 需求分析：demand_analysis（趋势预测）
3. 供需桥接：demand_supply_bridge（订单-生产匹配）
4. 产品BOM：product_bom（含版型参数）
5. 生产追溯：production_workflow（定制工艺记录）

**输出：** 消费者画像表 + C2M订单映射 + 定制工艺库

## 资源索引

- 组织实体层设计：见 [references/org-entity-layer.md](references/org-entity-layer.md)（何时读取：设计企业内部治理和职能架构数据时）
- 产业链实体层设计：见 [references/supply-chain-entity-layer.md](references/supply-chain-entity-layer.md)（何时读取：设计供应商和渠道数据时）
- 业务流程数据层：见 [references/business-process-layer.md](references/business-process-layer.md)（何时读取：设计生产物流和消费者数据时）
- 关键映射关系：见 [references/mapping-relations.md](references/mapping-relations.md)（何时读取：配置跨表映射和供应链拓扑时）

## 注意事项

- 本技能专注于服装行业垂直领域数据层设计
- 与通用数据层规划技能（intelligent-table-data-planning）形成互补
- 优先识别产业链关键节点，确保链路贯通
- 行业特性字段根据实际业务需求选择性启用
- ESG和碳足迹追踪需考虑数据采集成本
- C2M定制需确保消费者数据合规使用
