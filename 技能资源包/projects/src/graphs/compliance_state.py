"""
飞书智能项目管理V7.0 - 合规驱动工作流状态定义
缝合项目管理操作模板 + 合规校验
"""
import os
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ComplianceWorkflowState(BaseModel):
    """合规驱动工作流全局状态"""
    # 输入信息
    input_text: str = Field(default="", description="输入文本/消息")
    input_type: str = Field(default="message", description="输入类型：message/record/field_change/scheduled")
    source_context: str = Field(default="internal", description="来源上下文：internal/external")
    
    # L1 语法层结果
    l1_standardized_text: str = Field(default="", description="标准化后的文本")
    l1_grammar_issues: List[str] = Field(default_factory=list, description="语法问题列表")
    l1_initial_scan_results: List[Dict[str, Any]] = Field(default_factory=list, description="初筛发现的违规词")
    
    # L2 规则层结果
    l2_matched_templates: List[Dict[str, Any]] = Field(default_factory=list, description="匹配的操作模板")
    l2_matched_terms: List[Dict[str, Any]] = Field(default_factory=list, description="匹配合规术语")
    l2_compliance_tags: List[str] = Field(default_factory=list, description="合规标记列表")
    
    # L3 语义层结果
    l3_business_semantic: str = Field(default="", description="业务语义识别结果")
    l3_compliance_context: str = Field(default="internal", description="合规上下文")
    l3_context_confidence: float = Field(default=0.0, description="上下文识别置信度")
    
    # L4 意图层结果
    l4_predicted_intent: str = Field(default="", description="预测的行动需求")
    l4_involves_external: bool = Field(default=False, description="是否涉及对外内容")
    l4_compliance_required: bool = Field(default=False, description="是否需要合规检查")
    
    # 最终决策
    final_action: str = Field(default="execute", description="最终操作：execute/pause/notify")
    action_instruction: str = Field(default="", description="带合规标记的操作指令")
    compliance_alert: Optional[Dict[str, Any]] = Field(default=None, description="合规拦截警报")
    optimization_suggestion: Optional[Dict[str, Any]] = Field(default=None, description="合规优化建议")
    
    # 执行结果
    success: bool = Field(default=False, description="执行是否成功")
    error_message: str = Field(default="", description="错误信息")


class ComplianceGraphInput(BaseModel):
    """合规驱动工作流输入"""
    input_text: str = Field(default="", description="输入文本/消息")
    input_type: str = Field(default="message", description="输入类型")
    source_context: str = Field(default="internal", description="来源上下文")


class ComplianceGraphOutput(BaseModel):
    """合规驱动工作流输出"""
    success: bool = Field(default=False, description="执行是否成功")
    business_semantic: str = Field(default="", description="识别的业务语义")
    compliance_context: str = Field(default="internal", description="合规上下文")
    matched_template: Optional[Dict[str, Any]] = Field(default=None, description="匹配的操作模板")
    compliance_findings: List[Dict[str, Any]] = Field(default_factory=list, description="合规发现列表")
    final_action: str = Field(default="execute", description="最终操作")
    action_instruction: str = Field(default="", description="操作指令")
    compliance_alert: Optional[Dict[str, Any]] = Field(default=None, description="合规警报")
    optimization_suggestion: Optional[Dict[str, Any]] = Field(default=None, description="优化建议")
    execution_summary: str = Field(default="", description="执行总结")


# ============ 项目节点合规卡点状态 ============

class ProjectComplianceCheckpointState(BaseModel):
    """项目节点合规卡点全局状态"""
    project_id: str = Field(default="", description="项目ID")
    project_phase: str = Field(default="", description="项目阶段")
    checkpoint_name: str = Field(default="", description="检查点名称")
    
    # 检查内容
    content_to_check: str = Field(default="", description="待检查内容")
    check_content_type: str = Field(default="", description="检查内容类型")
    
    # 检查结果
    check_passed: bool = Field(default=True, description="检查是否通过")
    violations_found: List[Dict[str, Any]] = Field(default_factory=list, description="发现的违规项")
    risk_level: str = Field(default="低", description="风险等级")
    
    # 处理结果
    fail_action: str = Field(default="", description="不通过处理方式")
    audit_log_id: Optional[str] = Field(default=None, description="审计日志ID")


class ProjectCheckpointInput(BaseModel):
    """项目节点合规检查输入"""
    project_id: str = Field(default="", description="项目ID")
    project_phase: str = Field(default="", description="项目阶段")
    content_to_check: str = Field(default="", description="待检查内容")


class ProjectCheckpointOutput(BaseModel):
    """项目节点合规检查输出"""
    success: bool = Field(default=False, description="检查是否成功")
    check_passed: bool = Field(default=True, description="检查是否通过")
    violations_found: List[Dict[str, Any]] = Field(default_factory=list, description="发现的违规项")
    risk_level: str = Field(default="低", description="风险等级")
    fail_action: str = Field(default="", description="处理方式")
    action_taken: str = Field(default="", description="已采取的处理")
    audit_summary: str = Field(default="", description="审计总结")


# ============ 合规审计日志状态 ============

class ComplianceAuditLogState(BaseModel):
    """合规审计日志状态"""
    trigger_time: str = Field(default="", description="触发时间")
    trigger_source: str = Field(default="", description="触发来源")
    original_content: str = Field(default="", description="原始内容")
    identified_violations: List[Dict[str, Any]] = Field(default_factory=list, description="识别的违规项")
    handling_method: str = Field(default="", description="处理方式")
    handling_result: str = Field(default="", description="处理结果")
    related_project: str = Field(default="", description="关联项目")
    operator: str = Field(default="", description="操作人")
