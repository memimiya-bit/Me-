"""
数据采集工作流状态定义
支持笔记、文档、对话的智能处理和表格自动化
"""
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


class GraphInput(BaseModel):
    """工作流输入"""
    source_name: str = Field(default="", description="数据源名称")
    source_type: str = Field(default="document", description="数据源类型: note/document/dialog/web/api")
    content_text: str = Field(default="", description="待处理的内容文本")


class GraphOutput(BaseModel):
    """工作流输出"""
    success: bool = Field(default=False, description="处理是否成功")
    content_id: str = Field(default="", description="内容ID")
    keywords: List[Dict[str, Any]] = Field(default_factory=list, description="提取的关键词")
    routed_table: str = Field(default="", description="分流目标表格")
    table_records_created: int = Field(default=0, description="创建的记录数")
    summary: str = Field(default="", description="处理摘要")


class WorkflowState(BaseModel):
    """工作流状态"""
    # 输入字段
    source_name: str = Field(default="", description="数据源名称")
    source_type: str = Field(default="document", description="数据源类型")
    content_text: str = Field(default="", description="待处理的内容文本")
    
    # 处理状态
    content_id: str = Field(default="", description="内容ID")
    processed: bool = Field(default=False, description="是否已处理")
    extraction_success: bool = Field(default=False, description="提取是否成功")
    
    # 关键词和分流
    keywords: List[Dict[str, Any]] = Field(default_factory=list, description="提取的关键词")
    routed_table: str = Field(default="", description="分流目标表格")
    route_result: Dict[str, Any] = Field(default_factory=dict, description="分流结果")
    
    # 创建记录
    records_created: List[Dict[str, Any]] = Field(default_factory=list, description="创建的记录")
    table_records_created: int = Field(default=0, description="创建的记录数")
    
    # 处理结果
    success: bool = Field(default=False, description="处理是否成功")
    messages: List[str] = Field(default_factory=list, description="处理消息")
    summary: str = Field(default="", description="处理摘要")


# 节点输入输出类型定义
class InitNodeInput(BaseModel):
    """初始化节点输入"""
    source_name: str = Field(default="", description="数据源名称")
    source_type: str = Field(default="document", description="数据源类型")
    content_text: str = Field(default="", description="内容文本")


class InitNodeOutput(BaseModel):
    """初始化节点输出"""
    content_id: str = Field(default="", description="生成的内容ID")
    source_name: str = Field(default="", description="数据源名称")
    source_type: str = Field(default="document", description="数据源类型")


class ExtractNodeInput(BaseModel):
    """提取节点输入"""
    content_id: str = Field(default="", description="内容ID")
    content_text: str = Field(default="", description="内容文本")


class ExtractNodeOutput(BaseModel):
    """提取节点输出"""
    extraction_success: bool = Field(default=False, description="提取是否成功")
    content_title: str = Field(default="", description="内容标题")
    content_summary: str = Field(default="", description="内容摘要")


class KeywordNodeInput(BaseModel):
    """关键词节点输入"""
    content_id: str = Field(default="", description="内容ID")
    content_text: str = Field(default="", description="内容文本")


class KeywordNodeOutput(BaseModel):
    """关键词节点输出"""
    keywords: List[Dict[str, Any]] = Field(default_factory=list, description="提取的关键词")


class RouteNodeInput(BaseModel):
    """路由节点输入"""
    content_id: str = Field(default="", description="内容ID")
    keywords: List[Dict[str, Any]] = Field(default_factory=list, description="关键词列表")
    content_text: str = Field(default="", description="内容文本")


class RouteNodeOutput(BaseModel):
    """路由节点输出"""
    routed_table: str = Field(default="", description="分流目标表格")
    route_result: Dict[str, Any] = Field(default_factory=dict, description="路由结果")


class CreateRecordsNodeInput(BaseModel):
    """创建记录节点输入"""
    content_id: str = Field(default="", description="内容ID")
    routed_table: str = Field(default="", description="目标表格")
    keywords: List[Dict[str, Any]] = Field(default_factory=list, description="关键词")


class CreateRecordsNodeOutput(BaseModel):
    """创建记录节点输出"""
    records_created: List[Dict[str, Any]] = Field(default_factory=list, description="创建的记录")
    records_count: int = Field(default=0, description="记录数")


class SummarizeNodeInput(BaseModel):
    """汇总节点输入"""
    content_id: str = Field(default="", description="内容ID")
    extraction_success: bool = Field(default=False, description="提取是否成功")
    keywords: List[Dict[str, Any]] = Field(default_factory=list, description="关键词")
    routed_table: str = Field(default="", description="分流表格")
    records_created: List[Dict[str, Any]] = Field(default_factory=list, description="创建的记录")


class SummarizeNodeOutput(BaseModel):
    """汇总节点输出"""
    success: bool = Field(default=False, description="处理是否成功")
    summary: str = Field(default="", description="处理摘要")
