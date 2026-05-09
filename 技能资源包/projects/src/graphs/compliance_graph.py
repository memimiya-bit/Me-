"""
飞书智能项目管理V7.0 - 合规驱动工作流主图编排
缝合项目管理操作模板 + 合规校验
"""
from langgraph.graph import StateGraph, END
from graphs.compliance_state import (
    ComplianceWorkflowState,
    ComplianceGraphInput,
    ComplianceGraphOutput,
)
from graphs.compliance_nodes import (
    l1_syntax_filter_node,
    l2_rule_filter_node,
    l3_semantic_filter_node,
    l4_intent_filter_node,
    decision_output_node,
)


def create_compliance_workflow():
    """创建合规驱动工作流"""
    
    # 创建状态图
    builder = StateGraph(
        ComplianceWorkflowState,
        input_schema=ComplianceGraphInput,
        output_schema=ComplianceGraphOutput
    )
    
    # 添加节点 - L1-L4四层过滤
    builder.add_node("l1_syntax_filter", l1_syntax_filter_node)
    builder.add_node("l2_rule_filter", l2_rule_filter_node)
    builder.add_node("l3_semantic_filter", l3_semantic_filter_node)
    builder.add_node("l4_intent_filter", l4_intent_filter_node)
    builder.add_node("decision_output", decision_output_node)
    
    # 设置入口点
    builder.set_entry_point("l1_syntax_filter")
    
    # 添加边 - 顺序执行L1-L4
    builder.add_edge("l1_syntax_filter", "l2_rule_filter")
    builder.add_edge("l2_rule_filter", "l3_semantic_filter")
    builder.add_edge("l3_semantic_filter", "l4_intent_filter")
    builder.add_edge("l4_intent_filter", "decision_output")
    builder.add_edge("decision_output", END)
    
    # 编译图
    return builder.compile()


# 创建全局工作流实例
compliance_main_graph = create_compliance_workflow()
