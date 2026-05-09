# 三库联动机制

## 目录

- [三库联动架构](#三库联动架构)
- [联动场景设计](#联动场景设计)
- [典型业务场景](#典型业务场景)
- [行业痛点解决方案](#行业痛点解决方案)

---

## 三库联动架构

### 架构概览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         三库联动架构                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐     ┌─────────────────────┐                  │
│  │  project_node_db    │     │   org_collab_db     │                  │
│  │    (项目节点库)      │     │    (组织协作库)     │                  │
│  │                     │     │                     │                  │
│  │  project_master     │     │  org_collab_         │                  │
│  │  node_mapping       │◀──▶│    agreement         │                  │
│  │  project_bom        │     │  collab_instance    │                  │
│  └──────────┬──────────┘     │  relationship_      │                  │
│              │               │    history          │                  │
│              │               └──────────┬──────────┘                  │
│              │                          │                              │
│              │              ┌───────────┴───────────┐                  │
│              │              │                       │                  │
│              ▼              ▼                       ▼                  │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                  fashion_knowledge_db                           │     │
│  │                      (知识文档库)                                │     │
│  │                                                                │     │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │     │
│  │  │知识资产核心表│ │文档流转中枢表 │ │业务场景知识包 │           │     │
│  │  │              │ │              │ │              │           │     │
│  │  │term_glossary │ │doc_master   │ │knowledge_pkg │           │     │
│  │  │expert_know   │ │doc_flow     │ │form_template │           │     │
│  │  │              │ │version_ctrl │ │              │           │     │
│  │  └──────────────┘ └──────────────┘ └──────────────┘           │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 核心联动关系

| 源库 | 目标库 | 联动关系 | 说明 |
|------|--------|----------|------|
| project_master | term_glossary | 1:N | 项目关联术语 |
| project_master | knowledge_package | N:1 | 项目使用知识包 |
| node_mapping | doc_flow | 1:N | 节点触发文档流转 |
| node_mapping | expert_knowledge | N:M | 节点关联专家知识 |
| collab_instance | doc_flow | 1:N | 协作触发文档发送 |
| org_collab_agreement | doc_master | 1:N | 协议关联文档 |
| relationship_history | knowledge_package | 1:N | 关系变更影响知识包 |
| doc_master | version_control | 1:N | 文档关联版本 |

---

## 联动场景设计

### 联动场景总表

| 联动场景 | 触发条件 | 联动结果 | 自动化程度 |
|----------|----------|----------|------------|
| 新项目创建 | project_master 插入 | 自动推送相关知识包 | 高 |
| 项目类型匹配 | project_type 确定 | 推送季节方案/合规包 | 高 |
| 节点协作启动 | node_mapping 创建 | 自动创建文档流转 | 高 |
| 质检争议提交 | doc_flow 状态=驳回 | 检索专家知识库 | 中 |
| 协议终止 | change_reason=环保违规 | 锁定关联知识包 | 高 |
| 术语变更 | term_glossary 更新 | 通知受影响项目 | 高 |
| 文档合规检查 | compliance_result=不通过 | 触发培训包推送 | 中 |
| 专家经验录入 | expert_knowledge 验证通过 | 自动关联相关项目 | 中 |

### 联动配置表

```yaml
sync_rules:
  - rule_id: SYNC-001
    trigger:
      source_table: project_master
      event: INSERT
    condition:
      project_type: ['主线款', '快反款']
    action:
      target_table: knowledge_package
      action_type: RECOMMEND
      filter:
        pkg_type: ['季节方案', '合规包']
        applicable_segments: 自动匹配
    
  - rule_id: SYNC-002
    trigger:
      source_table: doc_flow
      event: UPDATE
      condition:
        status: '驳回'
    action:
      target_table: expert_knowledge
      action_type: SEARCH
      semantic_query: "从doc_flow获取问题描述"
    
  - rule_id: SYNC-003
    trigger:
      source_table: relationship_history
      event: INSERT
    condition:
      change_reason: '环保违规'
    action:
      target_table: knowledge_package
      action_type: LOCK
      filter:
        related_terms: '包含RSL术语'
```

---

## 典型业务场景

### 场景一：新季节项目创建与知识推送

**流程：**

```
品牌设计部创建SS25项目
    │
    ▼
project_master 新增记录
project_type = '主线款'
season_code = 'SS25'
product_category = '羽绒服'
    │
    ▼
触发联动规则 SYNC-001
    │
    ▼
查询 term_glossary
filter: season='SS25' AND category='羽绒服'
    │
    ▼
返回 RSL禁用物质清单
└── term_code: RSL-001~RSL-050
└── compliance_check: ZDHC MRSL v3.1
    │
    ▼
推送匹配知识包
├── PKG-SS25-COMPLIANCE（SS25羽绒服合规包）
├── PKG-羽绒服-工艺规范
└── PKG-羽絨服-质量检验标准
    │
    ▼
关联至 project_master
knowledge_package_ids = [PKG-xxx...]
    │
    ▼
node_mapping 自动创建
├── 节点：品牌设计组
├── 节点：面料供应商（关联RSL检查）
└── 节点：代工厂（关联工艺规范）
    │
    ▼
doc_flow 自动创建
├── 发送：工艺规范 → 代工厂
└── 发送：合规清单 → 面料供应商
```

### 场景二：质检争议快速解决

**流程：**

```
代工厂在doc_flow提交质检驳回
trigger_event: '品质异常'
doc_flow.status = '已驳回'
    │
    ▼
触发联动规则 SYNC-002
    │
    ▼
获取问题描述
├── doc_title: 色差检验报告
├── rejection_reason: 面料存在明显色差
└── 相关术语: CLR-001（色差）, CLR-002（缸差）
    │
    ▼
语义检索 expert_knowledge
semantic_query: "面料色差解决方案"
    │
    ▼
返回匹配知识
├── KNOW-CLR-001: 缸差控制经验（相似度0.92）
├── KNOW-CLR-002: 染色工艺调整（相似度0.87）
└── KNOW-CLR-003: 色卡确认标准（相似度0.85）
    │
    ▼
生成仲裁报告
├── 问题描述
├── 相关术语定义（term_glossary）
├── 历史解决方案（expert_knowledge）
├── 建议处理方案
└── 标准依据（industry_std）
    │
    ▼
推送至双方协作协议
org_collab_agreement
└── collab_instance 创建
    │
    ▼
自动创建跟进知识包
PKG: 色差问题处理包
└── 包含: 解决方案+检验标准+确认表单
```

### 场景三：老师傅经验传承

**流程：**

```
版房张师傅录入经验
expert_knowledge 创建
├── source_type: '老师傅口述'
├── expert_tenure: 25年
├── content: '袖山吃势调整经验'
└── validation_cases: 待验证
    │
    ▼
完成3个validation_cases
├── 案例1: SS24女装T恤（通过）
├── 案例2: AW24针织衫（通过）
└── 案例3: 快反款打底衫（通过）
    │
    ▼
expert_knowledge 状态更新
status = '已验证'
success_rate = 100%
    │
    ▼
设置传承计划
transfer_status: '待传承'
transfer_deadline: 2024-06-01（退休前30天）
    │
    ▼
关联至 knowledge_package
├── PKG-针织工艺规范包
└── linked_knowledge_ids: [KNOW-xxx]
    │
    ▼
项目创建时自动推送
当 project_type='针织衫'
    │
    ▼
新人学习并反馈
├── usage_count +1
├── rating_avg 更新
└── 经验成功传承
```

---

## 行业痛点解决方案

### 痛点一：专业术语混乱

**问题描述：** 各部门自定义词汇表，跨境沟通时术语歧义严重

**解决方案：**

| 措施 | 实现方式 | 效果 |
|------|----------|------|
| 统一术语ID体系 | term_glossary.term_code 强制唯一 | 减少30%以上因术语歧义导致的生产错误 |
| 多语言精准映射 | term_glossary.multi_lang 支持7+语言 | 解决跨境供应链术语歧义 |
| 关联行业标准 | term_glossary.industry_std 绑定ISO/GB | 提供标准依据 |
| 文档自动绑定 | doc_flow.compliance_check 关联术语 | 确保文档使用正确术语 |

**示例：**

```json
{
  "term_code": "FAB-001",
  "term_name": "克重",
  "multi_lang": {
    "zh-CN": "克重",
    "en": "Fabric Weight / GSM",
    "it": "Grammatura",
    "vi": "Trọng lượng vải"
  },
  "industry_std": "ISO 3801:2019",
  "applicable_materials": ["所有面料"]
}
```

### 痛点二：跨组织文档断层

**问题描述：** 工艺单依赖邮件/微信传递，版本混乱，追踪困难

**解决方案：**

| 措施 | 实现方式 | 效果 |
|------|----------|------|
| 完整流转追踪 | doc_flow.from_node→to_node | 精确追踪文档传递 |
| 关键动作闭环 | doc_flow.required_actions | 确保每个环节确认 |
| 版本控制 | version_control.approval_chain | 工艺变更多角色会签 |
| 合规穿透检查 | doc_flow.compliance_check | 自动验证RSL标准 |

**示例：**

```sql
-- 查询SS24项目中所有超时未完成的文档流转
SELECT 
    df.doc_title,
    df.from_org_name,
    df.to_org_name,
    df.transmit_timestamp,
    df.required_actions,
    df.is_overdue,
    df.overdue_days
FROM doc_flow df
JOIN doc_master dm ON df.doc_id = dm.doc_id
JOIN project_master pm ON df.related_project_id = pm.project_id
WHERE pm.season_code = 'SS24'
  AND df.is_overdue = true
ORDER BY df.overdue_days DESC;
```

### 痛点三：隐性知识流失

**问题描述：** 老师傅经验随离职流失，事故重复发生

**解决方案：**

| 措施 | 实现方式 | 效果 |
|------|----------|------|
| 知识显性化 | expert_knowledge.source_type | 记录知识来源 |
| 验证机制 | expert_knowledge.validation_cases >= 3 | 确保知识有效 |
| 传承计划 | expert_knowledge.transfer_deadline | 离职前30天完成 |
| 自动推荐 | knowledge_package.auto_recommend | 项目创建时推送 |

**传承流程：**

```
老师傅在职
    │
    ▼
录入经验
expert_knowledge 创建
    │
    ▼
完成验证（≥3个案例）
validation_cases 验证通过
    │
    ▼
设置传承截止
transfer_deadline = 离职前30天
    │
    ▼
指定传承对象
transfer_plan 确定
    │
    ▼
完成传承验收
transfer_status = '已传承'
    │
    ▼
知识归档
status = '已归档'
└── 知识永久保留在库中
```

### 痛点四：多国合规冲突

**问题描述：** 欧盟REACH与美国CPSC对同一种物质限制值不同，难以同时满足

**解决方案：**

| 措施 | 实现方式 | 效果 |
|------|----------|------|
| 标准冲突标注 | term_glossary.country_conflicts | 明确标注冲突点 |
| 双重验证 | doc_flow.compliance_check | 同时验证多国标准 |
| 合规包推送 | knowledge_package | 自动推送最新合规要求 |

**示例：**

```json
{
  "term_code": "RSL-015",
  "term_name": "邻苯二甲酸酯",
  "country_conflicts": {
    "EU_REACH": {
      "max_limit": "0.1%",
      "status": "受限"
    },
    "US_CPSC": {
      "max_limit": "0.01%",
      "status": "更严格"
    },
    "conflict_note": "欧盟与美国对邻苯二甲酸酯的限制值不同，需同时满足两套标准"
  },
  "compliance_requirements": {
    "REACH": "附录XVII第51条",
    "CPSC": "16 CFR 1308"
  }
}
```

---

## 价值总结

### 三库架构价值

| 维度 | 传统方式 | 本方案 | 服装行业收益 |
|------|----------|--------|--------------|
| 术语管理 | 各部门自定义词汇表 | 全链路术语ID统一 | 减少30%以上因术语歧义导致的生产错误 |
| 文档追溯 | 依赖邮件/微信碎片化传递 | 完整记录from→to→required_actions | 质检争议处理时效从7天缩短至8小时 |
| 知识复用 | 事故重复发生（如每年冬季羽绒服充绒问题） | knowledge_package自动关联历史解决方案 | 快反项目问题解决效率提升50%+ |

### 核心指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 术语覆盖率 | 1200+ | 覆盖ZDHC MRSL、AATCC等标准 |
| 知识验证率 | 100% | 每个知识需≥3个验证案例 |
| 术语歧义投诉率 | < 5% | 较传统方式降低80% |
| 质检争议处理时效 | < 8小时 | 较传统方式提升90% |
| 专家知识传承率 | 100% | 离职前30天完成传承 |
| 文档合规检查覆盖率 | 100% | 流转文档100%合规检查 |
