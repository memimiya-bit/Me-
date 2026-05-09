# 项目概述
- **名称**: 飞书智能项目管理技能系统 V7.0（缝合版）
- **功能**: 合规驱动的项目管理闭环，缝合项目管理操作模板 + 合规校验

## 核心模块

### 1. 数据采集工作流
基于飞书多维表格的自动化任务管理，支持：
- 自动创建Base和表格
- 任务优先级识别与分配
- 逾期任务预警
- 飞书消息通知

### 2. 技能推荐工作流（V4.0）
基于技能迭代方案V4.0的实用导向岗位技能赋能体系，实现：
- 问题智能分析
- 技能精准匹配
- 技能包自动生成

### 3. 合规驱动工作流（V7.0）⭐ 新增
缝合项目管理操作模板 + 合规校验，实现：
- L1-L4四层过滤
- 操作模板智能匹配
- 六维合规术语词库
- 项目节点合规卡点

---

## 节点清单

### 合规驱动工作流节点（V7.0）

| 节点名 | 文件位置 | 类型 | 功能描述 | 配置文件 |
|-------|---------|------|---------|---------|
| l1_syntax_filter | `compliance_nodes.py` | task | L1语法层：语法检查+初筛违规词 | - |
| l2_rule_filter | `compliance_nodes.py` | task | L2规则层：模板+术语匹配 | - |
| l3_semantic_filter | `compliance_nodes.py` | task | L3语义层：业务语义+上下文判断 | - |
| l4_intent_filter | `compliance_nodes.py` | task | L4意图层：行动预测+合规预判 | - |
| decision_output | `compliance_nodes.py` | task | 决策输出：生成最终指令 | - |
| project_checkpoint | `compliance_nodes.py` | task | 项目节点合规卡点 | - |

**类型说明**: task(任务节点) / agent(大模型) / condition(条件分支) / looparray(列表循环) / loopcond(条件循环)

---

## 配置文件清单

| 配置文件 | 路径 | 说明 |
|---------|------|------|
| 字段定义 | `config/fields_definition.json` | 飞书表格字段类型、格式、校验规则 |
| 表格字段配置 | `data/table_field_config.json` | 任务跟踪、项目管理等表的字段配置 |
| 数据采集配置 | `data/data_collection_config.json` | 数据源、关键词提取、分流规则配置 |
| 技能矩阵配置 | `data/skill_matrix_config.json` | 技能迭代方案V4.0的完整配置 |
| 合规操作模板库 | `data/compliance_operation_templates.json` | V7.0操作模板+合规卡点 |
| 合规术语词库 | `data/compliance_term_library.json` | V7.0六维合规术语库 |

---

## 合规驱动工作流架构（L1-L4）

```
消息/事件输入
    ↓
L1语法层：基础语法检查 + 合规词初筛
    ↓
L2规则层：操作模板匹配 + 合规术语匹配
    ↓
L3语义层：业务语义理解 + 合规上下文判断
    ↓
L4意图层：行动需求预测 + 合规风险预判
    ↓
决策输出
```

---

## 合规操作模板库（V7.0）

### 核心模板
1. **新供应商导入** - 对外高敏感，含合同承诺用语校验
2. **产品上架审核** - 对外高敏感，含材质宣称合规检查
3. **客户合同签署** - 对外高敏感，含交付承诺、排他条款检查
4. **季度复盘** - 内部，无需合规检查
5. **样品评审** - 对外低敏感，避免过度承诺
6. **交期变更通知** - 对外低敏感，避免承诺性用语

### 项目节点合规卡点
| 阶段 | 检查点 | 不通过处理 |
|------|--------|-----------|
| 需求确认 | 需求文档合规 | 标记高风险条款，暂停推进 |
| 方案设计 | 方案描述合规 | 自动替换违规词 |
| 执行中 | 过程文件合规 | 合同提交前强制合规扫描 |
| 验收 | 交付物合规 | 不合规不允许验收通过 |
| 完成 | 归档合规 | 生成合规审计报告 |

---

## 六维合规术语词库（V7.0）

### 维度定义
1. **核心术语**: 标准词 + 变体 + 缩写
2. **业务权重**: 产品开发/供应商对接/内部沟通
3. **上下文规则**: 触发条件 + 排除条件
4. **时效属性**: 有效期 + 更新频率 + 状态
5. **关联知识**: 关联流程 + 关联文档 + 关联角色
6. **合规标记**: 法规依据 + 风险等级 + 推荐替换

### 典型违规词
| 术语 | 违规类型 | 风险等级 | 推荐替换 |
|------|---------|---------|---------|
| 100%纯棉 | 材质宣称 | 高 | 棉质面料（以水洗标为准） |
| 顶级工艺 | 绝对化用语 | 高 | 精致工艺 |
| 保证供货 | 虚假承诺 | 高 | 按约定供货 |
| 独家供应 | 排他条款 | 中 | 专项供应 |

---

## 工作流入口

### 合规驱动工作流
```python
from graphs.compliance_graph import compliance_main_graph
from graphs.compliance_state import ComplianceGraphInput

result = compliance_main_graph.invoke(ComplianceGraphInput(
    input_text="需要和新供应商签订独家供应合同",
    input_type="message",
    source_context="external"
))
```

### 项目节点合规检查
```python
from graphs.compliance_nodes import project_checkpoint_node

result = project_checkpoint_node({
    "project_phase": "需求确认",
    "content_to_check": "客户需求文档内容"
}, {}, None)
```
