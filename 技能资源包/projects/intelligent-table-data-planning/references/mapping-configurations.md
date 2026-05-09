# 映射关系配置

## 目录

- [自动映射](#自动映射)
- [计算映射](#计算映射)
- [知识关联映射](#知识关联映射)
- [映射规则示例](#映射规则示例)

---

## 自动映射

自动映射用于建立表与表之间的数据关联关系，确保数据一致性和引用完整性。

### 基础映射配置

| 源实体 | 目标实体 | 映射类型 | 源字段 | 目标字段 | 验证规则 |
|--------|----------|----------|--------|----------|----------|
| projects | departments | 多对一 | responsible_dept | dept_code | target_field_exists |
| project_tasks | projects | 多对一 | project_code | project_code | cascade_delete |
| project_tasks | departments | 多对一 | responsible_dept | dept_code | target_field_exists |
| project_risks | projects | 多对一 | project_code | project_code | cascade_delete |
| projects | enterprises | 多对一 | partner_enterprise_code | enterprise_code | nullable |
| projects | knowledge_packages | 多对一 | knowledge_package_id | package_id | auto_recommend |
| contracts | enterprises | 多对一 | enterprise_code | enterprise_code | target_field_exists |
| contracts | projects | 多对一 | project_code | project_code | nullable |

### 多对多映射配置

| 实体A | 实体B | 中间表 | 说明 |
|-------|-------|--------|------|
| employees | projects | project_members | 人员参与项目 |
| products | materials | product_materials | 产品物料构成 |
| employees | roles | employee_roles | 人员角色分配 |
| knowledge_packages | knowledge_documents | package_documents | 知识包文档组成 |

### 中间表结构示例

**project_members（项目成员关联表）：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | text | 记录ID |
| project_code | text | 项目编码 |
| employee_id | text | 员工ID |
| role_in_project | enum | 项目角色：负责人/核心成员/一般成员 |
| dt_joined | date | 加入日期 |
| dt_left | date | 离开日期 |

---

## 计算映射

计算映射用于定义基于现有字段的衍生计算字段。

### 项目相关计算

| 源表 | 目标字段 | 计算规则 | 数据类型 | 说明 |
|------|----------|----------|----------|------|
| projects | duration_days | DATEDIFF(dt_end, dt_start) + 1 | integer | 计划天数 |
| projects | actual_days | DATEDIFF(dt_actual_end, dt_actual_start) + 1 | integer | 实际天数 |
| projects | cost_variance | (cur_actual_cost - cur_budget) / cur_budget * 100 | decimal(10,2) | 成本偏差% |
| projects | cost_variance_amount | cur_actual_cost - cur_budget | decimal(18,2) | 成本偏差金额 |
| projects | schedule_variance | (dt_actual_end - dt_end) 天数 | integer | 进度偏差天数 |

### 任务相关计算

| 源表 | 目标字段 | 计算规则 | 数据类型 | 说明 |
|------|----------|----------|----------|------|
| project_tasks | delay_days | CASE WHEN dt_actual_end > dt_plan_end THEN DATEDIFF(dt_actual_end, dt_plan_end) ELSE 0 END | integer | 延误天数 |
| project_tasks | progress_weight | (actual_hours / effort_hours) * 100 | decimal(5,2) | 工时完成率% |
| project_tasks | is_overdue | CASE WHEN task_status NOT IN ('已完成','已取消') AND dt_plan_end < TODAY THEN 1 ELSE 0 END | boolean | 是否逾期 |

### 风险相关计算

| 源表 | 目标字段 | 计算规则 | 数据类型 | 说明 |
|------|----------|----------|----------|------|
| project_risks | risk_score | probability / 100 * impact_score * 10 | integer | 风险评分（1-100） |
| project_risks | risk_level_auto | CASE WHEN risk_score >= 70 THEN '高' WHEN risk_score >= 40 THEN '中' ELSE '低' END | enum | 自动风险等级 |

### 合同相关计算

| 源表 | 目标字段 | 计算规则 | 数据类型 | 说明 |
|------|----------|----------|----------|------|
| contracts | remaining_amount | cur_contract_amount - cur_received_amount | decimal(18,2) | 剩余应收金额 |
| contracts | contract_duration | DATEDIFF(expiry_date, effective_date) + 1 | integer | 合同期限天数 |
| contracts | days_to_expiry | DATEDIFF(expiry_date, TODAY) | integer | 距离到期天数 |
| contracts | is_expiring_soon | CASE WHEN days_to_expiry <= 30 AND days_to_expiry >= 0 THEN 1 ELSE 0 END | boolean | 是否即将到期 |

---

## 知识关联映射

知识关联映射用于建立数据记录与知识文档之间的智能链接。

### 关联类型

| 关联类型 | 说明 | 配置方式 | 示例 |
|----------|------|----------|------|
| 字段级关联 | 特定字段直接关联文档 | doc_id 字段 | quality_standard ← 质量检验标准.pdf |
| 记录级关联 | 整条记录关联知识包 | knowledge_package_id | 项目记录 ← 项目知识包 |
| 条件级关联 | 满足条件时自动推荐 | 触发规则配置 | 风险等级>8 → 风险处理指南 |

### 条件级关联规则

| 触发条件 | 推荐内容类型 | 推荐逻辑 |
|----------|--------------|----------|
| project_status = '延期' | 风险处理案例 | 查找同类延期项目的处理经验 |
| risk_level > 8 | 风险管理指南 | 推送高级别风险管理SOP |
| task_type = '生产' | 生产工艺标准 | 关联生产流程和质量标准 |
| project_type = '研发' | 技术文档库 | 关联相关技术积累文档 |
| 新员工入职 | 培训材料包 | 推送入职培训和岗位指引 |

### 知识推荐算法

```
推荐得分 = 匹配度 × 相关度 × 时效性 × 使用频率

其中：
- 匹配度：业务域/场景匹配程度（0-1）
- 相关度：与当前记录的关联度（0-1）
- 时效性：文档更新新鲜度（0-1）
- 使用频率：该文档的历史使用统计（0-1）
```

---

## 映射规则示例

### 示例一：项目管理映射配置

```yaml
mappings:
  - source_entity: projects
    target_entity: departments
    mapping_type: many_to_one
    source_field: responsible_dept
    target_field: dept_code
    validation_rule: target_field_exists
    auto_update: true
    error_handling: reject
    
  - source_entity: projects
    target_entity: projects
    mapping_type: self_reference
    source_field: parent_project_code
    target_field: project_code
    validation_rule: no_circular_reference
    description: 项目父子关系
    
  - source_entity: project_tasks
    target_entity: projects
    mapping_type: many_to_one
    source_field: project_code
    target_field: project_code
    cascade_delete: true
    cascade_update: true
```

### 示例二：组织架构映射配置

```yaml
mappings:
  - source_entity: employees
    target_entity: departments
    mapping_type: many_to_one
    source_field: dept_code
    target_field: dept_code
    validation_rule: target_field_exists
    auto_update: false
    
  - source_entity: departments
    target_entity: departments
    mapping_type: self_reference
    source_field: parent_dept_code
    target_field: dept_code
    validation_rule: no_circular_reference
    description: 部门树形层级
```

### 示例三：知识集成映射配置

```yaml
knowledge_mappings:
  - entity: projects
    knowledge_type: package
    link_field: knowledge_package_id
    auto_recommend: true
    recommendation_rules:
      - condition: "project_type = '销售项目'"
        target_scenario: 销售流程
      - condition: "project_type = '研发项目'"
        target_scenario: 研发流程
        
  - entity: project_risks
    knowledge_type: document
    link_field: related_doc_ids
    conditional_links:
      - condition: "risk_level = '高'"
        target_doc_type: 风险管理指南
      - condition: "risk_category = '质量'"
        target_doc_type: 质量标准规范
```

### 映射验证规则

| 规则类型 | 验证内容 | 失败处理 |
|----------|----------|----------|
| target_field_exists | 目标字段值在目标表中存在 | reject（拒绝保存） |
| no_circular_reference | 不存在循环引用 | reject |
| cascade_delete | 删除时级联处理关联数据 | cascade（级联删除） |
| cascade_update | 更新时级联更新关联数据 | cascade |
| nullable | 允许空值时不验证 | skip（跳过验证） |
| auto_recommend | 无值时自动推荐 | suggest（提示建议） |
