#!/usr/bin/env python3
"""
飞书多维表格视图创建脚本
实现自动创建表格视图，包括分组、筛选、排序和数据展示配置

注意：飞书多维表格API目前不支持直接创建视图，但可以设计视图配置结构
用于后续通过API或手动方式应用视图设置
"""

import json
import os
import sys
import logging
from typing import Any, Dict, List, Optional

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.feishu_api import FeishuBitableAPI, get_feishu_api

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ViewConfigGenerator:
    """
    视图配置生成器
    生成飞书表格视图的JSON配置结构
    """

    # 视图类型
    VIEW_TYPE_GRID = "grid"           # 网格视图（默认）
    VIEW_TYPE_GALLERY = "gallery"     # 画册视图
    VIEW_TYPE_FORM = "form"           # 表单视图
    VIEW_TYPE_KANBAN = "kanban"      # 看板视图
    VIEW_TYPE_GROUP = "group"         # 分组视图

    def __init__(self):
        """初始化视图配置生成器"""
        pass

    def generate_view_config(
        self,
        view_name: str,
        view_type: str = "grid",
        filter_config: Optional[Dict] = None,
        sort_config: Optional[List[Dict]] = None,
        group_config: Optional[Dict] = None,
        hidden_fields: Optional[List[str]] = None,
        field_widths: Optional[Dict[str, int]] = None,
        field_orders: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        生成视图配置

        Args:
            view_name: 视图名称
            view_type: 视图类型
            filter_config: 筛选条件配置
            sort_config: 排序条件配置
            group_config: 分组配置
            hidden_fields: 隐藏字段列表
            field_widths: 字段宽度配置
            field_orders: 字段显示顺序

        Returns:
            视图配置字典
        """
        config = {
            "view_name": view_name,
            "view_type": view_type,
            "filter": filter_config,
            "sort": sort_config,
            "group": group_config,
            "display": {
                "hidden_fields": hidden_fields or [],
                "field_widths": field_widths or {},
                "field_orders": field_orders or []
            }
        }
        return config

    def generate_filter_condition(
        self,
        field_name: str,
        operator: str,
        value: Any
    ) -> Dict[str, Any]:
        """
        生成筛选条件

        Args:
            field_name: 字段名称
            operator: 运算符 (is, isNot, contains, doesNotContain, isEmpty, isNotEmpty, isGreater, isLess等)
            value: 条件值

        Returns:
            条件配置
        """
        return {
            "field_name": field_name,
            "operator": operator,
            "value": value
        }

    def generate_filter_config(
        self,
        conditions: List[Dict[str, Any]],
        conjunction: str = "and"
    ) -> Dict[str, Any]:
        """
        生成筛选配置

        Args:
            conditions: 条件列表
            conjunction: 逻辑连接符 (and/or)

        Returns:
            筛选配置
        """
        return {
            "conjunction": conjunction,
            "conditions": conditions
        }

    def generate_sort_config(
        self,
        field_name: str,
        descending: bool = False
    ) -> Dict[str, Any]:
        """
        生成排序配置

        Args:
            field_name: 字段名称
            descending: 是否降序

        Returns:
            排序配置
        """
        return {
            "field_name": field_name,
            "desc": descending
        }

    def generate_group_config(
        self,
        field_name: str,
        sub_group_field: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        生成分组配置

        Args:
            field_name: 分组字段名称
            sub_group_field: 子分组字段名称

        Returns:
            分组配置
        """
        config = {
            "field_name": field_name
        }
        if sub_group_field:
            config["sub_group_field"] = sub_group_field
        return config

    def generate_kanban_config(
        self,
        group_field: str,
        show_empty: bool = True,
        card_fields: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        生成看板视图配置

        Args:
            group_field: 分组字段（通常为单选字段）
            show_empty: 是否显示空列
            card_fields: 卡片显示字段

        Returns:
            看板视图配置
        """
        return {
            "view_type": self.VIEW_TYPE_Kanban,
            "group_field": group_field,
            "show_empty": show_empty,
            "card_fields": card_fields or []
        }


class BitableViewManager:
    """
    飞书多维表格视图管理器
    管理视图配置和预设视图模板
    """

    def __init__(self, api: Optional[FeishuBitableAPI] = None):
        """
        初始化视图管理器

        Args:
            api: 飞书API实例
        """
        self.api = api or get_feishu_api()
        self.config_generator = ViewConfigGenerator()

    def create_task_view_templates(self, app_token: str, table_id: str) -> List[Dict[str, Any]]:
        """
        创建任务管理的预设视图模板

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID

        Returns:
            视图配置列表
        """
        logger.info("创建任务管理视图模板")

        views = []

        # 1. 默认网格视图（按优先级排序）
        view1 = self.config_generator.generate_view_config(
            view_name="任务总览",
            view_type="grid",
            sort_config=[
                self.config_generator.generate_sort_config("优先级", descending=True),
                self.config_generator.generate_sort_config("截止日期")
            ]
        )
        views.append(view1)

        # 2. 按状态分组视图
        view2 = self.config_generator.generate_view_config(
            view_name="按状态分组",
            view_type="group",
            group_config=self.config_generator.generate_group_config("状态"),
            sort_config=[
                self.config_generator.generate_sort_config("优先级", descending=True)
            ]
        )
        views.append(view2)

        # 3. 待处理任务看板
        view3 = self.config_generator.generate_view_config(
            view_name="待处理看板",
            view_type="kanban",
            filter_config=self.config_generator.generate_filter_config([
                self.config_generator.generate_filter_condition("状态", "is", "待处理")
            ]),
            kanban_config=self.config_generator.generate_kanban_config(
                group_field="优先级",
                card_fields=["任务名称", "负责人", "截止日期"]
            )
        )
        views.append(view3)

        # 4. 我的任务视图
        view4 = self.config_generator.generate_view_config(
            view_name="我的任务",
            view_type="grid",
            filter_config=self.config_generator.generate_filter_config([
                self.config_generator.generate_filter_condition("状态", "isNot", "已完成")
            ]),
            sort_config=[
                self.config_generator.generate_sort_config("优先级", descending=True),
                self.config_generator.generate_sort_config("截止日期")
            ]
        )
        views.append(view4)

        # 5. 逾期任务视图
        view5 = self.config_generator.generate_view_config(
            view_name="逾期任务",
            view_type="grid",
            filter_config=self.config_generator.generate_filter_config([
                self.config_generator.generate_filter_condition("是否逾期", "is", True)
            ]),
            sort_config=[
                self.config_generator.generate_sort_config("逾期天数", descending=True)
            ]
        )
        views.append(view5)

        return views

    def create_project_view_templates(self, app_token: str, table_id: str) -> List[Dict[str, Any]]:
        """
        创建项目管理的预设视图模板

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID

        Returns:
            视图配置列表
        """
        logger.info("创建项目管理视图模板")

        views = []

        # 1. 项目总览
        view1 = self.config_generator.generate_view_config(
            view_name="项目总览",
            view_type="grid",
            sort_config=[
                self.config_generator.generate_sort_config("项目状态"),
                self.config_generator.generate_sort_config("结束日期")
            ]
        )
        views.append(view1)

        # 2. 进行中项目
        view2 = self.config_generator.generate_view_config(
            view_name="进行中项目",
            view_type="grid",
            filter_config=self.config_generator.generate_filter_config([
                self.config_generator.generate_filter_condition("项目状态", "is", "进行中")
            ]),
            sort_config=[
                self.config_generator.generate_sort_config("结束日期")
            ]
        )
        views.append(view2)

        # 3. 按负责人分组
        view3 = self.config_generator.generate_view_config(
            view_name="按负责人分组",
            view_type="group",
            group_config=self.config_generator.generate_group_config("项目负责人")
        )
        views.append(view3)

        # 4. 项目看板
        view4 = self.config_generator.generate_view_config(
            view_name="项目看板",
            view_type="kanban",
            kanban_config=self.config_generator.generate_kanban_config(
                group_field="项目状态",
                card_fields=["项目名称", "项目负责人", "完成率", "结束日期"]
            )
        )
        views.append(view4)

        return views

    def create_milestone_view_templates(self, app_token: str, table_id: str) -> List[Dict[str, Any]]:
        """
        创建里程碑管理的预设视图模板

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID

        Returns:
            视图配置列表
        """
        logger.info("创建里程碑管理视图模板")

        views = []

        # 1. 里程碑总览
        view1 = self.config_generator.generate_view_config(
            view_name="里程碑总览",
            view_type="grid",
            sort_config=[
                self.config_generator.generate_sort_config("计划日期"),
                self.config_generator.generate_sort_config("状态")
            ]
        )
        views.append(view1)

        # 2. 待完成里程碑
        view2 = self.config_generator.generate_view_config(
            view_name="待完成里程碑",
            view_type="grid",
            filter_config=self.config_generator.generate_filter_config([
                self.config_generator.generate_filter_condition("状态", "isNot", "已完成")
            ]),
            sort_config=[
                self.config_generator.generate_sort_config("计划日期")
            ]
        )
        views.append(view2)

        # 3. 按项目分组
        view3 = self.config_generator.generate_view_config(
            view_name="按项目分组",
            view_type="group",
            group_config=self.config_generator.generate_group_config("所属项目")
        )
        views.append(view3)

        return views

    def save_view_config(
        self,
        views: List[Dict[str, Any]],
        output_path: str
    ) -> bool:
        """
        保存视图配置到文件

        Args:
            views: 视图配置列表
            output_path: 输出文件路径

        Returns:
            是否保存成功
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump({
                    "version": "1.0",
                    "description": "飞书表格视图配置",
                    "views": views
                }, f, ensure_ascii=False, indent=2)
            logger.info(f"✓ 视图配置已保存到: {output_path}")
            return True
        except Exception as e:
            logger.error(f"保存视图配置失败: {e}")
            return False

    def load_view_config(self, config_path: str) -> List[Dict[str, Any]]:
        """
        从文件加载视图配置

        Args:
            config_path: 配置文件路径

        Returns:
            视图配置列表
        """
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            return config.get("views", [])
        except Exception as e:
            logger.error(f"加载视图配置失败: {e}")
            return []

    def generate_full_project_views(self, app_token: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        生成完整的项目管理视图配置

        Args:
            app_token: Base 的唯一标识

        Returns:
            各表格的视图配置字典
        """
        # 获取所有表格
        tables = self.api.list_tables(app_token)

        all_views = {}
        for table in tables:
            table_name = table.get("name", "")
            table_id = table.get("table_id", "")

            if "任务" in table_name:
                views = self.create_task_view_templates(app_token, table_id)
            elif "项目" in table_name:
                views = self.create_project_view_templates(app_token, table_id)
            elif "里程碑" in table_name:
                views = self.create_milestone_view_templates(app_token, table_id)
            else:
                # 默认视图
                views = [
                    self.config_generator.generate_view_config(
                        view_name="默认视图",
                        view_type="grid"
                    )
                ]

            all_views[table_name] = views
            logger.info(f"为表格 '{table_name}' 生成了 {len(views)} 个视图配置")

        return all_views

    def export_views_to_markdown(self, views: Dict[str, List[Dict[str, Any]]]) -> str:
        """
        导出视图配置为 Markdown 文档

        Args:
            views: 视图配置字典

        Returns:
            Markdown 格式的文档
        """
        lines = [
            "# 飞书表格视图配置",
            "",
            "## 视图配置说明",
            "",
            "以下文档描述了各表格的预设视图配置，可用于手动创建视图或导入到其他系统。",
            ""
        ]

        for table_name, table_views in views.items():
            lines.append(f"### {table_name}")
            lines.append("")

            for view in table_views:
                lines.append(f"#### {view.get('view_name', '未命名视图')}")
                lines.append("")
                lines.append(f"- **视图类型**: `{view.get('view_type', 'grid')}`")

                # 筛选条件
                if view.get('filter'):
                    filter_cfg = view['filter']
                    lines.append(f"- **筛选条件**: {filter_cfg.get('conjunction', 'and').upper()}")
                    for cond in filter_cfg.get('conditions', []):
                        lines.append(f"  - {cond.get('field_name')} {cond.get('operator')} {cond.get('value')}")

                # 排序
                if view.get('sort'):
                    lines.append("- **排序**:")
                    for sort in view['sort']:
                        desc = "↓" if sort.get('desc') else "↑"
                        lines.append(f"  - {sort.get('field_name')} {desc}")

                # 分组
                if view.get('group'):
                    lines.append(f"- **分组**: 按 `{view['group'].get('field_name')}` 分组")

                lines.append("")

        return "\n".join(lines)


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="飞书多维表格视图配置工具")
    parser.add_argument("--app-token", "-a", help="Base app_token")
    parser.add_argument("--table-id", "-t", help="数据表 ID")
    parser.add_argument("--output", "-o", default="workflows/view_config.json", help="视图配置输出路径")
    parser.add_argument("--generate", "-g", action="store_true", help="生成预设视图配置")
    parser.add_argument("--export-md", "-m", help="导出视图配置为 Markdown")

    args = parser.parse_args()

    manager = BitableViewManager()

    try:
        if args.generate:
            if not args.app_token:
                print("错误: 生成模式需要指定 --app-token")
                sys.exit(1)

            # 生成完整视图配置
            views = manager.generate_full_project_views(args.app_token)

            # 保存配置
            all_views_list = []
            for table_views in views.values():
                all_views_list.extend(table_views)

            manager.save_view_config(all_views_list, args.output)
            print(f"\n✓ 已生成 {len(all_views_list)} 个视图配置")

            # 导出 Markdown
            if args.export_md:
                md_content = manager.export_views_to_markdown(views)
                with open(args.export_md, 'w', encoding='utf-8') as f:
                    f.write(md_content)
                print(f"✓ Markdown 文档已导出到: {args.export_md}")

        else:
            # 演示生成示例视图配置
            generator = ViewConfigGenerator()

            # 任务视图示例
            task_views = [
                generator.generate_view_config(
                    view_name="我的任务",
                    view_type="grid",
                    filter_config=generator.generate_filter_config([
                        generator.generate_filter_condition("负责人", "contains", "当前用户")
                    ]),
                    sort_config=[
                        generator.generate_sort_config("优先级", descending=True),
                        generator.generate_sort_config("截止日期")
                    ]
                ),
                generator.generate_view_config(
                    view_name="看板视图",
                    view_type="kanban",
                    kanban_config=generator.generate_kanban_config(
                        group_field="状态",
                        card_fields=["任务名称", "负责人", "截止日期"]
                    )
                )
            ]

            print("\n示例视图配置：")
            print(json.dumps(task_views, ensure_ascii=False, indent=2))

    except Exception as e:
        logger.error(f"执行失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
