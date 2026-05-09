# 业务场景知识包

## 目录

- [knowledge_package（知识包表）](#knowledge_package知识包表)
- [form_template（表单模板表）](#form_template表单模板表)

---

## knowledge_package（知识包表）

**表描述：** 封装可复用的知识解决方案，支持场景化推送和自动推荐

**主键：** pkg_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| pkg_id | text | 是 | 知识包唯一ID |
| pkg_code | text | 否 | 知识包编号 |
| pkg_name | text | 是 | 知识包名称 |
| pkg_type | enum | 是 | 知识包类型 |
| pkg_description | text | 否 | 知识包描述 |
| pkg_content | text | 是 | 知识包内容（JSON） |
| pkg_content_url | text | 否 | 内容包URL（ZIP） |
| pkg_size | integer | 否 | 内容大小（字节） |
| thumbnail_url | text | 否 | 缩略图URL |
| applicable_seasons | text | 否 | 适用季节（JSON数组） |
| applicable_segments | text | 是 | 适用场景（JSON数组） |
| applicable_products | text | 否 | 适用产品（JSON数组） |
| applicable_materials | text | 否 | 适用物料（JSON数组） |
| target_roles | text | 否 | 目标角色（JSON数组） |
| target_depts | text | 否 | 目标部门（JSON数组） |
| related_terms | text | 否 | 关联术语（JSON数组） |
| related_experts | text | 否 | 关联专家（JSON数组） |
| related_docs | text | 否 | 关联文档（JSON数组） |
| related_knowledge_ids | text | 否 | 关联知识ID（JSON数组） |
| problem_solved | text | 否 | 解决问题描述 |
| solution_summary | text | 否 | 解决方案摘要 |
| implementation_steps | text | 否 | 实施步骤（JSON数组） |
| key_tips | text | 否 | 关键提示（JSON数组） |
| common_pitfalls | text | 否 | 常见陷阱（JSON数组） |
| estimated_time | text | 否 | 预估耗时 |
| required_resources | text | 否 | 所需资源（JSON） |
| cost_estimate | decimal(18,2) | 否 | 成本估算 |
| success_rate | decimal(5,2) | 否 | 历史成功率（%） |
| usage_count | integer | 否 | 使用次数 |
| usage_count_monthly | integer | 否 | 月使用次数 |
| unique_users | integer | 否 | 独立用户数 |
| last_used_date | datetime | 否 | 最近使用日期 |
| last_used_in_project | text | 否 | 最近使用项目ID |
| rating_avg | decimal(3,1) | 否 | 平均评分 |
| rating_count | integer | 否 | 评分次数 |
| feedback_summary | text | 否 | 反馈摘要 |
| auto_recommend | boolean | 否 | 是否自动推荐 |
| recommend_conditions | text | 否 | 推荐条件（JSON） |
| recommend_priority | integer | 否 | 推荐优先级（1-10） |
| version | text | 否 | 版本号 |
| version_notes | text | 否 | 版本说明 |
| effective_start | date | 否 | 生效开始日期 |
| effective_end | date | 否 | 生效结束日期 |
| is_active | boolean | 否 | 是否激活 |
| is_featured | boolean | 否 | 是否精选 |
| is_draft | boolean | 否 | 是否草稿 |
| status | enum | 是 | 状态 |
| created_by | text | 是 | 创建人 |
| approved_by | text | 否 | 审核人 |
| published_by | text | 否 | 发布人 |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**pkg_content JSON结构示例：**
```json
{
  "summary": "针织衫起拱问题解决方案包",
  "included_items": [
    {
      "type": "expert_knowledge",
      "id": "KNOW-001",
      "title": "袖山吃势调整经验"
    },
    {
      "type": "doc",
      "id": "DOC-QC-001",
      "title": "针织衫质量检验标准"
    },
    {
      "type": "form_template",
      "id": "FORM-QC-001",
      "title": "起拱缺陷记录表"
    },
    {
      "type": "term",
      "id": "TERM-TECH-015",
      "title": "吃势"
    }
  ],
  "attachments": ["checklist.pdf", "video_tutorial.mp4"]
}
```

**applicable_segments JSON示例：**
```json
[
  "快时尚",
  "高定",
  "运动服",
  "童装"
]
```

**recommend_conditions JSON示例：**
```json
{
  "project_type": ["主线款", "快反款"],
  "product_category": ["针织衫", "T恤"],
  "material_types": ["棉针织", "混纺针织"],
  "season_codes": ["SS", "AW"],
  "trigger_keywords": ["起拱", "变形", "卷边"]
}
```

**枚举值：**

pkg_type:
- 季节方案
- 问题库
- 合规包
- 培训包
- 最佳实践
- 故障排除
- 设计规范
- 工艺指南

status:
- 草稿
- 审核中
- 已发布
- 已归档
- 已停用

**索引：**
- 主索引：pkg_id
- 普通索引：pkg_code（唯一）
- 普通索引：pkg_type
- 普通索引：applicable_segments
- 普通索引：applicable_products
- 普通索引：target_roles
- 普通索引：auto_recommend
- 普通索引：status

**关系：**
- 关联 expert_knowledge（专家知识）
- 关联 doc_master（文档）
- 关联 form_template（表单模板）
- 关联 term_glossary（术语）
- 关联 project_master（项目使用）

---

## form_template（表单模板表）

**表描述：** 管理标准表单模板，支持字段自动绑定术语和行业规则验证

**主键：** template_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| template_id | text | 是 | 模板ID |
| template_code | text | 否 | 模板编号 |
| template_name | text | 是 | 模板名称 |
| form_type | enum | 是 | 表单类型 |
| template_description | text | 否 | 模板描述 |
| field_schema | text | 是 | 字段结构（JSON） |
| linked_terms | text | 否 | 关联术语（JSON数组） |
| validation_rules | text | 否 | 验证规则（JSON） |
| default_values | text | 否 | 默认值（JSON） |
| conditional_logic | text | 否 | 条件逻辑（JSON） |
| applicable_scenarios | text | 否 | 适用场景（JSON数组） |
| applicable_products | text | 否 | 适用产品（JSON数组） |
| target_roles | text | 否 | 目标角色（JSON数组） |
| estimated_completion_time | text | 否 | 预计完成时间 |
| completion_steps | text | 否 | 填写步骤（JSON数组） |
| help_text | text | 否 | 帮助文本（JSON） |
| sample_data | text | 否 | 示例数据（JSON） |
| attachment_templates | text | 否 | 附件模板（JSON数组） |
| compliance_fields | text | 否 | 合规必填字段（JSON） |
| required_approvals | text | 否 | 必填审批（JSON数组） |
| version | text | 否 | 版本号 |
| previous_version | text | 否 | 前一版本 |
| parent_template_id | text | 否 | 父模板ID |
| usage_count | integer | 否 | 使用次数 |
| avg_completion_time | decimal(10,1) | 否 | 平均完成时间（分钟） |
| completion_rate | decimal(5,2) | 否 | 完成率（%） |
| error_rate | decimal(5,2) | 否 | 错误率（%） |
| rating_avg | decimal(3,1) | 否 | 评分 |
| rating_count | integer | 否 | 评分次数 |
| related_knowledge_pkg | text | 否 | 关联知识包（JSON数组） |
| related_docs | text | 否 | 关联文档（JSON数组） |
| status | enum | 是 | 状态 |
| effective_date | date | 否 | 生效日期 |
| expiry_date | date | 否 | 过期日期 |
| replaces | text | 否 | 替代模板ID |
| is_mandatory | boolean | 否 | 是否强制使用 |
| is_system_template | boolean | 否 | 是否系统模板 |
| customization_allowed | boolean | 否 | 是否允许定制 |
| tags | text | 否 | 标签（JSON数组） |
| notes | text | 否 | 备注 |
| created_by | text | 是 | 创建人 |
| approved_by | text | 否 | 审核人 |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**field_schema JSON结构示例：**
```json
{
  "fields": [
    {
      "field_id": "field_001",
      "field_name": "产品名称",
      "field_label": "产品名称",
      "field_type": "text",
      "required": true,
      "max_length": 100,
      "placeholder": "请输入产品名称"
    },
    {
      "field_id": "field_002",
      "field_name": "洗水方式",
      "field_label": "洗水方式",
      "field_type": "select",
      "options": [
        {"value": "石洗", "label": "石洗"},
        {"value": "冰洗", "label": "冰洗"},
        {"value": "酶洗", "label": "酶洗"},
        {"value": "漂洗", "label": "漂洗"},
        {"value": "炒雪花", "label": "炒雪花"}
      ],
      "required": true,
      "linked_term": "TECH-001",
      "linked_term_name": "洗水工艺"
    },
    {
      "field_id": "field_003",
      "field_name": "克重",
      "field_label": "面料克重(g/m²)",
      "field_type": "number",
      "required": true,
      "unit": "g/m²",
      "min": 100,
      "max": 500,
      "linked_term": "FAB-001",
      "linked_term_name": "克重",
      "validation_rule": ">= 180 AND <= 400",
      "industry_std": "ISO 3801:2019"
    },
    {
      "field_id": "field_004",
      "field_name": "色牢度等级",
      "field_label": "色牢度等级",
      "field_type": "select",
      "options": [
        {"value": "1", "label": "1级（差）"},
        {"value": "2", "label": "2级（较差）"},
        {"value": "3", "label": "3级（一般）"},
        {"value": "4", "label": "4级（良好）"},
        {"value": "5", "label": "5级（优秀）"}
      ],
      "required": true,
      "linked_term": "QC-001",
      "linked_term_name": "色牢度",
      "validation_rule": ">= 3",
      "industry_std": "ISO 105-C06"
    },
    {
      "field_id": "field_005",
      "field_name": "交期天数",
      "field_label": "最短交期（天）",
      "field_type": "number",
      "required": true,
      "unit": "天",
      "min": 1,
      "validation_rule": ">= 15",
      "validation_message": "绣花工艺最短交期不能少于15天"
    }
  ]
}
```

**validation_rules JSON示例：**
```json
{
  "field_001": {
    "required": true,
    "max_length": 100
  },
  "field_003": {
    "required": true,
    "numeric_range": [180, 400],
    "custom_rule": "面料克重必须在180-400g/m²之间"
  },
  "field_005": {
    "required": true,
    "numeric_range": [15, null],
    "custom_rule": "绣花工艺最短交期不能少于15天",
    "industry_experience": "绣花交期受设备排期限制"
  }
}
```

**枚举值：**

form_type:
- 洗水唛工艺确认表
- 吊牌信息表
- 质检记录表
- 样品确认表
- 交期确认表
- 色卡确认表
- 包装确认表
- 订单明细表
- 退货申请单
- 供应商评估表

status:
- 草稿
- 审核中
- 已发布
- 已归档
- 已停用

**索引：**
- 主索引：template_id
- 普通索引：template_code（唯一）
- 普通索引：form_type
- 普通索引：applicable_scenarios
- 普通索引：status

**关系：**
- 关联 term_glossary（术语绑定）
- 关联 knowledge_package（知识包关联）
- 关联 doc_master（文档关联）

---

## 知识包与表单联动

### 联动关系图

```
knowledge_package
┌─────────────────────────────────────────────────────────────────┐
│ pkg_id: PKG-QC-001                                              │
│ pkg_name: 针织衫起拱问题库                                     │
│ pkg_type: 问题库                                                │
│ auto_recommend: true                                            │
└─────────────────────────────────────────────────────────────────┘
        │
        │ contains
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 包含内容：                                                        │
│ ├── expert_knowledge: KNOW-001（袖山吃势调整经验）              │
│ ├── doc: DOC-QC-001（针织衫质量检验标准）                       │
│ ├── form_template: FORM-QC-001（起拱缺陷记录表）               │
│ └── term: TERM-TECH-015（吃势术语定义）                        │
└─────────────────────────────────────────────────────────────────┘
```

### 自动推荐规则

```json
{
  "trigger_event": "project_type = '主线款' AND product_category = '针织衫'",
  "recommended_packages": [
    {
      "pkg_id": "PKG-QC-001",
      "pkg_name": "针织衫起拱问题库",
      "priority": 1,
      "reason": "主线款针织衫建议配置"
    },
    {
      "pkg_id": "PKG-TECH-001",
      "pkg_name": "针织工艺规范包",
      "priority": 2,
      "reason": "针织品类通用工艺知识"
    }
  ]
}
```

---

## 行业规则内嵌

### 服装行业经验规则库

| 规则名称 | 规则内容 | 适用范围 |
|----------|----------|----------|
| 绣花交期规则 | 最短交期 >= 15天 | 洗水唛确认表 |
| 印花交期规则 | 最短交期 >= 10天 | 交期确认表 |
| 克重范围规则 | 春夏：180-280g/m² | 面料确认表 |
| 克重范围规则 | 秋冬：250-400g/m² | 面料确认表 |
| 色牢度要求 | 深色面料 >= 3级 | 质检记录表 |
| 色牢度要求 | 浅色面料 >= 4级 | 质检记录表 |
| 缩水率要求 | 针织 <= 5%，梭织 <= 3% | 质检记录表 |
| 包装数量规则 | 单色单码 >= 6件/包 | 包装确认表 |

### 法规合规字段

| 法规 | 必填字段 | 验证规则 |
|------|----------|----------|
| EU Textile Regulation | 纤维成分、洗涤说明 | 必填 |
| US CPSIA | 追踪标签、年龄分级 | 必填 |
| GB 5296.4 | 制造信息、价格 | 必填（中国） |
| ZDHC MRSL | 受限物质清单 | 环保证书 |

---

## 场景化封装示例

### 季节方案包

```json
{
  "pkg_id": "PKG-SS25-001",
  "pkg_name": "SS25春夏新品开发包",
  "pkg_type": "季节方案",
  "applicable_seasons": ["SS25"],
  "applicable_segments": ["快时尚", "高定"],
  "included_items": {
    "terms": ["FAB-001~FAB-010"],
    "forms": ["洗水唛模板", "色卡确认表"],
    "docs": ["SS25流行趋势指南"],
    "knowledge": ["春夏面料选择建议"]
  }
}
```

### 问题库包

```json
{
  "pkg_id": "PKG-QC-002",
  "pkg_name": "色差问题解决方案库",
  "pkg_type": "问题库",
  "problem_solved": "解决面料色差、缸差问题",
  "applicable_products": ["梭织面料", "牛仔"],
  "included_items": {
    "knowledge": [
      {"id": "KNOW-CLR-001", "title": "缸差控制经验"},
      {"id": "KNOW-CLR-002", "title": "染色工艺调整"}
    ],
    "forms": ["色差对比记录表", "染料配方确认表"],
    "terms": ["色差ΔE值", "缸差定义"]
  }
}
```
