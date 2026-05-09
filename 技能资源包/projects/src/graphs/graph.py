"""
数据采集与智能分流工作流
支持笔记、文档、对话的智能处理和表格自动化
"""
import sys
sys.path.insert(0, 'src')

from graphs.data_collection_state import GraphInput, GraphOutput, WorkflowState
from graphs.data_collection_nodes import (
    init_collection_node,
    extract_content_node,
    extract_keywords_node,
    route_content_node,
    create_records_node,
    create_note_node,
    summarize_result_node,
)

from typing import Literal
from langgraph.graph import StateGraph, END

def should_route(state: WorkflowState) -> str:
    """根据提取结果决定是否继续处理"""
    route_result = getattr(state, "route_result", None)
    if route_result:
        return "create_records"
    return "skip_processing"

def should_create_note(state: WorkflowState) -> str:
    """根据路由结果决定是否创建笔记"""
    routed_table = getattr(state, "routed_table", "") or ""
    if "项目管理" in routed_table or "任务跟踪" in routed_table:
        return "create_note"
    return "skip_note"

# 创建状态图
builder = StateGraph(WorkflowState, input_schema=GraphInput, output_schema=GraphOutput)

# 添加节点
builder.add_node("init_collection", init_collection_node)
builder.add_node("extract_content", extract_content_node)
builder.add_node("extract_keywords", extract_keywords_node)
builder.add_node("route_content", route_content_node)
builder.add_node("create_records", create_records_node)
builder.add_node("create_note", create_note_node)
builder.add_node("summarize_result", summarize_result_node)

# 设置入口点
builder.set_entry_point("init_collection")

# 添加边
builder.add_edge("init_collection", "extract_content")
builder.add_edge("extract_content", "extract_keywords")
builder.add_edge("extract_keywords", "route_content")

# 条件边 - 路由
builder.add_conditional_edges(
    source="route_content",
    path=should_route,
    path_map={
        "create_records": "create_records",
        "skip_processing": "summarize_result",
    }
)

# 条件边 - 笔记
builder.add_conditional_edges(
    source="create_records",
    path=should_create_note,
    path_map={
        "create_note": "create_note",
        "skip_note": "summarize_result",
    }
)

builder.add_edge("create_note", "summarize_result")
builder.add_edge("summarize_result", END)

# 编译图
main_graph = builder.compile()

__all__ = ["main_graph"]
