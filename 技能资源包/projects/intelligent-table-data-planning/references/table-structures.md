# 核心表结构定义

## 目录

- [业务表结构](#业务表结构)
- [项目任务表](#项目任务表)
- [项目风险表](#项目风险表)
- [知识文档表](#知识文档表)
- [知识包表](#知识包表)
- [合同管理表](#合同管理表)

---

## 业务表结构

### departments（部门主数据表）

**表描述：** 企业部门主数据表，存储组织架构信息

**主键：** dept_code

**字段定义：**

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| dept_code | text | 唯一, 非空 | - | 部门唯一编码 |
| dept_name | text | 非空 | - | 部门名称 |
| parent_dept_code | text | 引用departments | - | 上级部门编码 |
| dept_level | integer | 范围[1,10] | - | 部门层级 |
| manager_id | text | 引用employees | - | 部门负责人ID |
| cost_center | text | - | - | 成本中心编码 |
| dept_type | enum | - | 执行层 | 部门类型 |
| active_status | boolean | - | true | 是否启用 |
| dt_created | datetime | - | 当前时间 | 创建时间 |
| dt_updated | datetime | - | 当前时间 | 更新时间 |

**索引：**
- 主索引：dept_code（唯一）
- 普通索引：dept_name
- 普通索引：manager_id
- 普通索引：parent_dept_code

**关系：**
- 1:N → employees（部门-员工）
- 1:N → projects（部门-项目）

---

## 项目任务表

### project_tasks（项目任务明细表）

**表描述：** 存储项目的任务分解和执行跟踪信息

**主键：** task_id

**字段定义：**

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| task_id | text | 唯一, 非空 | - | 任务唯一ID |
| project_code | text | 非空, 引用projects | - | 所属项目编码 |
| task_name | text | 非空 | - | 任务名称 |
| task_type | enum | - | - | 任务类型：设计/采购/生产/质量/销售/管理 |
| responsible_dept | text | 引用departments | - | 负责部门编码 |
| executor_id | text | 引用employees | - | 执行人ID |
| dt_plan_start | date | 非空 | - | 计划开始日期 |
| dt_plan_end | date | 非空 | - | 计划结束日期 |
| dt_actual_start | date | - | - | 实际开始日期 |
| dt_actual_end | date | - | - | 实际结束日期 |
| task_status | enum | - | 未开始 | 任务状态 |
| progress | integer | 范围[0,100] | 0 | 任务进度 |
| predecessor_task_id | text | 引用tasks | - | 前置任务ID |
| effort_hours | decimal(10,1) | 范围[0,] | 0 | 预计工时 |
| actual_hours | decimal(10,1) | 范围[0,] | 0 | 实际工时 |
| risk_level | enum | - | 低 | 风险等级：高/中/低 |
| deliverable_doc_id | text | 引用documents | - | 交付物文档ID |
| dt_created | datetime | - | 当前时间 | 创建时间 |
| dt_updated | datetime | - | 当前时间 | 更新时间 |

**枚举值：**

task_status:
- 未开始
- 进行中
- 已完成
- 已延期
- 已取消

task_type:
- 设计
- 采购
- 生产
- 质量
- 销售
- 管理

**索引：**
- 主索引：task_id（唯一）
- 普通索引：project_code
- 普通索引：responsible_dept
- 普通索引：task_status
- 普通索引：executor_id

**关系：**
- N:1 → projects（任务-项目）
- N:1 → departments（任务-部门）
- N:1 → employees（任务-执行人）
- 1:N → task_dependencies（任务-依赖任务）

**计算字段：**
- delay_days = CASE WHEN dt_actual_end > dt_plan_end THEN DATEDIFF(dt_actual_end, dt_plan_end) ELSE 0 END（延误天数）

---

## 项目风险表

### project_risks（项目风险记录表）

**表描述：** 记录项目风险信息和处置跟踪

**主键：** risk_id

**字段定义：**

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| risk_id | text | 唯一, 非空 | - | 风险唯一ID |
| project_code | text | 非空, 引用projects | - | 所属项目编码 |
| risk_title | text | 非空 | - | 风险标题 |
| risk_description | text | - | - | 风险描述 |
| risk_category | enum | - | - | 风险类别：延期/成本/质量/资源/外部 |
| risk_level | enum | - | 中 | 风险等级：高/中/低 |
| probability | integer | 范围[0,100] | - | 发生概率% |
| impact_score | integer | 范围[1,10] | - | 影响程度（1-10） |
| risk_score | integer | 计算得出 | - | 风险评分（概率×影响） |
| risk_status | enum | - | 识别中 | 风险状态 |
| mitigation_plan | text | - | - | 应对策略 |
| contingency_plan | text | - | - | 应急预案 |
| owner_id | text | 引用employees | - | 风险负责人 |
| dt_identified | date | - | 当前日期 | 识别日期 |
| dt_mitigated | date | - | - | 化解日期 |
| dt_created | datetime | - | 当前时间 | 创建时间 |
| dt_updated | datetime | - | 当前时间 | 更新时间 |

**计算规则：**
- risk_score = probability / 100 * impact_score * 10

---

## 知识文档表

### knowledge_documents（知识文档主表）

**表描述：** 存储企业知识文档的元数据

**主键：** doc_id

**字段定义：**

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| doc_id | text | 唯一, 非空 | - | 文档唯一ID |
| doc_name | text | 非空 | - | 文档名称 |
| doc_type | enum | - | - | 文档类型 |
| doc_category | text | - | - | 文档分类 |
| doc_version | text | - | 1.0 | 文档版本 |
| doc_path | text | 非空 | - | 文档存储路径 |
| file_size | integer | - | - | 文件大小（字节） |
| file_format | text | - | - | 文件格式：PDF/Word/Excel |
| author_id | text | 非空 | - | 作者ID |
| reviewer_id | text | - | - | 审核人ID |
| dt_created | datetime | 非空 | - | 创建时间 |
| dt_updated | datetime | 非空 | - | 更新时间 |
| dt_published | datetime | - | - | 发布时间 |
| keywords | text | - | - | 关键词（逗号分隔） |
| business_domain | enum | - | - | 业务域 |
| access_level | enum | - | 部门内 | 访问权限 |

**枚举值：**

doc_type:
- 流程文档
- 技术文档
- 合同文档
- 历史案例
- 培训材料
- 标准规范

business_domain:
- 设计研发
- 采购供应链
- 生产制造
- 品质管理
- 市场营销
- 销售管理

access_level:
- 公开
- 部门内
- 项目内
- 机密

**索引：**
- 主索引：doc_id（唯一）
- 普通索引：doc_name
- 普通索引：doc_type
- 普通索引：business_domain
- 普通索引：author_id

---

## 知识包表

### knowledge_packages（知识包管理表）

**表描述：** 管理知识文档的打包组合

**主键：** package_id

**字段定义：**

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| package_id | text | 唯一, 非空 | - | 知识包唯一ID |
| package_name | text | 非空 | - | 知识包名称 |
| package_description | text | - | - | 知识包描述 |
| business_scenario | enum | - | - | 业务场景 |
| target_role | text | - | - | 目标角色 |
| package_version | text | - | 1.0 | 包版本 |
| creator_id | text | 非空 | - | 创建人ID |
| dt_created | datetime | 非空 | - | 创建时间 |
| dt_updated | datetime | 非空 | - | 更新时间 |
| usage_count | integer | - | 0 | 使用次数 |
| rating | decimal(3,1) | 范围[0,5] | 0 | 评分 |
| status | enum | - | 草稿 | 状态：草稿/发布/归档 |

**枚举值：**

business_scenario:
- 销售流程
- 研发流程
- 商品管理
- 排产流程
- 风险管理
- 新员工入职

**关系：**
- 1:N → package_documents（知识包-文档关联）

---

## 合同管理表

### contracts（合同管理表）

**表描述：** 存储合同基本信息和状态

**主键：** contract_id

**字段定义：**

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| contract_id | text | 唯一, 非空 | - | 合同唯一ID |
| contract_code | text | 唯一, 非空 | - | 合同编号 |
| contract_name | text | 非空 | - | 合同名称 |
| contract_type | enum | - | - | 合同类型 |
| enterprise_code | text | 引用enterprises | - | 合作企业编码 |
| project_code | text | 引用projects | - | 关联项目编码 |
| signing_date | date | - | - | 签订日期 |
| effective_date | date | - | - | 生效日期 |
| expiry_date | date | - | - | 到期日期 |
| cur_contract_amount | decimal(18,2) | - | 0 | 合同金额 |
| cur_received_amount | decimal(18,2) | - | 0 | 已收金额 |
| cur_paid_amount | decimal(18,2) | - | 0 | 已付金额 |
| contract_status | enum | - | 起草中 | 合同状态 |
| signed_doc_id | text | 引用documents | - | 已签文档ID |
| signatory_a | text | - | - | 甲方签署人 |
| signatory_b | text | - | - | 乙方签署人 |
| contract_terms | text | - | - | 主要条款摘要 |
| dt_created | datetime | - | 当前时间 | 创建时间 |
| dt_updated | datetime | - | 当前时间 | 更新时间 |

**枚举值：**

contract_type:
- 采购合同
- 销售合同
- 服务合同
- 合作协议
- 租赁合同

contract_status:
- 起草中
- 审批中
- 已签订
- 执行中
- 已完成
- 已终止

---

## 表结构设计原则

### 命名规范
- 表名使用英文小写和下划线
- 表名为名词复数形式
- 避免缩写，使用完整单词
- 核心表不超过20个字段

### 字段设计
- 每张表必须有主键
- 必须包含创建时间和更新时间
- 敏感字段需加密存储
- 金额字段统一使用 decimal(18,2)

### 索引策略
- 主键自动建立唯一索引
- 外键字段建立普通索引
- 高频查询字段建立索引
- 避免过度索引（影响写入性能）

### 关联设计
- 优先使用外键约束数据完整性
- 多对多关系通过中间表实现
- 避免循环依赖
- 必要时使用逻辑删除而非物理删除
