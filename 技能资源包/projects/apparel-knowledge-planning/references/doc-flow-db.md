# 文档流转中枢表

## 目录

- [doc_master（文档主表）](#doc_master文档主表)
- [doc_flow（文档流转表）](#doc_flow文档流转表)
- [version_control（版本控制表）](#version_control版本控制表)

---

## doc_master（文档主表）

**表描述：** 管理跨组织文档的全生命周期，支持季节性保留策略和权限动态继承

**主键：** doc_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| doc_id | text | 是 | 文档唯一ID |
| doc_code | text | 否 | 文档编号 |
| doc_title | text | 是 | 文档标题 |
| doc_type | enum | 是 | 文档类型 |
| doc_subtype | text | 否 | 文档子类型 |
| version | text | 是 | 当前版本号 |
| owner_org_id | text | 是 | 所有者组织ID |
| owner_org_name | text | 是 | 所有者组织名称 |
| owner_dept | text | 否 | 所有者部门 |
| owner_user | text | 否 | 所有者用户 |
| security_level | enum | 是 | 安全级别 |
| retention_policy | text | 是 | 保留策略 |
| retention_days | integer | 否 | 保留天数 |
| archive_date | date | 否 | 归档日期 |
| is_archived | boolean | 否 | 是否归档 |
| season_code | text | 否 | 关联季节代码 |
| related_project_ids | text | 否 | 关联项目ID（JSON数组） |
| related_order_ids | text | 否 | 关联订单ID（JSON数组） |
| related_agreement_ids | text | 否 | 关联协议ID（JSON数组） |
| keywords | text | 否 | 关键词（JSON数组） |
| abstract | text | 否 | 摘要 |
| file_url | text | 否 | 文件存储URL |
| file_size | integer | 否 | 文件大小（字节） |
| file_format | text | 否 | 文件格式 |
| checksum | text | 否 | 文件校验和 |
| compliance_check_required | boolean | 否 | 是否需要合规检查 |
| compliance_status | enum | 否 | 合规状态 |
| last_compliance_check | datetime | 否 | 最近合规检查时间 |
| access_count | integer | 否 | 访问次数 |
| last_access_date | datetime | 否 | 最近访问日期 |
| download_count | integer | 否 | 下载次数 |
| reference_count | integer | 否 | 被引用次数 |
| metadata | text | 否 | 扩展元数据（JSON） |
| status | enum | 是 | 状态 |
| expires_date | date | 否 | 过期日期 |
| renewal_required | boolean | 否 | 是否需要续期 |
| auto_renew | boolean | 否 | 是否自动续期 |
| superseded_by | text | 否 | 替代文档ID |
| supersedes | text | 否 | 替代的文档ID |
| related_docs | text | 否 | 关联文档ID（JSON数组） |
| notes | text | 否 | 备注 |
| created_by | text | 是 | 创建人 |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

doc_type:
- 工艺单
- 质检报告
- 合规证书
- 合同协议
- 设计图稿
- 样板确认
- 生产计划
- 包装规范
- 洗水唛
- 吊牌
- 测试报告
- 审计报告

security_level:
- 公开
- 内部
- 供应链可见
- 仅参与者
- 机密

retention_policy:
- season+2年（工艺单）
- 3年（质检报告）
- 5年（环保证书）
- 10年（合同协议）
- 永久（法规文件）

compliance_status:
- 待检查
- 检查中
- 合规
- 部分合规
- 不合规
- 过期

status:
- 草稿
- 审核中
- 已发布
- 已归档
- 已作废

**索引：**
- 主索引：doc_id
- 普通索引：doc_code（唯一）
- 普通索引：doc_type
- 普通索引：owner_org_id
- 普通索引：security_level
- 普通索引：season_code
- 普通索引：status

**关系：**
- 关联 project_master（项目文档）
- 关联 org_collab_agreement（协议文档）
- 关联 term_glossary（术语关联）
- 关联 supply_chain_mapping（供应链节点）

---

## doc_flow（文档流转表）

**表描述：** 记录跨组织文档传递，支持关键动作闭环和合规穿透检查

**主键：** flow_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| flow_id | text | 是 | 流转ID |
| doc_id | text | 是 | 关联文档ID |
| doc_version | text | 否 | 文档版本 |
| flow_sequence | integer | 是 | 流转序号 |
| from_org_id | text | 是 | 发送方组织ID |
| from_org_name | text | 是 | 发送方组织名称 |
| from_dept | text | 否 | 发送方部门 |
| from_team | text | 否 | 发送方小组 |
| from_user | text | 否 | 发送人 |
| to_org_id | text | 是 | 接收方组织ID |
| to_org_name | text | 是 | 接收方组织名称 |
| to_dept | text | 否 | 接收方部门 |
| to_team | text | 否 | 接收方小组 |
| to_user | text | 否 | 接收人 |
| transmit_timestamp | datetime | 是 | 发送时间（UTC） |
| receive_timestamp | datetime | 否 | 接收时间（UTC） |
| expected_receive_date | date | 否 | 期望接收日期 |
| required_actions | text | 是 | 必需操作（JSON数组） |
| action_status | text | 否 | 操作状态（JSON） |
| compliance_check | text | 否 | 合规检查（JSON） |
| compliance_result | enum | 否 | 合规检查结果 |
| compliance_check_by | text | 否 | 合规检查人 |
| compliance_check_date | datetime | 否 | 合规检查时间 |
| flow_direction | enum | 是 | 流转方向 |
| related_order_id | text | 否 | 关联订单ID |
| related_project_id | text | 否 | 关联项目ID |
| related_node_mapping_id | text | 否 | 关联节点映射ID |
| parent_flow_id | text | 否 | 父流转ID |
| trigger_type | enum | 否 | 触发类型 |
| deadline | datetime | 否 | 截止时间 |
| deadline_timezone | text | 否 | 截止时间时区 |
| is_overdue | boolean | 否 | 是否超时 |
| overdue_days | integer | 否 | 超时天数 |
| reminder_count | integer | 否 | 催办次数 |
| last_reminder_date | datetime | 否 | 最近催办日期 |
| status | enum | 是 | 流转状态 |
| completion_timestamp | datetime | 否 | 完成时间 |
| completion_rate | decimal(5,2) | 否 | 完成率（%） |
| quality_score | decimal(3,1) | 否 | 质量评分 |
| notes | text | 否 | 备注 |
| attachments | text | 否 | 附件（JSON数组） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**required_actions JSON结构示例：**
```json
[
  {
    "action_id": "ACT-001",
    "action_name": "确认版型",
    "action_type": "确认",
    "required": true,
    "deadline": "2024-04-15",
    "assigned_to": "版房主管",
    "status": "待完成"
  },
  {
    "action_id": "ACT-002",
    "action_name": "反馈交期",
    "action_type": "反馈",
    "required": true,
    "deadline": "2024-04-20",
    "assigned_to": "生产计划",
    "status": "待完成"
  }
]
```

**compliance_check JSON结构示例：**
```json
{
  "checks": [
    {
      "check_type": "RSL合规",
      "check_result": "通过",
      "checked_terms": ["RSL-001", "RSL-002"],
      "checked_by": "QC经理"
    },
    {
      "check_type": "尺寸链校验",
      "check_result": "通过",
      "tolerance": "±0.5cm",
      "checked_by": "版房主管"
    }
  ],
  "overall_result": "通过"
}
```

**枚举值：**

flow_direction:
- 发给供应商
- 发给品牌方
- 内部流转
- 发给客户

trigger_type:
- 主动发送
- 补货请求
- 变更通知
- 审批请求
- 问题反馈
- 确认请求

compliance_result:
- 通过
- 需整改
- 驳回
- 待检查

status:
- 进行中
- 已接收
- 已完成
- 已超时
- 已驳回
- 已取消

**索引：**
- 主索引：flow_id
- 普通索引：doc_id
- 普通索引：from_org_id
- 普通索引：to_org_id
- 普通索引：transmit_timestamp
- 普通索引：status
- 普通索引：related_order_id
- 普通索引：related_project_id

**关系：**
- N:1 → doc_master（文档-流转）
- N:1 → project_master（项目-流转）
- N:1 → org_collab_agreement（协议-流转）

---

## version_control（版本控制表）

**表描述：** 管理文档版本变更，支持工艺变更溯源和多角色会签

**主键：** version_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| version_id | text | 是 | 版本ID |
| doc_id | text | 是 | 关联文档ID |
| version_number | text | 是 | 版本号 |
| change_summary | text | 是 | 变更摘要 |
| change_detail | text | 否 | 变更详情 |
| change_type | enum | 是 | 变更类型 |
| change_category | text | 否 | 变更类别 |
| previous_version | text | 否 | 前一版本号 |
| next_version | text | 否 | 下一版本号 |
| change_reason | text | 否 | 变更原因 |
| change_scope | text | 否 | 变更范围（JSON数组） |
| change_impact | enum | 否 | 影响程度 |
| changed_by | text | 是 | 变更人 |
| changer_role | text | 否 | 变更人角色 |
| changer_dept | text | 否 | 变更人部门 |
| approval_required | boolean | 否 | 是否需要审批 |
| approval_chain | text | 是 | 审批链（JSON数组） |
| approval_status | text | 否 | 审批状态（JSON） |
| approved_by | text | 否 | 最终审批人 |
| approval_date | datetime | 否 | 审批时间 |
| linked_projects | text | 否 | 关联项目ID（JSON数组） |
| linked_orders | text | 否 | 关联订单ID（JSON数组） |
| affected_nodes | text | 否 | 影响节点（JSON数组） |
| rollback_version | text | 否 | 回滚目标版本 |
| rollback_available | boolean | 否 | 是否可回滚 |
| validation_required | boolean | 否 | 是否需要验证 |
| validation_cases | text | 否 | 验证案例（JSON数组） |
| test_results | text | 否 | 测试结果（JSON） |
| related_terms_changed | text | 否 | 变更关联术语（JSON数组） |
| compliance_impact | text | 否 | 合规影响（JSON） |
| cost_impact | decimal(18,2) | 否 | 成本影响 |
| schedule_impact_days | integer | 否 | 交期影响天数 |
| issue_count | integer | 否 | 引发问题数 |
| parent_version_id | text | 否 | 父版本ID |
| branch_version | boolean | 否 | 是否分支版本 |
| tags | text | 否 | 版本标签（JSON数组） |
| file_diff_url | text | 否 | 差异文件URL |
| changelog_url | text | 否 | 变更日志URL |
| status | enum | 是 | 版本状态 |
| effective_date | date | 否 | 生效日期 |
| superseded_versions | text | 否 | 被替代版本（JSON数组） |
| notes | text | 否 | 备注 |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**approval_chain JSON结构示例：**
```json
[
  {
    "step": 1,
    "role": "设计师",
    "approver": "李设计",
    "required": true,
    "status": "已批准",
    "approved_at": "2024-04-10T10:30:00Z",
    "comments": "同意修改袖笼弧线"
  },
  {
    "step": 2,
    "role": "版房主管",
    "approver": "张师傅",
    "required": true,
    "status": "已批准",
    "approved_at": "2024-04-10T14:00:00Z",
    "comments": "确认工艺可行"
  },
  {
    "step": 3,
    "role": "QC经理",
    "approver": "王QC",
    "required": true,
    "status": "已批准",
    "approved_at": "2024-04-11T09:00:00Z",
    "comments": "同意发往工厂"
  }
]
```

**change_scope JSON示例：**
```json
[
  {
    "field": "袖笼弧线",
    "previous_value": "38cm",
    "new_value": "38.5cm",
    "unit": "cm",
    "change_amount": "+0.5"
  }
]
```

**枚举值：**

change_type:
- 新增
- 修改
- 删除
- 替换
- 废弃

change_impact:
- 重大（影响多个项目）
- 中等（影响单个项目）
- 轻微（仅文档更新）

status:
- 草稿
- 审批中
- 已批准
- 已发布
- 已回滚
- 已作废

**索引：**
- 主索引：version_id
- 普通索引：doc_id
- 普通索引：version_number
- 普通索引：changed_by
- 普通索引：approval_status
- 普通索引：linked_projects
- 普通索引：status

---

## 文档流转关系图

```
doc_master
┌─────────────────────────────────────────────────────────────────┐
│ doc_id: DOC-TECH-001                                            │
│ doc_type: 工艺单                                                │
│ doc_title: SS24女装配额工艺单V3                                │
│ security_level: 供应链可见                                      │
│ retention_policy: SS24+2年                                      │
└─────────────────────────────────────────────────────────────────┘
        │
        │ 1:N
        ▼
doc_flow
┌─────────────────────────────────────────────────────────────────┐
│ 流转节点1: 品牌部设计组 → 代工厂版房                            │
│ required_actions: ["确认版型", "反馈交期"]                      │
│ compliance_check: RSL合规通过                                    │
├─────────────────────────────────────────────────────────────────┤
│ 流转节点2: 代工厂版房 → 代工厂裁床部                            │
│ required_actions: ["裁剪确认", "色差核对"]                      │
│ compliance_check: 尺寸链校验通过                                 │
├─────────────────────────────────────────────────────────────────┤
│ 流转节点3: 代工厂QC → 品牌QC部门                                │
│ required_actions: ["质检确认", "签发合格证"]                     │
│ compliance_check: 全面合规检查                                   │
└─────────────────────────────────────────────────────────────────┘
        │
        │ 1:N
        ▼
version_control
┌─────────────────────────────────────────────────────────────────┐
│ version_id: V-001                                               │
│ version_number: V3                                              │
│ change_summary: "修改袖笼弧线0.5cm"                             │
│ approval_chain: [设计师→版房主管→QC经理]                        │
│ linked_projects: [PRJ-SS24-001]                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 季节性生命周期管理

### 保留策略配置

| 文档类型 | 保留策略 | 保留天数 | 说明 |
|----------|----------|----------|------|
| 工艺单 | season+2年 | 365+730 | 过季后再保留2年 |
| 质检报告 | 3年 | 1095 | 品质追溯 |
| 环保证书 | 5年 | 1825 | 合规长期保存 |
| 合同协议 | 10年 | 3650 | 法律追溯 |
| 测试报告 | 5年 | 1825 | 技术存档 |

### 自动归档规则

```sql
-- 自动归档过期文档
INSERT INTO doc_archive
SELECT *, CURRENT_TIMESTAMP as archived_at
FROM doc_master
WHERE (
    -- 季节+2年策略
    (retention_policy = 'season+2年' AND season_code IS NOT NULL 
     AND DATE_ADD(launch_date, INTERVAL 2 YEAR) < CURRENT_DATE)
    OR
    -- 固定天数策略
    (retention_policy = '3年' AND dt_created < DATE_SUB(CURRENT_DATE, INTERVAL 3 YEAR))
)
AND is_archived = false
AND status NOT IN ('草稿', '审核中');
```

---

## 合规穿透检查机制

### 检查流程

```
文档发送
    │
    ▼
doc_flow 创建
    │
    ▼
触发合规检查
    │
    ├─── RSL标准检查
    │    │
    │    ▼
    │    检索 term_glossary
    │    │
    │    ▼
    │    验证受限物质
    │
    ├─── 尺寸链校验
    │    │
    │    ▼
    │    检索 related_terms
    │    │
    │    ▼
    │    验证尺寸规格
    │
    └─── 行业标准检查
         │
         ▼
         验证 industry_std
         │
         ▼
    合规检查报告
         │
    ┌────┴────┐
    │         │
 通过       驳回
    │         │
    ▼         ▼
继续流转   返回整改
```

### 检查项配置

| 检查类型 | 检查内容 | 关联表 |
|----------|----------|--------|
| RSL合规 | 验证受限物质清单 | term_glossary.RSL-* |
| 尺寸链校验 | 验证尺码规格一致性 | term_glossary.SIZ-* |
| 行业标准 | 验证ISO/GB/AATCC标准 | term_glossary.industry_std |
| 法规合规 | 验证REACH/CPSIA合规 | term_glossary.REG-* |
