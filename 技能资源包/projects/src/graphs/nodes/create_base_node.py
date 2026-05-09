"""
创建飞书多维表格Base节点
用于初始化项目管理Base
"""
import logging
from langchain_core.runnables import RunnableConfig
from langgraph.runtime import Runtime
from coze_coding_utils.runtime_ctx.context import Context

from graphs.state import (
    WorkflowState,
    CreateBaseNodeInput,
    CreateBaseNodeOutput,
    CreateTaskTableNodeInput,
    CreateProjectTableNodeInput,
    CreateTodoTableNodeInput,
    CreateRotationTableNodeInput,
    CreateTaskRecordNodeInput,
    SendNotificationNodeInput,
    CheckOverdueNodeInput,
    SummarizeNodeInput,
    CreateTaskTableNodeOutput,
    CreateProjectTableNodeOutput,
    CreateTodoTableNodeOutput,
    CreateRotationTableNodeOutput,
    CreateTaskRecordNodeOutput,
    SendNotificationNodeOutput,
    CheckOverdueNodeOutput,
    SummarizeNodeOutput,
)
from utils.feishu_api import FeishuBitableAPI as FeishuBitable

logger = logging.getLogger(__name__)


# ============ 转换函数：构建节点输入 ============

def build_create_base_input(state: WorkflowState) -> CreateBaseNodeInput:
    """构建创建Base节点的输入"""
    return CreateBaseNodeInput(
        base_name=state.base_name,
        folder_token=state.folder_token,
        app_token=state.app_token,
        task_data=state.task_data,
        member_rotation_enabled=state.member_rotation_enabled,
    )


def build_task_table_input(state: WorkflowState) -> CreateTaskTableNodeInput:
    """构建创建任务跟踪表节点的输入"""
    return CreateTaskTableNodeInput(
        app_token=state.app_token or "",
        base_name=state.base_name,
    )


def build_project_table_input(state: WorkflowState) -> CreateProjectTableNodeInput:
    """构建创建项目管理表节点的输入"""
    return CreateProjectTableNodeInput(
        app_token=state.app_token or "",
        base_name=state.base_name,
    )


def build_todo_table_input(state: WorkflowState) -> CreateTodoTableNodeInput:
    """构建创建待办事项表节点的输入"""
    return CreateTodoTableNodeInput(
        app_token=state.app_token or "",
        base_name=state.base_name,
    )


def build_rotation_table_input(state: WorkflowState) -> CreateRotationTableNodeInput:
    """构建创建成员轮值表节点的输入"""
    return CreateRotationTableNodeInput(
        app_token=state.app_token or "",
        base_name=state.base_name,
    )


def build_task_record_input(state: WorkflowState) -> CreateTaskRecordNodeInput:
    """构建创建任务记录节点的输入"""
    return CreateTaskRecordNodeInput(
        app_token=state.app_token or "",
        task_table_id=state.task_table_id or "",
        rotation_table_id=state.rotation_table_id,
        task_data=state.task_data,
        member_rotation_enabled=state.member_rotation_enabled,
    )


def build_notification_input(state: WorkflowState) -> SendNotificationNodeInput:
    """构建发送通知节点的输入"""
    return SendNotificationNodeInput(
        task_data=state.task_data,
        assigned_member=state.assigned_member,
    )


def build_overdue_input(state: WorkflowState) -> CheckOverdueNodeInput:
    """构建检查逾期节点的输入"""
    return CheckOverdueNodeInput(
        app_token=state.app_token or "",
        task_table_id=state.task_table_id or "",
    )


def build_summarize_input(state: WorkflowState) -> SummarizeNodeInput:
    """构建汇总结果节点的输入"""
    return SummarizeNodeInput(
        app_token=state.app_token,
        base_name=state.base_name,
        tables_created=state.tables_created,
        fields_created=state.fields_created,
        task_created=state.task_created,
        notification_sent=state.notification_sent,
        overdue_tasks=state.overdue_tasks,
        message=state.message,
    )


# ============ 节点函数 ============

def create_base_node(
    state: CreateBaseNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> CreateBaseNodeOutput:
    """
    title: 创建飞书多维表格Base
    desc: 创建飞书多维表格Base，包含任务跟踪、项目管理、待办事项等预设表格
    integrations: 飞书多维表格
    """
    ctx = runtime.context
    logger.info(f"创建Base: {state.base_name}")
    
    output = CreateBaseNodeOutput(
        base_name=state.base_name,
        folder_token=state.folder_token,
        task_data=state.task_data,
        member_rotation_enabled=state.member_rotation_enabled,
    )
    
    try:
        client = FeishuBitable()
        
        # 如果提供了已存在的app_token，直接使用
        if state.app_token:
            logger.info(f"使用已存在的Base: {state.app_token}")
            output.app_token = state.app_token
            return output
        
        # 创建新的Base
        result = client.create_base(
            name=state.base_name,
            folder_token=state.folder_token
        )
        
        if result.get("code") == 0:
            data = result.get("data", {})
            app_token = data.get("app_token", "")
            
            logger.info(f"Base创建成功: {app_token}")
            
            output.app_token = app_token
        else:
            error_msg = result.get("msg", "未知错误")
            logger.error(f"Base创建失败: {error_msg}")
            
    except Exception as e:
        logger.error(f"创建Base异常: {e}")
    
    return output


def create_task_table_node(
    state: CreateTaskTableNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> CreateTaskTableNodeOutput:
    """
    title: 创建任务跟踪表
    desc: 在飞书多维表格中创建任务跟踪表，包含任务名称、优先级、负责人、状态、截止日期等字段
    integrations: 飞书多维表格
    """
    ctx = runtime.context
    logger.info("创建任务跟踪表")
    
    output = CreateTaskTableNodeOutput()
    
    try:
        from utils.field_mapper import FieldTypeMapper
        client = FeishuBitable()
        field_mapper = FieldTypeMapper()
        
        # 获取字段定义
        field_defs = field_mapper.get_field_definitions_from_config("task_table")
        
        # 构建飞书字段格式
        feishu_fields = []
        for field_def in field_defs:
            feishu_field = field_mapper.build_field_definition(
                field_name=field_def["field_name"],
                business_type=field_def["business_type"],
                required=field_def.get("required", False),
                description=field_def.get("description", ""),
                property_config=field_def.get("property")
            )
            feishu_fields.append(feishu_field)
        
        # 创建表
        result = client.create_table(
            app_token=state.app_token,
            table_name="任务跟踪",
            fields=feishu_fields
        )
        
        if result.get("code") == 0:
            data = result.get("data", {})
            table_id = data.get("table_id", "")
            
            output.task_table_id = table_id
            output.fields_count = len(feishu_fields)
            logger.info(f"任务跟踪表创建成功: {table_id}")
        else:
            logger.error(f"任务跟踪表创建失败: {result.get('msg')}")
            
    except Exception as e:
        logger.error(f"创建任务跟踪表失败: {e}")
    
    return output


def create_project_table_node(
    state: CreateProjectTableNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> CreateProjectTableNodeOutput:
    """
    title: 创建项目管理表
    desc: 在飞书多维表格中创建项目管理表，包含项目名称、负责人、状态、进度等字段
    integrations: 飞书多维表格
    """
    ctx = runtime.context
    logger.info("创建项目管理表")
    
    output = CreateProjectTableNodeOutput()
    
    try:
        from utils.field_mapper import FieldTypeMapper
        client = FeishuBitable()
        field_mapper = FieldTypeMapper()
        
        # 获取字段定义
        field_defs = field_mapper.get_field_definitions_from_config("project_table")
        
        # 构建飞书字段格式
        feishu_fields = []
        for field_def in field_defs:
            feishu_field = field_mapper.build_field_definition(
                field_name=field_def["field_name"],
                business_type=field_def["business_type"],
                required=field_def.get("required", False),
                description=field_def.get("description", ""),
                property_config=field_def.get("property")
            )
            feishu_fields.append(feishu_field)
        
        # 创建表
        result = client.create_table(
            app_token=state.app_token,
            table_name="项目管理",
            fields=feishu_fields
        )
        
        if result.get("code") == 0:
            data = result.get("data", {})
            table_id = data.get("table_id", "")
            
            output.project_table_id = table_id
            output.fields_count = len(feishu_fields)
            logger.info(f"项目管理表创建成功: {table_id}")
        else:
            logger.error(f"项目管理表创建失败: {result.get('msg')}")
            
    except Exception as e:
        logger.error(f"创建项目管理表失败: {e}")
    
    return output


def create_todo_table_node(
    state: CreateTodoTableNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> CreateTodoTableNodeOutput:
    """
    title: 创建待办事项表
    desc: 在飞书多维表格中创建待办事项表，用于跟进任务和逾期处理
    integrations: 飞书多维表格
    """
    ctx = runtime.context
    logger.info("创建待办事项表")
    
    output = CreateTodoTableNodeOutput()
    
    try:
        from utils.field_mapper import FieldTypeMapper
        client = FeishuBitable()
        field_mapper = FieldTypeMapper()
        
        # 获取字段定义
        field_defs = field_mapper.get_field_definitions_from_config("todo_table")
        
        # 构建飞书字段格式
        feishu_fields = []
        for field_def in field_defs:
            feishu_field = field_mapper.build_field_definition(
                field_name=field_def["field_name"],
                business_type=field_def["business_type"],
                required=field_def.get("required", False),
                description=field_def.get("description", ""),
                property_config=field_def.get("property")
            )
            feishu_fields.append(feishu_field)
        
        # 创建表
        result = client.create_table(
            app_token=state.app_token,
            table_name="待办事项",
            fields=feishu_fields
        )
        
        if result.get("code") == 0:
            data = result.get("data", {})
            table_id = data.get("table_id", "")
            
            output.todo_table_id = table_id
            output.fields_count = len(feishu_fields)
            logger.info(f"待办事项表创建成功: {table_id}")
        else:
            logger.error(f"待办事项表创建失败: {result.get('msg')}")
            
    except Exception as e:
        logger.error(f"创建待办事项表失败: {e}")
    
    return output


def create_rotation_table_node(
    state: CreateRotationTableNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> CreateRotationTableNodeOutput:
    """
    title: 创建成员轮值表
    desc: 在飞书多维表格中创建成员轮值表，用于高优先级任务的自动分配
    integrations: 飞书多维表格
    """
    ctx = runtime.context
    logger.info("创建成员轮值表")
    
    output = CreateRotationTableNodeOutput()
    
    try:
        from utils.field_mapper import FieldTypeMapper
        client = FeishuBitable()
        field_mapper = FieldTypeMapper()
        
        # 获取字段定义
        field_defs = field_mapper.get_field_definitions_from_config("member_rotation_table")
        
        # 构建飞书字段格式
        feishu_fields = []
        for field_def in field_defs:
            feishu_field = field_mapper.build_field_definition(
                field_name=field_def["field_name"],
                business_type=field_def["business_type"],
                required=field_def.get("required", False),
                description=field_def.get("description", ""),
                property_config=field_def.get("property")
            )
            feishu_fields.append(feishu_field)
        
        # 创建表
        result = client.create_table(
            app_token=state.app_token,
            table_name="成员轮值表",
            fields=feishu_fields
        )
        
        if result.get("code") == 0:
            data = result.get("data", {})
            table_id = data.get("table_id", "")
            
            output.rotation_table_id = table_id
            output.fields_count = len(feishu_fields)
            logger.info(f"成员轮值表创建成功: {table_id}")
        else:
            logger.error(f"成员轮值表创建失败: {result.get('msg')}")
            
    except Exception as e:
        logger.error(f"创建成员轮值表失败: {e}")
    
    return output


def create_task_record_node(
    state: CreateTaskRecordNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> CreateTaskRecordNodeOutput:
    """
    title: 创建任务记录
    desc: 在任务跟踪表中创建新任务记录，支持高优先级任务自动分配
    integrations: 飞书多维表格, 飞书消息
    """
    from datetime import datetime, timedelta
    
    ctx = runtime.context
    task_data = state.task_data or {}
    logger.info(f"创建任务记录: {task_data.get('任务名称', '未命名')}")
    
    output = CreateTaskRecordNodeOutput()
    
    try:
        client = FeishuBitable()
        
        # 构建记录字段
        record_fields = {
            "任务名称": task_data.get("任务名称", ""),
            "优先级": task_data.get("优先级", "中"),
            "状态": task_data.get("状态", "待分配"),
            "备注": task_data.get("备注", ""),
        }
        
        # 处理截止日期
        if task_data.get("截止日期"):
            deadline = task_data.get("截止日期")
            if isinstance(deadline, str):
                try:
                    dt = datetime.strptime(deadline, "%Y-%m-%d")
                    record_fields["截止日期"] = int(dt.timestamp() * 1000)
                except ValueError:
                    future_date = datetime.now() + timedelta(days=7)
                    record_fields["截止日期"] = int(future_date.timestamp() * 1000)
            else:
                record_fields["截止日期"] = deadline
        
        # 处理负责人
        if task_data.get("负责人"):
            record_fields["负责人"] = task_data.get("负责人")
        
        # 检查是否需要自动分配（高优先级且无负责人）
        assigned_member = None
        priority = task_data.get("优先级", "中")
        has_assignee = bool(task_data.get("负责人"))
        
        if state.member_rotation_enabled and priority == "高" and not has_assignee:
            # 查询轮值表获取下一位成员
            try:
                if state.rotation_table_id:
                    rotation_result = client.search_records(
                        app_token=state.app_token,
                        table_id=state.rotation_table_id,
                        page_size=100
                    )
                    
                    if rotation_result.get("code") == 0:
                        items = rotation_result.get("data", {}).get("items", [])
                        if items:
                            sorted_members = sorted(items, key=lambda x: x.get("fields", {}).get("轮值顺序", 999))
                            if sorted_members:
                                first_member = sorted_members[0].get("fields", {}).get("成员名称", {})
                                if isinstance(first_member, list) and len(first_member) > 0:
                                    assigned_member = first_member[0].get("id")
                                elif isinstance(first_member, dict):
                                    assigned_member = first_member.get("id")
                                
                                if assigned_member:
                                    record_fields["负责人"] = assigned_member
                                    record_fields["状态"] = "进行中"
                                    output.assigned_member = assigned_member
            except Exception as e:
                logger.warning(f"获取轮值成员失败: {e}")
        
        # 创建记录
        result = client.add_records(
            app_token=state.app_token,
            table_id=state.task_table_id,
            records=[{"fields": record_fields}]
        )
        
        if result.get("code") == 0:
            output.task_created = True
            logger.info(f"任务记录创建成功")
        else:
            logger.error(f"任务记录创建失败: {result.get('msg')}")
            
    except Exception as e:
        logger.error(f"创建任务记录失败: {e}")
    
    return output


def send_notification_node(
    state: SendNotificationNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> SendNotificationNodeOutput:
    """
    title: 发送任务通知
    desc: 当任务被创建或更新时，发送飞书消息通知给相关人员
    integrations: 飞书消息
    """
    from datetime import datetime
    from utils.feishu_api import FeishuMessageAPI
    
    ctx = runtime.context
    task_data = state.task_data or {}
    logger.info(f"发送任务通知: {task_data.get('任务名称', '')}")
    
    output = SendNotificationNodeOutput()
    
    try:
        # 准备通知内容
        task_name = task_data.get("任务名称", "未知任务")
        priority = task_data.get("优先级", "中")
        assignee = state.assigned_member or task_data.get("负责人", "")
        
        # 构建消息内容
        title = "【高优先级任务提醒】"
        content_lines = [
            f"任务：{task_name}",
            f"优先级：{priority}",
            f"负责人：{assignee or '待分配'}",
        ]
        
        # 添加截止日期
        deadline = task_data.get("截止日期")
        if deadline:
            if isinstance(deadline, int):
                deadline_str = datetime.fromtimestamp(deadline / 1000).strftime("%Y-%m-%d")
            else:
                deadline_str = str(deadline)
            content_lines.append(f"截止时间：{deadline_str}")
        
        content_lines.append("请尽快处理！")
        
        message_content = "\n".join(content_lines)
        
        # 尝试发送消息
        try:
            msg_client = FeishuMessageAPI()
            
            # 获取webhook_url（从环境变量或配置）
            import os
            webhook_url = os.getenv("FEISHU_WEBHOOK_URL")
            
            if webhook_url:
                result = msg_client.send_text_message(
                    webhook_url=webhook_url,
                    text=f"{title}\n{message_content}"
                )
                
                if result.get("code") == 0 or result.get("code") == 200:
                    logger.info("任务通知发送成功")
                    output.notification_sent = True
                else:
                    logger.warning(f"通知发送失败: {result.get('msg')}")
            else:
                # 没有webhook配置时记录日志
                logger.warning("未配置飞书消息webhook，无法发送通知")
        except Exception as e:
            logger.warning(f"发送消息失败: {e}")
        
    except Exception as e:
        logger.error(f"发送通知失败: {e}")
    
    return output


def check_overdue_node(
    state: CheckOverdueNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> CheckOverdueNodeOutput:
    """
    title: 检查逾期任务
    desc: 检查任务跟踪表中的逾期任务，生成逾期预警报告
    integrations: 飞书多维表格
    """
    from datetime import datetime
    from typing import List, Dict, Any
    
    ctx = runtime.context
    logger.info("检查逾期任务")
    
    output = CheckOverdueNodeOutput()
    
    try:
        client = FeishuBitable()
        
        # 查询进行中的任务
        result = client.search_records(
            app_token=state.app_token,
            table_id=state.task_table_id,
            filter_config={
                "conjunction": "and",
                "conditions": [
                    {
                        "field_name": "状态",
                        "operator": "is",
                        "value": ["进行中"]
                    }
                ]
            }
        )
        
        if result.get("code") == 0:
            items = result.get("data", {}).get("items", [])
            current_time = datetime.now()
            overdue_tasks: List[Dict[str, Any]] = []
            
            for item in items:
                fields = item.get("fields", {})
                deadline = fields.get("截止日期")
                
                if deadline:
                    # 转换时间戳
                    if isinstance(deadline, int):
                        deadline_dt = datetime.fromtimestamp(deadline / 1000)
                    elif isinstance(deadline, str):
                        try:
                            deadline_dt = datetime.strptime(deadline, "%Y-%m-%d")
                        except ValueError:
                            continue
                    else:
                        continue
                    
                    # 检查是否逾期
                    if deadline_dt < current_time:
                        overdue_days = (current_time - deadline_dt).days
                        
                        overdue_task = {
                            "record_id": item.get("record_id", ""),
                            "task_name": fields.get("任务名称", "未知"),
                            "deadline": deadline_dt.strftime("%Y-%m-%d"),
                            "overdue_days": overdue_days
                        }
                        overdue_tasks.append(overdue_task)
            
            output.overdue_tasks = overdue_tasks
            count = len(overdue_tasks)
            if count > 0:
                logger.info(f"发现 {count} 个逾期任务")
            else:
                logger.info("没有发现逾期任务")
        else:
            logger.error(f"查询逾期任务失败: {result.get('msg')}")
            
    except Exception as e:
        logger.error(f"检查逾期任务失败: {e}")
    
    return output


def summarize_result_node(
    state: SummarizeNodeInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> SummarizeNodeOutput:
    """
    title: 汇总工作流结果
    desc: 汇总整个工作流的执行结果，生成最终报告
    integrations: 飞书多维表格, 飞书消息
    """
    ctx = runtime.context
    logger.info("汇总工作流结果")
    
    # 构建汇总结果
    tables_created = state.tables_created
    fields_count = state.fields_created
    overdue_count = len(state.overdue_tasks) if state.overdue_tasks else 0
    
    # 生成详细报告
    report_lines = [
        f"Base名称: {state.base_name}",
        f"App Token: {state.app_token or '未创建'}",
        f"",
        f"创建表格数量: {len(tables_created)}",
    ]
    
    for table in tables_created:
        report_lines.append(f"  - {table.get('name', '未知')}: {table.get('table_id', '')}")
    
    report_lines.extend([
        f"",
        f"创建字段总数: {fields_count}",
        f"任务创建状态: {'成功' if state.task_created else '未创建'}",
        f"通知发送状态: {'已发送' if state.notification_sent else '未发送'}",
        f"逾期任务数量: {overdue_count}",
    ])
    
    # 添加逾期任务详情
    if state.overdue_tasks:
        report_lines.append("")
        report_lines.append("逾期任务详情:")
        for task in state.overdue_tasks[:5]:  # 最多显示5个
            report_lines.append(
                f"  - {task.get('task_name', '未知')}: "
                f"逾期 {task.get('overdue_days', 0)} 天"
            )
    
    report = "\n".join(report_lines)
    
    logger.info(f"工作流执行完成:\n{report}")
    
    # 返回汇总结果
    return SummarizeNodeOutput(
        success=bool(state.app_token),
        tables_created=tables_created,
        fields_created=fields_count,
        task_created=state.task_created,
        notification_sent=state.notification_sent,
        overdue_tasks=state.overdue_tasks,
        summary=report
    )
