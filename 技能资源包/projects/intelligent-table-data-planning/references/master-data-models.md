# 主数据模型定义

## 目录

- [组织主数据](#组织主数据)
- [人员主数据](#人员主数据)
- [产品主数据](#产品主数据)
- [企业主数据](#企业主数据)
- [项目主数据](#项目主数据)
- [主数据关系](#主数据关系)

---

## 组织主数据

### departments（部门主数据）

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| dept_code | text | 是 | 部门唯一编码 |
| dept_name | text | 是 | 部门名称 |
| parent_dept_code | text | 否 | 上级部门编码（用于树形结构） |
| dept_level | integer | 否 | 部门层级（1=一级部门） |
| manager_id | text | 否 | 部门负责人ID |
| cost_center | text | 否 | 成本中心编码 |
| dept_type | enum | 否 | 部门类型：战略层/执行层/支持层 |
| active_status | boolean | 是 | 是否启用（默认true） |

**索引：** dept_code（主索引）、dept_name、manager_id

**关系：**
- 一对多：部门 → 人员
- 一对多：部门 → 项目

---

## 人员主数据

### employees（员工主数据）

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| employee_id | text | 是 | 员工唯一ID |
| employee_name | text | 是 | 员工姓名 |
| dept_code | text | 是 | 所属部门编码 |
| employee_email | text | 否 | 邮箱地址 |
| employee_phone | text | 否 | 联系电话 |
| role_codes | multi_select | 否 | 角色编码列表 |
| skill_tags | multi_select | 否 | 技能标签 |
| collaboration_permissions | dropdown | 否 | 协作权限级别 |
| entry_date | date | 否 | 入职日期 |
| active_status | boolean | 是 | 是否在职（默认true） |

**索引：** employee_id（主索引）、dept_code、employee_email

**关系：**
- 多对一：人员 → 部门
- 多对多：人员 ↔ 项目（通过 project_members）

---

## 产品主数据

### products（产品主数据）

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| product_code | text | 是 | 产品唯一编码 |
| product_name | text | 是 | 产品名称 |
| product_category | enum | 否 | 产品品类：服装/配饰/鞋类/家居 |
| product_spec | text | 否 | 规格描述 |
| bom_structure | text | 否 | BOM结构（JSON格式） |
| routing_info | text | 否 | 工艺路线信息 |
| unit_cost | decimal(18,2) | 否 | 单位成本 |
| standard_price | decimal(18,2) | 否 | 标准售价 |
| min_stock | integer | 否 | 最低库存 |
| active_status | boolean | 是 | 是否启用（默认true） |

**索引：** product_code（主索引）、product_name、product_category

**关系：**
- 一对多：产品 → 物料（通过 product_materials）
- 一对多：产品 → 订单明细

---

### materials（物料主数据）

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| material_code | text | 是 | 物料唯一编码 |
| material_name | text | 是 | 物料名称 |
| material_type | enum | 否 | 物料类型：面料/辅料/包装/其他 |
| material_spec | text | 否 | 规格描述 |
| unit | text | 否 | 计量单位 |
| unit_price | decimal(18,2) | 否 | 单价 |
| supplier_code | text | 否 | 主供应商编码 |
| active_status | boolean | 是 | 是否启用（默认true） |

**索引：** material_code（主索引）、material_name、supplier_code

---

## 企业主数据

### enterprises（企业主数据）

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| enterprise_code | text | 是 | 企业唯一编码 |
| enterprise_name | text | 是 | 企业名称 |
| enterprise_type | enum | 是 | 企业类型：面料供应商/辅料供应商/代工厂/品牌客户/物流商/服务提供商 |
| partner_level | enum | 否 | 合作等级：战略伙伴/重要伙伴/普通伙伴/临时伙伴 |
| credit_rating | enum | 否 | 信用等级：AAA/AA/A/BBB/BB/B |
| contact_person | text | 否 | 对接人姓名 |
| contact_phone | text | 否 | 联系电话 |
| contact_email | text | 否 | 对接邮箱 |
| address | text | 否 | 企业地址 |
| cooperation_status | enum | 是 | 合作状态：活跃/暂停/终止（默认活跃） |
| first_cooperation_date | date | 否 | 首次合作日期 |
| last_cooperation_date | date | 否 | 最近合作日期 |

**索引：** enterprise_code（主索引）、enterprise_name、enterprise_type、contact_email

**关系：**
- 一对多：企业 → 项目
- 一对多：企业 → 合同

---

## 项目主数据

### projects（项目主数据）

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| project_code | text | 是 | 项目唯一编码 |
| project_name | text | 是 | 项目名称 |
| project_type | enum | 是 | 项目类型：销售项目/研发项目/商品项目/生产项目/战略项目 |
| project_category | enum | 否 | 项目品类：服装/配饰/鞋类/家居 |
| responsible_dept | text | 是 | 主责部门编码 |
| partner_enterprise_code | text | 否 | 合作企业编码 |
| project_manager_id | text | 是 | 项目经理ID |
| dt_start | date | 是 | 计划开始日期 |
| dt_end | date | 是 | 计划结束日期 |
| dt_actual_start | date | 否 | 实际开始日期 |
| dt_actual_end | date | 否 | 实际结束日期 |
| cur_budget | decimal(18,2) | 否 | 预算金额（默认0） |
| cur_actual_cost | decimal(18,2) | 否 | 实际成本（默认0） |
| progress | integer | 否 | 进度百分比（0-100，默认0） |
| risk_score | integer | 否 | 风险评分（1-10，默认5） |
| project_status | enum | 是 | 项目状态：规划中/进行中/延期/已完成/已取消（默认规划中） |
| value_level | enum | 否 | 价值等级：高价值/中价值/低价值 |
| knowledge_package_id | text | 否 | 知识包ID |

**索引：** project_code（主索引）、project_name、responsible_dept、project_status、project_manager_id

**关系：**
- 多对一：项目 → 部门
- 多对一：项目 → 企业
- 一对多：项目 → 任务
- 一对多：项目 → 风险

**计算字段：**
- duration_days = DATEDIFF(dt_end, dt_start) + 1（计划天数）
- cost_variance = (cur_actual_cost - cur_budget) / cur_budget * 100（成本偏差%）

---

## 主数据关系

### 关系总览

| 关系类型 | 源实体 | 目标实体 | 说明 |
|----------|--------|----------|------|
| 一对多 | departments | employees | 部门包含多个员工 |
| 一对多 | departments | projects | 部门负责多个项目 |
| 多对一 | employees | departments | 员工属于一个部门 |
| 多对一 | projects | departments | 项目由一个部门负责 |
| 多对一 | projects | enterprises | 项目关联一个合作企业 |
| 多对多 | employees | projects | 员工可参与多个项目 |
| 多对多 | products | materials | 产品包含多个物料 |

### ER图表示例

```
┌─────────────┐       ┌─────────────┐
│ departments │───1:N─│   projects   │
└─────────────┘       └─────────────┘
      │                      │
      │ 1:N                   │ N:1
      ▼                      ▼
┌─────────────┐       ┌─────────────┐
│  employees  │◀─────▶│ enterprises │
└─────────────┘  N:N   └─────────────┘
```

---

## 主数据管理原则

### 编码规则
- 部门编码：DEPT + 层级序号（如 DEPT001、DEPT00101）
- 员工编码：EMP + 序号（如 EMP001）
- 产品编码：PRD + 品类码 + 序号（如 PRD-CLOTH-001）
- 企业编码：ENT + 类型码 + 序号（如 ENT-SUP-001）
- 项目编码：PRJ + 年份 + 序号（如 PRJ-2024-001）

### 状态管理
- 所有主数据表必须包含 active_status 字段
- 禁用数据保持历史记录，不做物理删除
- 状态变更需记录变更时间和操作人

### 变更控制
- 主数据变更需审批流程
- 关键字段变更需影响分析
- 变更历史需完整记录
