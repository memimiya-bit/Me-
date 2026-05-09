# 组织协作数据库

## 目录

- [org_collab_agreement（协作协议表）](#org_collab_agreement协作协议表)
- [collab_instance（协作实例表）](#collab_instance协作实例表)
- [relationship_history（关系历史表）](#relationship_history关系历史表)

---

## org_collab_agreement（协作协议表）

**表描述：** 管理跨部门、跨组织的协作协议，支持精确到部门级的对接管理

**主键：** agreement_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| agreement_id | text | 是 | 协议唯一ID |
| agreement_name | text | 是 | 协议名称 |
| agreement_type | enum | 是 | 协议类型 |
| from_org_id | text | 是 | 发起方ID |
| from_org_name | text | 是 | 发起方名称 |
| from_dept | text | 否 | 发起方部门 |
| from_team | text | 否 | 发起方小组 |
| to_org_id | text | 是 | 接收方ID |
| to_org_name | text | 是 | 接收方名称 |
| to_dept | text | 否 | 接收方部门 |
| to_team | text | 否 | 接收方小组 |
| data_exchange_std | enum | 是 | 数据交换标准 |
| api_endpoint | text | 否 | API端点 |
| edi_format | text | 否 | EDI格式版本 |
| file_transfer_protocol | text | 否 | 文件传输协议 |
| integration_status | enum | 否 | 集成状态 |
| effective_start | date | 是 | 生效开始日期 |
| effective_end | date | 是 | 生效结束日期 |
| is_auto_renew | boolean | 否 | 是否自动续期 |
| renewal_notice_days | integer | 否 | 续期提前通知天数 |
| min_response_time_hours | decimal(5,2) | 否 | 最小响应时间（小时） |
| max_response_time_hours | decimal(5,2) | 否 | 最大响应时间（小时） |
| sla_warning_threshold | decimal(5,2) | 否 | SLA告警阈值（%） |
| escalation_rule | text | 否 | 升级规则（JSON） |
| cost_sharing | text | 否 | 成本分摊（JSON） |
| revenue_sharing | text | 否 | 收益分摊（JSON） |
| risk_level | enum | 否 | 风险等级 |
| compliance_requirements | text | 否 | 合规要求 |
| dispute_resolution | text | 否 | 争议解决机制 |
| contact_person_from | text | 否 | 发起方联系人 |
| contact_person_to | text | 否 | 接收方联系人 |
| agreement_value | decimal(18,2) | 否 | 协议金额 |
| currency | text | 否 | 币种 |
| payment_terms | text | 否 | 付款条件 |
| agreement_status | enum | 是 | 协议状态 |
| termination_clause | text | 否 | 终止条款 |
| dt_signed | date | 否 | 签约日期 |
| signed_by_from | text | 否 | 发起方签约人 |
| signed_by_to | text | 否 | 接收方签约人 |
| related_agreements | text | 否 | 关联协议（JSON数组） |
| notes | text | 否 | 备注 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

agreement_type:
- 订单协同（品牌商→代工厂）
- 库存共享（门店-中央仓）
- 设计共创（多方联合设计）
- 质量共建（品质标准共享）
- 物流协同（仓储配送）
- 数据共享（信息互通）
- 营销联动（联合推广）

data_exchange_std:
- EDI
- API
- Excel
- 邮件
- 纸质
- 混合

integration_status:
- 待集成
- 集成中
- 已集成
- 集成失败

agreement_status:
- 起草中
- 审批中
- 已签订
- 执行中
- 暂停
- 已到期
- 已终止

risk_level:
- 高风险
- 中风险
- 低风险

**索引：**
- 主索引：agreement_id
- 普通索引：agreement_type
- 普通索引：from_org_id
- 普通索引：to_org_id
- 普通索引：effective_start
- 普通索引：agreement_status
- 普通索引：integration_status

**关系：**
- 1:N → collab_instance（协议-协作实例）
- 1:N → relationship_history（协议-关系历史）

---

## collab_instance（协作实例表）

**表描述：** 记录每次跨组织协作交互，支持时效追踪和牛鞭效应追溯

**主键：** instance_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| instance_id | text | 是 | 实例唯一ID |
| agreement_id | text | 是 | 关联协议ID |
| trigger_event | enum | 是 | 触发事件 |
| trigger_source | text | 否 | 触发来源 |
| related_order_id | text | 否 | 关联订单ID |
| related_project_id | text | 否 | 关联项目ID |
| data_payload | text | 是 | 传输内容快照（JSON） |
| payload_hash | text | 否 | 内容哈希 |
| payload_size | integer | 否 | 内容大小（字节） |
| data_direction | enum | 是 | 数据方向 |
| from_timestamp | datetime | 是 | 发起时间（UTC） |
| to_timestamp | datetime | 否 | 接收时间（UTC） |
| response_time_hours | decimal(10,4) | 否 | 响应时间（小时） |
| response_status | enum | 是 | 响应状态 |
| sla_met | boolean | 否 | SLA是否达成 |
| sla_breach_reason | text | 否 | SLA违约原因 |
| processing_time_seconds | integer | 否 | 处理时长（秒） |
| validation_result | enum | 否 | 校验结果 |
| error_code | text | 否 | 错误代码 |
| error_message | text | 否 | 错误信息 |
| retry_count | integer | 否 | 重试次数 |
| escalation_triggered | boolean | 否 | 是否触发升级 |
| escalation_level | integer | 否 | 升级级别 |
| status | enum | 是 | 实例状态 |
| acknowledgment_required | boolean | 否 | 是否需要确认 |
| acknowledged_at | datetime | 否 | 确认时间 |
| acknowledged_by | text | 否 | 确认人 |
| related_instance_id | text | 否 | 关联实例ID |
| bullwhip_indicator | decimal(5,2) | 否 | 牛鞭效应指标 |
| demand_signal_strength | decimal(5,2) | 否 | 需求信号强度 |
| notes | text | 否 | 备注 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

trigger_event:
- 补货请求
- 退货通知
- 订单确认
- 交期确认
- 品质异常
- 设计变更
- 价格调整
- 库存预警
- 直播爆款补货
- 促销计划

data_direction:
- 请求（from→to）
- 响应（to→from）
- 双向同步

response_status:
- 成功
- 超时
- 驳回
- 错误
- 待确认

validation_result:
- 通过
- 格式错误
- 业务错误
- 数据异常

status:
- 进行中
- 已完成
- 已超时
- 已失败
- 已取消

**索引：**
- 主索引：instance_id
- 普通索引：agreement_id
- 普通索引：trigger_event
- 普通索引：related_order_id
- 普通索引：related_project_id
- 普通索引：from_timestamp
- 普通索引：response_time_hours
- 普通索引：status

**关系：**
- N:1 → org_collab_agreement（协议-实例）
- N:1 → project_master（项目-实例）
- 关联 supply_chain_mapping（供应链节点）

---

## relationship_history（关系历史表）

**表描述：** 动态管理组织间协作关系历史，支持季节性协作关系管理

**主键：** history_id

**字段定义：**

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| history_id | text | 是 | 历史记录ID |
| agreement_id | text | 是 | 关联协议ID |
| change_type | enum | 是 | 变更类型 |
| change_category | enum | 否 | 变更类别 |
| previous_status | text | 否 | 变更前状态 |
| new_status | text | 否 | 变更后状态 |
| change_reason | text | 是 | 变更原因 |
| change_reason_detail | text | 否 | 变更原因详情 |
| compliance_issue | text | 否 | 合规问题 |
| esg_violation | boolean | 否 | 是否ESG违规 |
| esg_violation_type | text | 否 | ESG违规类型 |
| risk_assessment | text | 否 | 风险评估 |
| changed_by | text | 是 | 变更操作人 |
| changer_role | text | 否 | 操作人角色 |
| changer_dept | text | 否 | 操作人部门 |
| approved_by | text | 否 | 审批人 |
| approval_status | enum | 否 | 审批状态 |
| valid_from | date | 是 | 生效开始日期 |
| valid_to | date | 是 | 生效结束日期 |
| impact_scope | text | 否 | 影响范围（JSON） |
| affected_projects | text | 否 | 受影响项目（JSON数组） |
| rollback_plan | text | 否 | 回滚计划 |
| termination_notice_sent | boolean | 否 | 是否发送终止通知 |
| notice_sent_date | date | 否 | 通知发送日期 |
| effective_termination_date | date | 否 | 实际终止日期 |
| outstanding_issues | text | 否 | 未解决事项 |
| settlement_status | enum | 否 | 结算状态 |
| final_settlement | decimal(18,2) | 否 | 最终结算金额 |
| transition_plan | text | 否 | 过渡计划 |
| backup_partner_id | text | 否 | 备选合作方ID |
| new_agreement_id | text | 否 | 新协议ID |
| performance_rating | decimal(3,1) | 否 | 关系绩效评分 |
| cooperation_years | decimal(4,1) | 否 | 合作年限 |
| contract_value_total | decimal(18,2) | 否 | 累计合同金额 |
| documents | text | 否 | 关联文档（JSON数组） |
| notes | text | 否 | 备注 |
| active_status | boolean | 是 | 是否启用（默认true） |
| dt_created | datetime | 是 | 创建时间 |
| dt_updated | datetime | 是 | 更新时间 |

**枚举值：**

change_type:
- 新增
- 暂停
- 恢复
- 终止
- 变更
- 续期
- 到期

change_category:
- 业务调整
- 成本调整
- 合规风险
- 质量问题
- 产能问题
- ESG违规
- 战略调整
- 协议到期

approval_status:
- 无需审批
- 待审批
- 已批准
- 已驳回

settlement_status:
- 未结算
- 部分结算
- 已结算
- 争议中

**索引：**
- 主索引：history_id
- 普通索引：agreement_id
- 普通索引：change_type
- 普通索引：valid_from
- 普通索引：valid_to
- 普通索引：changed_by
- 普通索引：esg_violation

**关系：**
- N:1 → org_collab_agreement（协议-历史）
- N:1 → supply_chain_upstream（供应商历史）
- N:1 → supply_chain_midstream（工厂历史）

---

## 协作协议关系图

```
org_collab_agreement
┌─────────────────────────────────────────────────────────────────┐
│ agreement_id: AGR-2024-001                                      │
│ agreement_type: 订单协同                                         │
│ from_org: 品牌部-电商组 → to_org: 代工厂A                       │
│ effective: 2024-03-01 ~ 2024-08-15 (SS24)                      │
│ data_exchange_std: API                                          │
└─────────────────────────────────────────────────────────────────┘
        │                              │
        │ 1:N                          │ 1:N
        ▼                              ▼
┌───────────────────┐         ┌───────────────────┐
│ collab_instance   │         │ relationship_history │
├───────────────────┤         ├───────────────────┤
│ instance_id: 001  │         │ history_id: 001   │
│ trigger: 补货请求 │         │ change: 新增      │
│ response: 2.5h    │         │ reason: SS24合作  │
│ status: 成功      │         │ valid: 03-01~08-15│
└───────────────────┘         └───────────────────┘
```

---

## 时效追踪设计

### 关键时效指标

| 指标 | 计算方式 | 快反阈值 | 标准阈值 |
|------|----------|----------|----------|
| 响应时间 | to_timestamp - from_timestamp | < 4h | < 24h |
| 处理时间 | processing_time_seconds | < 1h | < 8h |
| 确认时间 | acknowledged_at - from_timestamp | < 2h | < 12h |

### 牛鞭效应量化

| 指标 | 计算公式 | 告警阈值 |
|------|----------|----------|
| bullwhip_indicator | 需求波动幅度 / 订单波动幅度 | > 1.5 |
| demand_signal_strength | 实际需求 / 预测需求 | > 1.3 |

### SLA达成率统计

```sql
-- 按协议统计SLA达成率
SELECT agreement_id, 
       COUNT(*) as total_instances,
       SUM(CASE WHEN sla_met = true THEN 1 ELSE 0 END) as sla_met_count,
       SUM(CASE WHEN sla_met = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as sla_rate
FROM collab_instance
WHERE from_timestamp >= '2024-01-01'
GROUP BY agreement_id
```

---

## 季节性协作管理

### 临时协作关系

| 场景 | 配置方式 |
|------|----------|
| 圣诞季辅料通道 | valid_from=2024-10-01, valid_to=2024-12-31 |
| 直播爆款快反 | collab_instance 自动创建临时节点 |
| 联名款专项合作 | 创建专项 agreement_type=设计共创 |

### ESG风险阻断

| 违规类型 | 触发动作 |
|----------|----------|
| ZDHC化学品超标 | 暂停所有关联协议 |
| 劳工违规 | 终止合作关系，锁定相关项目 |
| 环保处罚 | 暂停新协议审批 |
