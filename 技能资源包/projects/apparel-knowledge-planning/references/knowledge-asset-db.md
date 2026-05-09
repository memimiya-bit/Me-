# 知识资产核心表

## 目录

- [term_glossary（术语表）](#term_glossary术语表)
- [expert_knowledge（专家知识表）](#expert_knowledge专家知识表)

---

## term_glossary（术语表）

**表描述：** 统一管理服装行业专业术语，解决跨境供应链术语歧义问题

**主键：** term_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| term_id | text | 是 | 术语唯一ID |
| term_code | text | 是 | 术语编码（FAB-xxx/TECH-xxx/RSL-xxx） |
| term_name | text | 是 | 术语名称 |
| definition | text | 是 | 术语定义 |
| description | text | 否 | 详细说明 |
| industry_std | text | 否 | 关联行业标准 |
| std_section | text | 否 | 标准条款 |
| multi_lang | text | 是 | 多语言映射（JSON） |
| related_terms | text | 否 | 关联术语ID列表（JSON） |
| term_category | enum | 是 | 术语类别 |
| sub_category | text | 否 | 子类别 |
| measurement_unit | text | 否 | 计量单位 |
| typical_value_range | text | 否 | 典型取值范围 |
| applicable_materials | text | 否 | 适用物料（JSON数组） |
| applicable_products | text | 否 | 适用产品（JSON数组） |
| country_conflicts | text | 否 | 多国标准冲突（JSON） |
| compliance_requirements | text | 否 | 合规要求（JSON） |
| last_std_update | date | 否 | 最近标准更新日期 |
| expert_approved | boolean | 否 | 是否专家审核 |
| approved_by | text | 否 | 审核人 |
| usage_guidance | text | 否 | 使用指导 |
| examples | text | 否 | 示例说明 |
| version | text | 否 | 版本号 |
| status | enum | 是 | 状态 |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**multi_lang JSON结构示例：**
```json
{
  "zh-CN": "克重",
  "zh-HK": "布料重量",
  "en": "Fabric Weight / GSM",
  "it": "Grammatura",
  "vi": "Trọng lượng vải",
  "ja": "生地目付"
}
```

**country_conflicts JSON结构示例：**
```json
{
  "EU_REACH": {"max_limit": "0.1%", "status": "受限"},
  "US_CPSC": {"max_limit": "0.01%", "status": "更严格"},
  "conflict_note": "欧盟与美国对某些偶氮染料的限制值不同，需同时满足"
}
```

**枚举值：**

term_category:
- 面料类（FAB）
- 辅料类（ACC）
- 工艺类（TECH）
- 环保类（RSL）
- 质检类（QC）
- 合规类（REG）
- 尺寸类（SIZ）
- 颜色类（CLR）

status:
- 草稿
- 审核中
- 已发布
- 已废弃

**索引：**
- 主索引：term_id
- 普通索引：term_code（唯一）
- 普通索引：term_name
- 普通索引：term_category
- 普通索引：industry_std
- 全文索引：definition

---

## expert_knowledge（专家知识表）

**表描述：** 将隐性知识显性化，支持向量检索和历史解决方案复用

**主键：** knowledge_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| knowledge_id | text | 是 | 知识唯一ID |
| knowledge_title | text | 是 | 知识标题 |
| source_type | enum | 是 | 来源类型 |
| source_expert | text | 否 | 来源专家 |
| expert_dept | text | 否 | 专家部门 |
| expert_tenure | integer | 否 | 专家从业年限 |
| content | text | 是 | 知识内容（支持文本/图片/3D模型URL） |
| content_type | enum | 是 | 内容类型 |
| embedding_vector | text | 否 | 向量索引（用于语义搜索） |
| applicable_scenarios | text | 是 | 适用场景（JSON数组） |
| tags | text | 否 | 标签（JSON数组） |
| validation_cases | text | 否 | 验证案例（JSON数组） |
| validated_count | integer | 否 | 验证次数 |
| success_rate | decimal(5,2) | 否 | 成功率（%） |
| related_project_ids | text | 否 | 关联项目ID（JSON数组） |
| related_terms | text | 否 | 关联术语ID（JSON数组） |
| related_docs | text | 否 | 关联文档ID（JSON数组） |
| difficulty_level | enum | 否 | 难度等级 |
| transfer_status | enum | 否 | 知识传承状态 |
| transfer_plan | text | 否 | 传承计划 |
| transfer_deadline | date | 否 | 传承截止日期 |
| business_impact | enum | 否 | 业务影响 |
| cost_saving | decimal(18,2) | 否 | 预估成本节约 |
| time_saving_hours | decimal(10,1) | 否 | 预估时间节约 |
| reuse_count | integer | 否 | 被引用次数 |
| last_reused_date | date | 否 | 最近引用日期 |
| last_validated_date | date | 否 | 最近验证日期 |
| expiry_date | date | 否 | 知识有效期 |
| needs_refresh | boolean | 否 | 是否需要更新 |
| refresh_reason | text | 否 | 更新原因 |
| version | text | 否 | 版本号 |
| status | enum | 是 | 状态 |
| created_by | text | 是 | 创建人 |
| approved_by | text | 否 | 审核人 |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**content_type JSON示例：**
```json
{
  "type": "mixed",
  "text": "袖山吃势调整经验：针对女装的袖山吃势...",
  "images": ["img_url_1", "img_url_2"],
  "video": "video_url",
  "3d_model": "model_url",
  "attachments": ["attachment_url"]
}
```

**validation_cases JSON结构示例：**
```json
[
  {
    "case_id": "VC-001",
    "project_id": "PRJ-SS24-001",
    "case_description": "SS24女装T恤袖山起拱问题",
    "solution_applied": "袖山吃势调整为0.3cm",
    "result": "起拱问题解决",
    "validated_date": "2024-03-15",
    "validated_by": "张师傅"
  }
]
```

**applicable_scenarios JSON示例：**
```json
[
  "羽绒服充绒量修正",
  "牛仔洗水变形预防",
  "针织衫领口卷边",
  "西装袖口起泡处理"
]
```

**枚举值：**

source_type:
- 老师傅口述
- 事故报告
- 设计笔记
- 测试报告
- 客户反馈
- 行业标准
- 培训材料

content_type:
- 文本
- 图片
- 视频
- 3D模型
- 混合

difficulty_level:
- 入门
- 进阶
- 高级
- 专家

transfer_status:
- 待传承
- 传承中
- 已传承
- 无需传承

business_impact:
- 高（减少损失>10万）
- 中（减少损失1-10万）
- 低（减少损失<1万）

status:
- 草稿
- 待验证
- 已验证
- 已发布
- 已归档

**索引：**
- 主索引：knowledge_id
- 普通索引：source_type
- 普通索引：tags
- 普通索引：applicable_scenarios
- 普通索引：related_project_ids
- 向量索引：embedding_vector

**关系：**
- 关联 term_glossary（术语关联）
- 关联 doc_master（文档关联）
- 关联 project_master（项目验证）

---

## 术语编码体系

### 编码规则

| 前缀 | 类别 | 编码示例 | 说明 |
|------|------|----------|------|
| FAB | 面料类 | FAB-001 ~ FAB-999 | 面料相关术语 |
| ACC | 辅料类 | ACC-001 ~ ACC-999 | 辅料相关术语 |
| TECH | 工艺类 | TECH-001 ~ TECH-999 | 工艺相关术语 |
| RSL | 环保类 | RSL-001 ~ RSL-999 | 环保/受限物质 |
| QC | 质检类 | QC-001 ~ QC-999 | 质量检测相关 |
| REG | 合规类 | REG-001 ~ REG-999 | 法规合规相关 |
| SIZ | 尺寸类 | SIZ-001 ~ SIZ-999 | 尺码规格相关 |
| CLR | 颜色类 | CLR-001 ~ CLR-999 | 色彩染相关 |

### 常用术语示例

| term_code | term_name | definition | industry_std |
|-----------|-----------|------------|--------------|
| FAB-001 | 克重 | 面料单位面积重量，单位g/m² | ISO 3801:2019 |
| FAB-002 | 纱支 | 纱线粗细规格，如40S、60S | GB/T 398 |
| FAB-003 | 密度 | 经纬纱密度，根/英寸 | ISO 7211-2 |
| FAB-004 | 缩水率 | 洗涤后尺寸变化率 | AATCC 135 |
| FAB-005 | 色牢度 | 颜色抵抗褪色能力 | ISO 105-C系列 |
| FAB-006 | 克重 | 面料单位面积重量，单位g/m² | ISO 3801:2019 |
| TECH-001 | 洗水工艺 | 面料水洗处理工艺 | - |
| TECH-002 | 烧毛 | 去除面料表面绒毛的工艺 | - |
| TECH-003 | 丝光 | 提高面料光泽度的工艺 | GB/T 8629 |
| RSL-001 | AZO染料 | 偶氮染料（受限物质） | EU REACH附录XVII |
| RSL-002 | 塑化剂 | 邻苯二甲酸盐类（受限） | US CPSC 16 CFR 1308 |
| QC-001 | 克重 | 面料单位面积重量，单位g/m² | ISO 3801:2019 |
| QC-002 | 破强力 | 面料断裂强度 | ISO 13934-1 |
| REG-001 | REACH | 欧盟化学品注册法规 | EU 1907/2006 |
| REG-002 | CPSIA | 美国消费品安全改进法案 | US Public Law 110-314 |

---

## 向量检索配置

### 向量化策略

| 内容类型 | 向量化方式 | 向量维度 |
|----------|------------|----------|
| 文本描述 | text-embedding-ada-002 | 1536 |
| 工艺流程图 | OCR+文本向量化 | 1536 |
| 3D模型 | 特征提取向量化 | 512 |
| 视频 | 关键帧提取+向量化 | 1536 |

### 语义搜索示例

```
输入查询："针织衫领口卷边"

语义匹配结果：
1. 【相似度0.92】针织领口防卷边处理工艺（TECH-015）
   - 来源：老师傅口述
   - 验证案例：3个
   
2. 【相似度0.87】秋冬打底衫领口工艺规范（DOC-TECH-2024-001）
   - 关联项目：PRJ-AW24-005
   
3. 【相似度0.81】领口卷边质量问题库（PKG-QC-001）
   - 包含12个历史解决方案
```

---

## 知识传承机制

### 传承流程

```
专家经验录入
     │
     ▼
expert_knowledge 创建
source_type = "老师傅口述"
     │
     ▼
至少3个validation_cases验证
     │
     ▼
transfer_status = "待传承"
     │
     ▼
指定传承对象
transfer_deadline = 离职前30天
     │
     ▼
完成传承验收
transfer_status = "已传承"
     │
     ▼
知识归档
status = "已归档"
```

### 传承质量保障

| 要求 | 说明 |
|------|------|
| 最低验证案例 | 至少3个validation_cases |
| 最低引用次数 | 至少5次reuse_count |
| 定期刷新 | 每年检查一次needs_refresh |
| 离职前置 | transfer_deadline = 离职前30天 |
