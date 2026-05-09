#!/usr/bin/env python3
"""
飞书多维表格创建脚本
通过飞书API自动创建表格，支持自定义表格名称和基础结构
"""

import json
import os
import sys
import logging
from typing import Any, Dict, List, Optional

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.feishu_api import FeishuBitableAPI, get_feishu_api
from utils.field_mapper import FieldTypeMapper, get_field_mapper

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BitableTableCreator:
    """
    飞书多维表格创建器
    提供表格创建、配置等高级功能
    """

    def __init__(
        self,
        api: Optional[FeishuBitableAPI] = None,
        field_mapper: Optional[FieldTypeMapper] = None
    ):
        """
        初始化表格创建器

        Args:
            api: 飞书API实例
            field_mapper: 字段映射器实例
        """
        self.api = api or get_feishu_api()
        self.field_mapper = field_mapper or get_field_mapper()

    def create_project_management_base(
        self,
        base_name: str = "项目管理",
        folder_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        创建项目管理多维表格Base，包含多个预设表格

        Args:
            base_name: Base 名称
            folder_token: 所属文件夹 Token

        Returns:
            创建的 Base 信息
        """
        logger.info(f"正在创建项目管理 Base: {base_name}")

        # 创建Base
        base_info = self.api.create_base(name=base_name, folder_token=folder_token)
        app_token = base_info.get("app_token")
        logger.info(f"Base 创建成功，app_token: {app_token}")

        # 创建默认表格：任务管理
        task_table = self._create_task_table(app_token)
        logger.info(f"任务管理表创建成功，table_id: {task_table.get('table_id')}")

        # 创建默认表格：项目管理
        project_table = self._create_project_table(app_token)
        logger.info(f"项目管理表创建成功，table_id: {project_table.get('table_id')}")

        # 创建默认表格：里程碑管理
        milestone_table = self._create_milestone_table(app_token)
        logger.info(f"里程碑管理表创建成功，table_id: {milestone_table.get('table_id')}")

        return {
            "app_token": app_token,
            "name": base_name,
            "tables": {
                "task_table": task_table,
                "project_table": project_table,
                "milestone_table": milestone_table
            }
        }

    def _create_task_table(self, app_token: str) -> Dict[str, Any]:
        """创建任务管理表"""
        # 获取预设字段
        fields = self.field_mapper.get_field_definitions_from_config("task_table")

        # 创建表
        table = self.api.create_table(
            app_token=app_token,
            table_name="任务管理",
            fields=fields
        )
        return table

    def _create_project_table(self, app_token: str) -> Dict[str, Any]:
        """创建项目管理表"""
        # 获取预设字段
        fields = self.field_mapper.get_field_definitions_from_config("project_table")

        # 创建表
        table = self.api.create_table(
            app_token=app_token,
            table_name="项目管理",
            fields=fields
        )
        return table

    def _create_milestone_table(self, app_token: str) -> Dict[str, Any]:
        """创建里程碑管理表"""
        # 获取预设字段
        fields = self.field_mapper.get_field_definitions_from_config("milestone_table")

        # 创建表
        table = self.api.create_table(
            app_token=app_token,
            table_name="里程碑管理",
            fields=fields
        )
        return table

    def create_custom_table(
        self,
        app_token: str,
        table_name: str,
        fields_config: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        创建自定义表格

        Args:
            app_token: Base 的唯一标识
            table_name: 表名称
            fields_config: 字段配置列表

        Returns:
            创建的表信息
        """
        logger.info(f"正在创建自定义表: {table_name}")

        # 转换字段配置
        fields = []
        for field_cfg in fields_config:
            field_def = self.field_mapper.build_field_definition(
                field_name=field_cfg.get("name", ""),
                business_type=field_cfg.get("type", "string"),
                required=field_cfg.get("required", False),
                description=field_cfg.get("description", ""),
                property_config=field_cfg.get("property")
            )
            fields.append(field_def)

        # 创建表
        table = self.api.create_table(
            app_token=app_token,
            table_name=table_name,
            fields=fields
        )

        logger.info(f"表 {table_name} 创建成功，table_id: {table.get('table_id')}")
        return table

    def create_table_from_config(
        self,
        app_token: str,
        config_path: str,
        table_key: str
    ) -> Dict[str, Any]:
        """
        从配置文件创建表格

        Args:
            app_token: Base 的唯一标识
            config_path: 配置文件路径
            table_key: 表格配置键名

        Returns:
            创建的表信息
        """
        # 加载配置
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)

        table_config = config.get("field_definitions", {}).get(table_key, {})
        table_name = table_config.get("table_name", table_key)

        return self.create_custom_table(
            app_token=app_token,
            table_name=table_name,
            fields_config=table_config.get("fields", [])
        )

    def list_and_display_tables(self, app_token: str) -> List[Dict[str, Any]]:
        """
        列出并显示Base中的所有表格

        Args:
            app_token: Base 的唯一标识

        Returns:
            表格列表
        """
        tables = self.api.list_tables(app_token)

        print(f"\nBase: {app_token}")
        print("=" * 60)
        print(f"{'表格名称':<20} {'表格ID':<25} {'版本':<10}")
        print("-" * 60)

        for table in tables:
            print(f"{table.get('name', ''):<20} {table.get('table_id', ''):<25} {table.get('revision', ''):<10}")

        print("=" * 60)
        return tables

    def delete_table(self, app_token: str, table_id: str) -> bool:
        """
        删除表格

        Args:
            app_token: Base 的唯一标识
            table_id: 待删除的表 ID

        Returns:
            是否删除成功
        """
        logger.info(f"正在删除表: {table_id}")
        result = self.api.delete_tables(app_token, table_id)
        logger.info(f"表 {table_id} 删除{'成功' if result else '失败'}")
        return result

    def setup_project_workflow_tables(
        self,
        base_name: str = "项目管理工作流",
        folder_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        设置项目管理工作流所需的完整表格结构

        Args:
            base_name: Base 名称
            folder_token: 所属文件夹 Token

        Returns:
            创建结果
        """
        logger.info(f"正在创建项目管理工作流: {base_name}")

        # 创建Base
        base_info = self.api.create_base(name=base_name, folder_token=folder_token)
        app_token = base_info.get("app_token")
        logger.info(f"Base 创建成功: {app_token}")

        # 创建表格清单
        table_configs = [
            ("task_table", "任务管理"),
            ("project_table", "项目管理"),
            ("milestone_table", "里程碑管理"),
            ("team_table", "团队成员"),
            ("document_table", "文档管理"),
            ("risk_table", "风险管理"),
            ("budget_table", "预算管理")
        ]

        created_tables = {}
        for config_key, table_name in table_configs:
            try:
                # 尝试从配置获取字段
                fields = self.field_mapper.get_field_definitions_from_config(config_key)
                if not fields:
                    # 使用默认字段
                    fields = self._get_default_fields_for_table(config_key)

                table = self.api.create_table(
                    app_token=app_token,
                    table_name=table_name,
                    fields=fields
                )
                created_tables[config_key] = table
                logger.info(f"✓ 表 {table_name} 创建成功")
            except Exception as e:
                logger.error(f"✗ 表 {table_name} 创建失败: {e}")

        return {
            "app_token": app_token,
            "name": base_name,
            "tables": created_tables
        }

    def _get_default_fields_for_table(self, table_key: str) -> List[Dict[str, Any]]:
        """获取表格的默认字段配置"""
        default_fields = {
            "team_table": [
                {"name": "姓名", "type": 1, "description": "成员姓名"},
                {"name": "工号", "type": 1, "description": "员工工号"},
                {"name": "部门", "type": 1, "description": "所属部门"},
                {"name": "职位", "type": 1, "description": "职位名称"},
                {"name": "邮箱", "type": 1, "description": "工作邮箱"},
                {"name": "电话", "type": 1003, "description": "联系电话"}
            ],
            "document_table": [
                {"name": "文档名称", "type": 1, "description": "文档标题"},
                {"name": "文档类型", "type": 3, "description": "文档类型", "property": {"options": [{"name": "需求文档", "color": 0}, {"name": "设计文档", "color": 1}, {"name": "测试报告", "color": 2}, {"name": "其他", "color": 3}]}},
                {"name": "版本", "type": 1, "description": "文档版本"},
                {"name": "作者", "type": 20, "description": "文档作者"},
                {"name": "创建日期", "type": 5, "description": "创建时间"},
                {"name": "附件", "type": 13, "description": "文档附件"}
            ],
            "risk_table": [
                {"name": "风险名称", "type": 1, "description": "风险标题"},
                {"name": "风险等级", "type": 3, "description": "风险等级", "property": {"options": [{"name": "低", "color": 0}, {"name": "中", "color": 2}, {"name": "高", "color": 3}, {"name": "严重", "color": 4}]}},
                {"name": "发生概率", "type": 3, "description": "发生概率", "property": {"options": [{"name": "极低", "color": 0}, {"name": "低", "color": 1}, {"name": "中", "color": 2}, {"name": "高", "color": 3}, {"name": "极高", "color": 4}]}},
                {"name": "负责人", "type": 20, "description": "风险负责人"},
                {"name": "应对措施", "type": 1, "description": "风险应对措施"},
                {"name": "状态", "type": 3, "description": "风险状态", "property": {"options": [{"name": "识别中", "color": 0}, {"name": "处理中", "color": 2}, {"name": "已解决", "color": 4}, {"name": "已关闭", "color": 1}]}}
            ],
            "budget_table": [
                {"name": "预算项目", "type": 1, "description": "预算项目名称"},
                {"name": "预算类型", "type": 3, "description": "预算类型", "property": {"options": [{"name": "人力成本", "color": 0}, {"name": "设备采购", "color": 1}, {"name": "软件服务", "color": 2}, {"name": "其他", "color": 3}]}},
                {"name": "预算金额", "type": 2, "description": "预算金额", "property": {"formatter": "¥*"}},
                {"name": "实际花费", "type": 2, "description": "实际花费", "property": {"formatter": "¥*"}},
                {"name": "负责人", "type": 20, "description": "预算负责人"},
                {"name": "预算日期", "type": 5, "description": "预算日期"}
            ]
        }
        return default_fields.get(table_key, [])


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="飞书多维表格创建工具")
    parser.add_argument("--name", "-n", default="项目管理", help="Base 名称")
    parser.add_argument("--app-token", "-a", help="已存在的 Base app_token，为空则创建新 Base")
    parser.add_argument("--config", "-c", default="config/fields_definition.json", help="字段配置文件路径")
    parser.add_argument("--folder-token", "-f", help="文件夹 Token")
    parser.add_argument("--list", "-l", action="store_true", help="列出 Base 中的表格")
    parser.add_argument("--full-workflow", "-w", action="store_true", help="创建完整项目管理工作流")

    args = parser.parse_args()

    creator = BitableTableCreator()

    try:
        if args.full_workflow:
            # 创建完整工作流
            result = creator.setup_project_workflow_tables(
                base_name=args.name,
                folder_token=args.folder_token
            )
            print("\n✓ 完整项目管理工作流创建成功！")
            print(f"App Token: {result['app_token']}")
            print(f"创建表格数: {len(result['tables'])}")

        elif args.app_token:
            # 在已存在的 Base 中操作
            if args.list:
                tables = creator.list_and_display_tables(args.app_token)
                print(f"\n共找到 {len(tables)} 个表格")
            else:
                # 创建项目管理表格
                result = creator.create_project_management_base(
                    base_name=args.name,
                    folder_token=args.folder_token
                )
                print("\n✓ 项目管理表格创建成功！")
                print(f"App Token: {result['app_token']}")
                for table_name, table_info in result['tables'].items():
                    print(f"  - {table_name}: {table_info.get('table_id')}")

        else:
            # 创建新 Base
            result = creator.create_project_management_base(
                base_name=args.name,
                folder_token=args.folder_token
            )
            print("\n✓ 项目管理表格创建成功！")
            print(f"App Token: {result['app_token']}")
            print(f"Base 名称: {result['name']}")
            print("\n创建的数据表:")
            for table_name, table_info in result['tables'].items():
                print(f"  - {table_name}: {table_info.get('table_id')}")

    except Exception as e:
        logger.error(f"执行失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
