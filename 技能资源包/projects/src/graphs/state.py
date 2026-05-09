"""
飞书多维表格任务管理工作流 - 全局状态定义
用于在节点之间传递数据
"""
from typing import List, Dict, Any, Optional, Annotated
from pydantic import BaseModel, Field


def _merge_messages(existing: List[str], new: str) -> List[str]:
    """合并消息列表"""
    if new:
        return existing + [new]
    return existing


class WorkflowState(BaseModel):
    """工作流全局状态"""
    # 基础信息
    base_name: str = Field(default="任务跟踪管理系统", description="Base名称")
    folder_token: Optional[str] = Field(default=None, description="父文件夹Token")
    app_token: Optional[str] = Field(default=None, description="Base的App Token")
    
    # 表格ID
    task_table_id: Optional[str] = Field(default=None, description="任务跟踪表ID")
    project_table_id: Optional[str] = Field(default=None, description="项目管理表ID")
    todo_table_id: Optional[str] = Field(default=None, description="待办事项表ID")
    rotation_table_id: Optional[str] = Field(default=None, description="成员轮值表ID")
    
    # 统计信息
    tables_created: List[Dict[str, str]] = Field(default_factory=list, description="已创建的表格列表")
    fields_created: int = Field(default=0, description="已创建的字段数量")
    
    # 任务数据
    task_data: Optional[Dict[str, Any]] = Field(default=None, description="任务数据")
    member_rotation_enabled: bool = Field(default=True, description="是否启用成员轮值")
    assigned_member: Optional[str] = Field(default=None, description="分配的负责人")
    keywords: List[Dict[str, Any]] = Field(default_factory=list, description="提取的关键词列表")
    
    # 执行结果
    task_created: bool = Field(default=False, description="是否创建了任务记录")
    notification_sent: bool = Field(default=False, description="是否发送了通知")
    overdue_tasks: List[Dict[str, Any]] = Field(default_factory=list, description="逾期任务列表")
    message: str = Field(default="", description="执行结果消息")
    messages: Annotated[List[str], _merge_messages] = Field(default_factory=list, description="消息列表")


class GraphInput(BaseModel):
    """工作流输入"""
    base_name: str = Field(default="任务跟踪管理系统", description="Base名称")
    folder_token: Optional[str] = Field(default=None, description="父文件夹Token")
    app_token: Optional[str] = Field(default=None, description="已存在的App Token（可选）")
    task_data: Optional[Dict[str, Any]] = Field(default=None, description="任务数据")
    member_rotation_enabled: bool = Field(default=True, description="是否启用成员轮值")
    notification_config: Optional[Dict[str, Any]] = Field(default=None, description="通知配置")


class GraphOutput(BaseModel):
    """工作流输出"""
    success: bool = Field(default=False, description="工作流执行是否成功")
    app_token: Optional[str] = Field(default=None, description="创建的Base的App Token")
    base_name: str = Field(default="", description="Base名称")
    tables_created: List[Dict[str, str]] = Field(default_factory=list, description="创建的表格列表")
    task_table_id: Optional[str] = Field(default=None, description="任务跟踪表ID")
    project_table_id: Optional[str] = Field(default=None, description="项目管理表ID")
    todo_table_id: Optional[str] = Field(default=None, description="待办事项表ID")
    rotation_table_id: Optional[str] = Field(default=None, description="成员轮值表ID")
    fields_created: int = Field(default=0, description="创建的字段数量")
    task_created: bool = Field(default=False, description="是否创建了任务记录")
    notification_sent: bool = Field(default=False, description="是否发送了通知")
    message: str = Field(default="", description="执行结果消息")
    summary: str = Field(default="", description="执行总结")


# ============ 节点输入类型 ============

class CreateBaseNodeInput(BaseModel):
    """创建Base节点的输入"""
    base_name: str = Field(default="任务跟踪管理系统", description="Base名称")
    folder_token: Optional[str] = Field(default=None, description="父文件夹Token")
    app_token: Optional[str] = Field(default=None, description="已存在的App Token")
    task_data: Optional[Dict[str, Any]] = Field(default=None, description="任务数据")
    member_rotation_enabled: bool = Field(default=True, description="是否启用成员轮值")


class CreateTaskTableNodeInput(BaseModel):
    """创建任务跟踪表节点的输入"""
    app_token: Optional[str] = Field(default="", description="Base App Token")
    base_name: str = Field(default="", description="Base名称")


class CreateProjectTableNodeInput(BaseModel):
    """创建项目管理表节点的输入"""
    app_token: Optional[str] = Field(default="", description="Base App Token")
    base_name: str = Field(default="", description="Base名称")


class CreateTodoTableNodeInput(BaseModel):
    """创建待办事项表节点的输入"""
    app_token: Optional[str] = Field(default="", description="Base App Token")
    base_name: str = Field(default="", description="Base名称")


class CreateRotationTableNodeInput(BaseModel):
    """创建成员轮值表节点的输入"""
    app_token: Optional[str] = Field(default="", description="Base App Token")
    base_name: str = Field(default="", description="Base名称")


class CreateTaskRecordNodeInput(BaseModel):
    """创建任务记录节点的输入"""
    app_token: Optional[str] = Field(default="", description="Base App Token")
    task_table_id: Optional[str] = Field(default="", description="任务跟踪表ID")
    rotation_table_id: Optional[str] = Field(default=None, description="轮值表ID")
    task_data: Optional[Dict[str, Any]] = Field(default=None, description="任务数据")
    member_rotation_enabled: bool = Field(default=True, description="是否启用成员轮值")


class SendNotificationNodeInput(BaseModel):
    """发送通知节点的输入"""
    task_data: Optional[Dict[str, Any]] = Field(default=None, description="任务数据")
    assigned_member: Optional[str] = Field(default=None, description="分配的负责人")


class CheckOverdueNodeInput(BaseModel):
    """检查逾期节点输入"""
    app_token: Optional[str] = Field(default="", description="Base App Token")
    task_table_id: Optional[str] = Field(default="", description="任务跟踪表ID")


class SummarizeNodeInput(BaseModel):
    """汇总结果节点输入"""
    app_token: Optional[str] = Field(default=None, description="Base App Token")
    base_name: str = Field(default="", description="Base名称")
    tables_created: List[Dict[str, str]] = Field(default_factory=list, description="创建的表格列表")
    fields_created: int = Field(default=0, description="创建的字段数量")
    task_created: bool = Field(default=False, description="是否创建了任务记录")
    notification_sent: bool = Field(default=False, description="是否发送了通知")
    overdue_tasks: List[Dict[str, Any]] = Field(default_factory=list, description="逾期任务列表")


# ============ 节点输出类型 ============

class CreateBaseNodeOutput(BaseModel):
    """创建Base节点输出"""
    app_token: Optional[str] = Field(default=None, description="Base App Token")
    base_name: str = Field(default="", description="Base名称")
    folder_token: Optional[str] = Field(default=None, description="父文件夹Token")
    task_data: Optional[Dict[str, Any]] = Field(default=None, description="任务数据")
    member_rotation_enabled: bool = Field(default=True, description="是否启用成员轮值")


class CreateTaskTableNodeOutput(BaseModel):
    """创建任务跟踪表节点输出"""
    task_table_id: Optional[str] = Field(default=None, description="任务跟踪表ID")
    fields_count: int = Field(default=0, description="创建的字段数量")


class CreateProjectTableNodeOutput(BaseModel):
    """创建项目管理表节点输出"""
    project_table_id: Optional[str] = Field(default=None, description="项目管理表ID")
    fields_count: int = Field(default=0, description="创建的字段数量")


class CreateTodoTableNodeOutput(BaseModel):
    """创建待办事项表节点输出"""
    todo_table_id: Optional[str] = Field(default=None, description="待办事项表ID")
    fields_count: int = Field(default=0, description="创建的字段数量")


class CreateRotationTableNodeOutput(BaseModel):
    """创建成员轮值表节点输出"""
    rotation_table_id: Optional[str] = Field(default=None, description="成员轮值表ID")
    fields_count: int = Field(default=0, description="创建的字段数量")


class CreateTaskRecordNodeOutput(BaseModel):
    """创建任务记录节点输出"""
    task_created: bool = Field(default=False, description="是否创建了任务记录")
    assigned_member: Optional[str] = Field(default=None, description="分配的负责人")


class SendNotificationNodeOutput(BaseModel):
    """发送通知节点输出"""
    notification_sent: bool = Field(default=False, description="是否发送了通知")


class CheckOverdueNodeOutput(BaseModel):
    """检查逾期节点输出"""
    overdue_tasks: List[Dict[str, Any]] = Field(default_factory=list, description="逾期任务列表")


class SummarizeNodeOutput(BaseModel):
    """汇总结果节点的输出"""
    success: bool = Field(default=False, description="工作流执行是否成功")
    tables_created: List[Dict[str, str]] = Field(default_factory=list, description="创建的表格列表")
    fields_created: int = Field(default=0, description="创建的字段数量")
    task_created: bool = Field(default=False, description="是否创建了任务记录")
    notification_sent: bool = Field(default=False, description="是否发送了通知")
    overdue_tasks: List[Dict[str, Any]] = Field(default_factory=list, description="逾期任务列表")
    summary: str = Field(default="", description="执行总结")
