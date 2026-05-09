"""
飞书智能项目管理V7.0 - 合规驱动工作流节点定义
实现L1-L4四层过滤 + 操作模板匹配 + 合规校验
"""
import os
import json
import re
from typing import List, Dict, Any, Optional
from langchain_core.runnables import RunnableConfig
from langgraph.runtime import Runtime
from coze_coding_utils.runtime_ctx.context import Context
from graphs.compliance_state import (
    ComplianceWorkflowState,
    ComplianceGraphOutput,
)


def load_compliance_configs() -> Dict[str, Any]:
    """加载合规配置"""
    workspace_path = os.getenv("COZE_WORKSPACE_PATH", "")
    configs = {}
    
    # 加载操作模板库
    template_path = os.path.join(workspace_path, "data/compliance_operation_templates.json")
    if os.path.exists(template_path):
        with open(template_path, 'r', encoding='utf-8') as f:
            configs["templates"] = json.load(f)
    
    # 加载合规术语库
    term_path = os.path.join(workspace_path, "data/compliance_term_library.json")
    if os.path.exists(term_path):
        with open(term_path, 'r', encoding='utf-8') as f:
            configs["terms"] = json.load(f)
    
    return configs


def l1_syntax_filter_node(
    state: ComplianceWorkflowState,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> Dict[str, Any]:
    """
    title: L1 语法层过滤
    desc: 基础语法检查 + 合规词初筛，包括拼写/标点/格式标准化，扫描绝对化用语、虚假承诺等高频违规词
    integrations: 
    """
    input_text = state.input_text or ""
    
    # 标准化处理
    standardized_text = input_text.strip()
    standardized_text = re.sub(r'\s+', ' ', standardized_text)  # 合并多余空格
    
    # 语法问题检查
    grammar_issues = []
    
    # 标点检查
    if '。' not in standardized_text and len(standardized_text) > 20:
        grammar_issues.append("长文本缺少句号")
    
    # 初筛高频违规词（绝对化用语、虚假承诺）
    high_frequency_violations = [
        r'第一', r'最佳', r'最好', r'顶级', r'最优', r'最新', r'唯一',
        r'保证', r'绝对', r'一定', r'绝不', r'100%', r'全网最低',
        r'永不', r'绝对不', r'独家', r'防过敏', r'抗过敏'
    ]
    
    initial_scan_results = []
    for pattern in high_frequency_violations:
        matches = re.findall(pattern, standardized_text)
        if matches:
            initial_scan_results.append({
                "term": pattern,
                "matches": matches,
                "count": len(matches),
                "risk_level": "high" if pattern in ['保证', '绝对', '100%', '独家'] else "medium"
            })
    
    return {
        "l1_standardized_text": standardized_text,
        "l1_grammar_issues": grammar_issues,
        "l1_initial_scan_results": initial_scan_results
    }


def l2_rule_filter_node(
    state: ComplianceWorkflowState,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> Dict[str, Any]:
    """
    title: L2 规则层过滤
    desc: 操作模板匹配 + 合规术语库匹配，两个库同时命中生成带合规标记的操作指令
    integrations: 
    """
    configs = load_compliance_configs()
    input_text = state.l1_standardized_text or state.input_text or ""
    
    matched_templates = []
    matched_terms = []
    compliance_tags = []
    
    # 匹配操作模板
    templates = configs.get("templates", {}).get("operation_templates", [])
    for template in templates:
        trigger_conditions = template.get("trigger_conditions", [])
        # 检查是否所有触发条件都匹配
        matched_conditions = [cond for cond in trigger_conditions if cond in input_text]
        if len(matched_conditions) >= 2:  # 至少匹配2个触发条件
            matched_templates.append({
                "template_id": template.get("template_id"),
                "scene_name": template.get("scene_name"),
                "matched_conditions": matched_conditions,
                "compliance_context": template.get("compliance_context"),
                "compliance_checkpoint": template.get("compliance_checkpoint"),
                "operation_steps": template.get("operation_steps", [])
            })
            compliance_tags.append(template.get("compliance_checkpoint", ""))
    
    # 匹配合规术语
    term_library = configs.get("terms", {}).get("term_library", [])
    for term_entry in term_library:
        term = term_entry.get("term", "")
        variants = term_entry.get("variants", [])
        
        # 检查术语或变体是否在文本中
        all_terms = [term] + variants
        found_terms = [t for t in all_terms if t in input_text]
        
        if found_terms:
            matched_terms.append({
                "term_id": term_entry.get("term_id"),
                "term": term,
                "found_term": found_terms[0],
                "violation_type": term_entry.get("violation_type"),
                "risk_level": term_entry.get("risk_level"),
                "regulation": term_entry.get("regulation"),
                "replacement": term_entry.get("replacement", {}),
                "context": term_entry.get("applicable_scenes", [])
            })
            compliance_tags.append(f"⚠️发现违规词:{term}")
    
    # 双重匹配检测
    if matched_templates and matched_terms:
        compliance_tags.append("🔍双重匹配：生成带合规标记的操作指令")
    elif matched_templates and not matched_terms:
        compliance_tags.append("📋仅匹配操作模板：生成标准操作指令")
    elif not matched_templates and matched_terms:
        compliance_tags.append("⚠️仅匹配合规术语：生成合规提醒")
    
    return {
        "l2_matched_templates": matched_templates,
        "l2_matched_terms": matched_terms,
        "l2_compliance_tags": compliance_tags
    }


def l3_semantic_filter_node(
    state: ComplianceWorkflowState,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> Dict[str, Any]:
    """
    title: L3 语义层过滤
    desc: 跨模态理解 + 合规上下文判断，理解业务语义，判断合规上下文
    integrations: 
    """
    input_text = state.l1_standardized_text or state.input_text or ""
    
    # 业务语义识别
    business_semantic = ""
    semantic_indicators = {
        "项目启动": ["立项", "启动", "新项目", "项目章程"],
        "需求确认": ["需求", "需求文档", "客户需求", "确认需求"],
        "方案设计": ["方案", "设计方案", "提案", "技术方案"],
        "合同签署": ["合同", "签署", "协议", "签约"],
        "产品上架": ["上架", "产品发布", "新品"],
        "采购执行": ["采购", "订单", "供应商", "供货"],
        "样品评审": ["样品", "样衣", "打样", "评审"],
        "验收交付": ["验收", "交付", "完成", "验收通过"],
        "项目复盘": ["复盘", "总结", "回顾", "评估"]
    }
    
    for semantic, indicators in semantic_indicators.items():
        if any(ind in input_text for ind in indicators):
            business_semantic = semantic
            break
    
    if not business_semantic:
        business_semantic = "常规沟通"
    
    # 合规上下文判断
    compliance_context = "内部"  # 默认内部
    context_confidence = 0.5
    
    # 外部敏感指示词
    external_high_sensitive = ["合同", "协议", "承诺", "保证", "对外", "客户", "宣传", "发布", "广告"]
    external_low_sensitive = ["通知", "函", "告知", "说明"]
    
    # 内部指示词
    internal_indicators = ["内部", "内部分享", "技术讨论", "不对外"]
    
    if any(ind in input_text for ind in internal_indicators):
        compliance_context = "内部"
        context_confidence = 0.9
    elif any(ind in input_text for ind in external_high_sensitive):
        compliance_context = "对外高敏感"
        context_confidence = 0.85
    elif any(ind in input_text for ind in external_low_sensitive):
        compliance_context = "对外低敏感"
        context_confidence = 0.7
    
    return {
        "l3_business_semantic": business_semantic,
        "l3_compliance_context": compliance_context,
        "l3_context_confidence": context_confidence
    }


def l4_intent_filter_node(
    state: ComplianceWorkflowState,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> Dict[str, Any]:
    """
    title: L4 意图层过滤
    desc: 预测行动需求 + 预判合规风险，涉及对外内容自动注入合规校验步骤
    integrations: 
    """
    input_text = state.l1_standardized_text or state.input_text or ""
    business_semantic = state.l3_business_semantic or ""
    compliance_context = state.l3_compliance_context or "内部"
    matched_terms = state.l2_matched_terms or []
    matched_templates = state.l2_matched_templates or []
    
    # 预测行动需求
    intent_predictions = {
        "创建项目": ["立项", "启动", "新项目"],
        "更新进度": ["进度", "更新", "完成", "进行中"],
        "发起审核": ["审核", "审批", "确认"],
        "签署合同": ["合同", "签署", "签约"],
        "采购下单": ["采购", "下单", "订单"],
        "通知客户": ["通知", "告知", "函"]
    }
    
    predicted_intent = "常规操作"
    for intent, indicators in intent_predictions.items():
        if any(ind in input_text for ind in indicators):
            predicted_intent = intent
            break
    
    # 预判是否涉及对外内容
    involves_external = compliance_context in ["对外高敏感", "对外低敏感"]
    
    # 判断是否需要合规检查
    compliance_required = False
    if involves_external and matched_terms:
        compliance_required = True
    elif matched_templates and any(t.get("compliance_context") in ["对外高敏感", "对外低敏感"] for t in matched_templates):
        compliance_required = True
    
    return {
        "l4_predicted_intent": predicted_intent,
        "l4_involves_external": involves_external,
        "l4_compliance_required": compliance_required
    }


def decision_output_node(
    state: ComplianceWorkflowState,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> ComplianceGraphOutput:
    """
    title: 决策输出
    desc: 根据L1-L4过滤结果生成最终决策输出
    integrations: 
    """
    configs = load_compliance_configs()
    matched_templates = state.l2_matched_templates or []
    matched_terms = state.l2_matched_terms or []
    compliance_context = state.l3_compliance_context or "内部"
    business_semantic = state.l3_business_semantic or ""
    compliance_required = state.l4_compliance_required
    involves_external = state.l4_involves_external
    
    # 合规上下文级别映射
    context_levels = configs.get("templates", {}).get("compliance_context_levels", {})
    
    # 生成最终决策
    final_action = "execute"
    action_instruction = ""
    compliance_alert = None
    optimization_suggestion = None
    
    # 检查高风险项
    high_risk_terms = [t for t in matched_terms if t.get("risk_level") == "高"]
    
    if high_risk_terms and involves_external:
        # 高风险 + 对外 = 暂停 + 人工审核
        final_action = "pause"
        compliance_alert = {
            "alert_level": "high",
            "violations": high_risk_terms,
            "message": f"发现{len(high_risk_terms)}个高风险违规项，请法务审核",
            "requires_manual_review": True
        }
        action_instruction = "⛔ 操作已暂停，等待法务审核后继续"
        
    elif matched_terms and compliance_required:
        # 有违规项但不是高风险 = 自动替换 + 通知
        final_action = "notify"
        replacements = []
        for term in matched_terms:
            if term.get("risk_level") == "中":
                replacement_type = "contract" if compliance_context == "对外高敏感" else "internal"
                safe_replacement = term.get("replacement", {}).get(replacement_type, term.get("term"))
                replacements.append({
                    "original": term.get("found_term"),
                    "suggested": safe_replacement,
                    "reason": f"建议替换为{safe_replacement}"
                })
        
        optimization_suggestion = {
            "suggestions": replacements,
            "message": f"发现{len(matched_terms)}个需关注的术语，已提供替换建议"
        }
        action_instruction = f"📝 已生成优化建议，请确认后继续"
        
    elif matched_templates:
        # 仅匹配模板 = 正常执行
        template = matched_templates[0]
        action_instruction = f"✅ 匹配模板：{template.get('scene_name')}\n" + "\n".join(template.get('operation_steps', []))
    
    # 生成执行总结
    summary_parts = [
        f"📋 业务语义：{business_semantic}",
        f"🔒 合规上下文：{compliance_context}",
        f"📊 匹配模板：{len(matched_templates)}个",
        f"⚠️ 发现违规：{len(matched_terms)}个",
        f"🎯 最终决策：{final_action}"
    ]
    
    if matched_terms:
        summary_parts.append(f"\n违规项详情：")
        for term in matched_terms[:3]:
            summary_parts.append(f"  - {term.get('found_term')} ({term.get('violation_type')})")
    
    execution_summary = "\n".join(summary_parts)
    
    return ComplianceGraphOutput(
        success=True,
        business_semantic=business_semantic,
        compliance_context=compliance_context,
        matched_template=matched_templates[0] if matched_templates else None,
        compliance_findings=matched_terms,
        final_action=final_action,
        action_instruction=action_instruction,
        compliance_alert=compliance_alert,
        optimization_suggestion=optimization_suggestion,
        execution_summary=execution_summary
    )


# ============ 项目节点合规卡点节点 ============

def project_checkpoint_node(
    state: Dict[str, Any],
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> Dict[str, Any]:
    """
    title: 项目节点合规卡点
    desc: 在项目全生命周期中植入合规检查点，根据项目阶段执行对应的合规扫描
    integrations: 
    """
    configs = load_compliance_configs()
    project_phase = state.get("project_phase", "")
    content_to_check = state.get("content_to_check", "")
    
    # 获取当前阶段的检查点配置
    checkpoints = configs.get("templates", {}).get("project_node_compliance_checkpoints", [])
    current_checkpoint = None
    
    for checkpoint in checkpoints:
        if checkpoint.get("phase") == project_phase:
            current_checkpoint = checkpoint
            break
    
    if not current_checkpoint:
        return {
            "check_passed": True,
            "violations_found": [],
            "risk_level": "无",
            "fail_action": "",
            "action_taken": "无需合规检查",
            "audit_summary": f"阶段[{project_phase}]无对应检查点，跳过检查"
        }
    
    # 执行合规扫描
    violations_found = []
    risk_level = "低"
    
    term_library = configs.get("terms", {}).get("term_library", [])
    for term_entry in term_library:
        term = term_entry.get("term", "")
        variants = term_entry.get("variants", [])
        
        all_terms = [term] + variants
        for t in all_terms:
            if t in content_to_check:
                risk = term_entry.get("risk_level", "低")
                if risk == "高":
                    risk_level = "高"
                elif risk == "中" and risk_level != "高":
                    risk_level = "中"
                
                violations_found.append({
                    "term": t,
                    "violation_type": term_entry.get("violation_type"),
                    "risk_level": risk,
                    "regulation": term_entry.get("regulation"),
                    "replacement": term_entry.get("replacement", {}).get("contract", "")
                })
                break
    
    # 判断检查是否通过
    check_passed = risk_level == "无" or risk_level == "低"
    
    # 生成处理结果
    fail_action = current_checkpoint.get("fail_action", "")
    action_taken = ""
    
    if not check_passed:
        if risk_level == "高":
            action_taken = "暂停推进，生成法务审核工单"
        elif risk_level == "中":
            action_taken = "标记待审，推送提醒"
    else:
        action_taken = "检查通过，继续执行"
    
    audit_summary = f"阶段[{project_phase}]检查完成：发现{len(violations_found)}个违规项，风险等级={risk_level}"
    
    return {
        "success": True,
        "check_passed": check_passed,
        "violations_found": violations_found,
        "risk_level": risk_level,
        "fail_action": fail_action,
        "action_taken": action_taken,
        "audit_summary": audit_summary
    }
