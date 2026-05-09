"""
数据采集工作流节点定义
"""
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any
from langchain_core.runnables import RunnableConfig
from langgraph.runtime import Runtime
from coze_coding_utils.runtime_ctx.context import Context

from graphs.data_collection_state import (
    InitNodeInput,
    InitNodeOutput,
    ExtractNodeInput,
    ExtractNodeOutput,
    KeywordNodeInput,
    KeywordNodeOutput,
    RouteNodeInput,
    RouteNodeOutput,
    CreateRecordsNodeInput,
    CreateRecordsNodeOutput,
    SummarizeNodeInput,
    SummarizeNodeOutput,
)


def init_collection_node(
    state: InitNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> InitNodeOutput:
    """
    title: 初始化数据采集
    desc: 初始化工作流状态，生成内容ID
    """
    content_id = str(uuid.uuid4())
    return InitNodeOutput(
        content_id=content_id,
        source_name=state.source_name,
        source_type=state.source_type
    )


def extract_content_node(
    state: ExtractNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> ExtractNodeOutput:
    """
    title: 内容提取
    desc: 提取内容标题和摘要
    """
    text = state.content_text
    
    # 简单的标题提取：取第一行或前50字符
    lines = text.strip().split('\n')
    title = lines[0][:50] if lines else "未命名"
    
    # 简单的摘要提取：取前200字符
    summary = text[:200] + "..." if len(text) > 200 else text
    
    return ExtractNodeOutput(
        extraction_success=True,
        content_title=title,
        content_summary=summary
    )


def extract_keywords_node(
    state: KeywordNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> KeywordNodeOutput:
    """
    title: 关键词提取
    desc: 从内容中提取关键词
    """
    text = state.content_text
    
    # 简单的关键词提取逻辑
    keywords = []
    
    # 检测紧急/优先关键词
    priority_keywords = ['紧急', '优先', '重要', '高优先级', '急']
    for kw in priority_keywords:
        if kw in text:
            keywords.append({
                "text": kw,
                "type": "priority",
                "confidence": 0.9
            })
    
    # 检测项目关键词
    project_keywords = ['项目', '开发', '任务', '需求', '开发任务']
    for kw in project_keywords:
        if kw in text:
            keywords.append({
                "text": kw,
                "type": "topic",
                "confidence": 0.8
            })
    
    # 如果没有提取到关键词，添加默认关键词
    if not keywords:
        keywords.append({
            "text": "general",
            "type": "topic",
            "confidence": 0.5
        })
    
    return KeywordNodeOutput(keywords=keywords)


def route_content_node(
    state: RouteNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> RouteNodeOutput:
    """
    title: 内容分流
    desc: 根据关键词决定内容应分流到哪个表格
    """
    keywords = state.keywords
    text = state.content_text
    
    # 根据关键词类型分流
    table_mapping = {
        "priority": "项目管理",
        "topic": "任务跟踪",
        "entity": "联系人管理",
    }
    
    routed_table = "任务跟踪"  # 默认表格
    
    for kw in keywords:
        kw_type = kw.get("type", "topic")
        if kw_type in table_mapping:
            routed_table = table_mapping[kw_type]
            break
    
    # 检查内容中的关键词
    if any(k in text for k in ['紧急', '优先', '重要']):
        routed_table = "项目管理"
    elif any(k in text for k in ['项目', '开发', '任务']):
        routed_table = "任务跟踪"
    elif any(k in text for k in ['待办', 'todo', '事项']):
        routed_table = "待办事项"
    
    route_result = {
        "target_table": routed_table,
        "matched_keywords": [kw.get("text") for kw in keywords],
        "confidence": 0.85
    }
    
    return RouteNodeOutput(
        routed_table=routed_table,
        route_result=route_result
    )


def create_records_node(
    state: CreateRecordsNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> CreateRecordsNodeOutput:
    """
    title: 创建记录
    desc: 在目标表格中创建记录
    """
    keywords = state.keywords
    
    # 构建记录
    record = {
        "内容ID": state.content_id,
        "分流表格": state.routed_table,
        "关键词": ", ".join([kw.get("text", "") for kw in keywords]),
        "创建时间": datetime.now().isoformat()
    }
    
    return CreateRecordsNodeOutput(
        records_created=[record],
        records_count=1
    )


def create_note_node(
    state: CreateRecordsNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> CreateRecordsNodeOutput:
    """
    title: 创建笔记
    desc: 创建智能笔记记录
    """
    keywords = state.keywords
    
    note_record = {
        "笔记标题": f"智能笔记-{state.content_id[:8]}",
        "关键词": ", ".join([kw.get("text", "") for kw in keywords]),
        "标签": [kw.get("type", "general") for kw in keywords],
        "创建时间": datetime.now().isoformat()
    }
    
    return CreateRecordsNodeOutput(
        records_created=[note_record],
        records_count=1
    )


def summarize_result_node(
    state: SummarizeNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> SummarizeNodeOutput:
    """
    title: 汇总结果
    desc: 汇总处理结果
    """
    records_count = len(state.records_created)
    
    summary = f"""数据采集与处理完成

- 内容ID: {state.content_id}
- 提取关键词: {len(state.keywords)} 个
- 分流目标: {state.routed_table}
- 创建记录: {records_count} 条

处理状态: {'成功' if state.extraction_success else '部分成功'}"""
    
    return SummarizeNodeOutput(
        success=state.extraction_success,
        summary=summary
    )
