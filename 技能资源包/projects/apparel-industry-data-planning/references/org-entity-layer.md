# 组织实体层

## 目录

- [org_governance（企业治理结构表）](#org_governance企业治理结构表)
- [org_functional（职能架构表）](#org_functional职能架构表)
- [business_process（业务流程表）](#business_process业务流程表)

---

## org_governance（企业治理结构表）

**表描述：** 存储企业治理架构数据，包括决策层、高管层、部门结构

**主键：** entity_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| entity_id | text | 是 | 实体唯一ID |
| entity_name | text | 是 | 实体名称 |
| governance_type | enum | 是 | 治理层级：决策层/高管层/部门负责人 |
| dept_name | text | 是 | 部门名称 |
| duty_desc | text | 否 | 职责描述 |
| reporting_line | text | 否 | 汇报线（上级entity_id） |
| head_count | integer | 否 | 编制人数 |
| cost_center | text | 否 | 成本中心编码 |
| data_source | text | 否 | 数据来源系统 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

governance_type:
- 决策层
- 高管层
- 部门负责人
- 职能组长

**索引：**
- 主索引：entity_id
- 普通索引：governance_type
- 普通索引：dept_name
- 普通索引：reporting_line

**关系：**
- 1:N → org_functional（治理结构-职能架构）

---

## org_functional（职能架构表）

**表描述：** 存储企业职能中心数据，包括人力资源、财务、研发等职能

**主键：** entity_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| entity_id | text | 是 | 实体唯一ID |
| entity_name | text | 是 | 职能单元名称 |
| center_type | enum | 是 | 职能类型 |
| sub_dept | text | 否 | 下级部门列表（JSON） |
| process_owner | text | 否 | 流程负责人ID |
| kpi_indicators | text | 否 | 核心KPI指标（JSON） |
| data_source | text | 否 | 数据来源系统 |
| budget_allocated | decimal(18,2) | 否 | 年度预算 |
| head_count | integer | 否 | 实际人数 |
| automation_level | enum | 否 | 数字化水平：手工/半自动/全自动 |
| upstream_material_data | text | 否 | 关联原料采购数据（JSON） |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

center_type:
- 人力资源
- 财务管控
- 研发设计
- 供应链管理
- 市场营销
- 质量管理
- 信息技术
- 行政管理

automation_level:
- 手工
- 半自动
- 全自动

**索引：**
- 主索引：entity_id
- 普通索引：center_type
- 普通索引：process_owner

**关系：**
- N:1 → org_governance（通过reporting_line关联）
- N:1 → supply_chain_upstream（通过原料采购数据关联）

---

## business_process（业务流程表）

**表描述：** 存储企业核心业务流程定义及输入输出数据

**主键：** process_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| process_id | text | 是 | 流程唯一ID |
| process_name | text | 是 | 流程名称 |
| process_type | enum | 是 | 流程类型 |
| phase | enum | 否 | 所处阶段 |
| responsible_dept | text | 是 | 责任部门 |
| owner_id | text | 否 | 流程owner |
| input_data | text | 是 | 输入数据（JSON数组） |
| output_data | text | 是 | 输出数据（JSON数组） |
| system_used | text | 否 | 使用系统列表 |
| sla_days | integer | 否 | 标准交付周期（天） |
| quality_gate | text | 否 | 质量门控点 |
| digital_maturity | enum | 否 | 数字化成熟度 |
| production_data_flow | text | 否 | 关联生产数据流（JSON） |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

process_type:
- 设计开发
- 原料采购
- 生产制造
- 质量检验
- 仓储物流
- 销售运营
- 客户服务

phase:
- 规划阶段
- 设计阶段
- 打样阶段
- 量产阶段
- 上市阶段

digital_maturity:
- 纸质化
- 电子化
- 系统化
- 智能化

**索引：**
- 主索引：process_id
- 普通索引：process_type
- 普通索引：responsible_dept

**关系：**
- 1:N → supply_chain_midstream（流程-生产数据流）
- 关联 supply_chain_mapping（通过节点ID）

---

## 组织实体关系图

```
org_governance
┌─────────────────────────────────────────────────────────────┐
│  决策层 (governance_type = "决策层")                         │
│      │                                                      │
│      ├──→ 高管层 (governance_type = "高管层")               │
│      │         │                                            │
│      │         ├──→ 部门负责人A (governance_type = "部门")  │
│      │         │         │                                  │
│      │         │         └──→ org_functional               │
│      │         │                    │                        │
│      │         │                    ├──→ 人力资源            │
│      │         │                    ├──→ 财务管控            │
│      │         │                    ├──→ 研发设计            │
│      │         │                    └──→ 供应链管理          │
│      │         │                        │                   │
│      │         │                        └──→ business_process│
└──────┴─────────────────────────────────────────────────────┘
```

---

## 字段命名规范

### 治理层级字段

| 字段含义 | 命名 | 示例 |
|----------|------|------|
| 治理类型 | governance_type | 决策层/高管层 |
| 部门名称 | dept_name | 产品研发部 |
| 汇报线 | reporting_line | 上级entity_id |
| 成本中心 | cost_center | CC-001 |

### 职能架构字段

| 字段含义 | 命名 | 示例 |
|----------|------|------|
| 职能类型 | center_type | 人力资源/财务 |
| 下级部门 | sub_dept | JSON数组 |
| 流程owner | process_owner | EMP-001 |
| KPI指标 | kpi_indicators | JSON对象 |
| 数字化水平 | automation_level | 全自动 |
| 原料数据 | upstream_material_data | JSON对象 |

### 业务流程字段

| 字段含义 | 命名 | 示例 |
|----------|------|------|
| 流程名称 | process_name | 新品开发流程 |
| 流程类型 | process_type | 设计开发 |
| 输入数据 | input_data | JSON数组 |
| 输出数据 | output_data | JSON数组 |
| 使用系统 | system_used | ERP/MES |
| 质量门控 | quality_gate | 首件检验 |
