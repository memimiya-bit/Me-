"""
数据采集工作流图定义
"""
from typing import Literal
from langgraph.graph import StateGraph, END

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


def route_based_on_table(
    state: WorkflowState,
) -> Literal["create_records", "create_note"]:
    """
    title: 路由分流
    desc: 根据分流目标选择不同的创建节点
    """
    if state.routed_table in ["任务跟踪", "项目管理", "待办事项"]:
        return "create_records"
    else:
        return "create_note"


# 创建状态图
builder = StateGraph(WorkflowState, input_schema=GraphInput, output_schema=GraphOutput)

# 添加节点
builder.add_node("init", init_collection_node)
builder.add_node("extract", extract_content_node)
builder.add_node("keywords", extract_keywords_node)
builder.add_node("route", route_content_node)
builder.add_node("create_records", create_records_node)
builder.add_node("create_note", create_note_node)
builder.add_node("summarize", summarize_result_node)

# 设置入口点
builder.set_entry_point("init")

# 添加边
builder.add_edge("init", "extract")
builder.add_edge("extract", "keywords")
builder.add_edge("keywords", "route")

# 条件分支
builder.add_conditional_edges(
    source="route",
    path=route_based_on_table,
    path_map={
        "create_records": "create_records",
        "create_note": "create_note"
    }
)

# 添加后续边
builder.add_edge("create_records", "summarize")
builder.add_edge("create_note", "summarize")
builder.add_edge("summarize", END)

# 编译图
main_graph = builder.compile()
