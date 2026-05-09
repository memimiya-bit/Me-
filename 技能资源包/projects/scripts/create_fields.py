#!/usr/bin/env python3
"""
飞书多维表格字段创建脚本
根据配置文件批量创建表格字段，支持类型映射和默认值设置
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


class BitableFieldManager:
    """
    飞书多维表格字段管理器
    提供字段的增删改查功能
    """

    def __init__(
        self,
        api: Optional[FeishuBitableAPI] = None,
        field_mapper: Optional[FieldTypeMapper] = None
    ):
        """
        初始化字段管理器

        Args:
            api: 飞书API实例
            field_mapper: 字段映射器实例
        """
        self.api = api or get_feishu_api()
        self.field_mapper = field_mapper or get_field_mapper()

    def list_fields_with_details(self, app_token: str, table_id: str) -> List[Dict[str, Any]]:
        """
        列出表格字段详情

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID

        Returns:
            字段详情列表
        """
        fields = self.api.list_fields(app_token, table_id)

        print(f"\n表格: {table_id}")
        print("=" * 100)
        print(f"{'字段名称':<20} {'类型':<12} {'类型码':<8} {'必填':<6} {'描述':<30}")
        print("-" * 100)

        for field in fields:
            field_type = field.get("type", 0)
            type_name = self.field_mapper.get_field_type_name(field_type)
            description = field.get("description", "")[:28]

            print(f"{field.get('field_name', ''):<20} {type_name:<12} {field_type:<8} {'是' if field.get('required') else '否':<6} {description:<30}")

        print("=" * 100)
        return fields

    def add_field_from_config(
        self,
        app_token: str,
        table_id: str,
        field_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        根据配置添加单个字段

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            field_config: 字段配置

        Returns:
            创建的字段信息
        """
        field_name = field_config.get("name", field_config.get("field_name", ""))
        field_type = field_config.get("type", 1)
        description = field_config.get("description", "")
        property_config = field_config.get("property")

        logger.info(f"添加字段: {field_name} (类型: {field_type})")

        result = self.api.add_field(
            app_token=app_token,
            table_id=table_id,
            field_name=field_name,
            field_type=field_type,
            description=description,
            property_config=property_config
        )

        logger.info(f"✓ 字段 {field_name} 添加成功，field_id: {result.get('field_id')}")
        return result

    def batch_add_fields_from_config(
        self,
        app_token: str,
        table_id: str,
        fields_config: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        批量添加字段

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            fields_config: 字段配置列表

        Returns:
            成功创建的字段列表
        """
        logger.info(f"开始批量添加字段，共 {len(fields_config)} 个")

        added_fields = []
        failed_fields = []

        for i, field_cfg in enumerate(fields_config):
            try:
                field_name = field_cfg.get("name", field_cfg.get("field_name", f"字段{i+1}"))
                result = self.add_field_from_config(app_token, table_id, field_cfg)
                added_fields.append(result)
            except Exception as e:
                logger.error(f"✗ 字段 {field_cfg.get('name')} 添加失败: {e}")
                failed_fields.append({
                    "name": field_cfg.get("name"),
                    "error": str(e)
                })

        # 输出结果摘要
        print("\n" + "=" * 60)
        print(f"字段添加完成")
        print(f"✓ 成功: {len(added_fields)} 个")
        print(f"✗ 失败: {len(failed_fields)} 个")
        if failed_fields:
            print("\n失败字段列表:")
            for f in failed_fields:
                print(f"  - {f['name']}: {f['error']}")
        print("=" * 60)

        return added_fields

    def sync_fields_from_config(
        self,
        app_token: str,
        table_id: str,
        config_path: str,
        table_key: str,
        sync_mode: str = "add_only"
    ) -> Dict[str, Any]:
        """
        同步字段配置到表格

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            config_path: 配置文件路径
            table_key: 表格配置键名
            sync_mode: 同步模式 ('add_only' | 'full_sync')

        Returns:
            同步结果
        """
        logger.info(f"开始同步字段配置: {table_key}")

        # 加载配置
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)

        table_config = config.get("field_definitions", {}).get(table_key, {})
        fields_config = table_config.get("fields", [])

        # 获取当前字段
        current_fields = self.api.list_fields(app_token, table_id)
        current_field_names = {f.get("field_name") for f in current_fields}
        current_field_map = {f.get("field_name"): f for f in current_fields}

        # 分析需要添加/更新的字段
        to_add = []
        to_update = []

        for field_cfg in fields_config:
            field_name = field_cfg.get("name")
            if field_name not in current_field_names:
                to_add.append(field_cfg)
            elif sync_mode == "full_sync":
                # 全量同步模式，比较字段配置
                existing_field = current_field_map[field_name]
                existing_type = existing_field.get("type")
                new_type = field_cfg.get("type")
                if existing_type != new_type:
                    to_update.append({
                        "field_id": existing_field.get("field_id"),
                        "new_config": field_cfg
                    })

        # 执行添加
        added = []
        if to_add:
            logger.info(f"需要添加 {len(to_add)} 个字段")
            added = self.batch_add_fields_from_config(app_token, table_id, to_add)

        # 执行更新
        updated = []
        if to_update:
            logger.info(f"需要更新 {len(to_update)} 个字段")
            for update in to_update:
                try:
                    result = self.update_field(
                        app_token,
                        table_id,
                        update["field_id"],
                        update["new_config"]
                    )
                    updated.append(result)
                except Exception as e:
                    logger.error(f"更新字段失败: {e}")

        return {
            "added": added,
            "updated": updated,
            "skipped": len(fields_config) - len(to_add) - len(to_update)
        }

    def update_field(
        self,
        app_token: str,
        table_id: str,
        field_id: str,
        field_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        更新字段

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            field_id: 字段 ID
            field_config: 新的字段配置

        Returns:
            更新后的字段信息
        """
        field_def = self.field_mapper.build_field_definition(
            field_name=field_config.get("name", ""),
            business_type=self.field_mapper.get_business_type(field_config.get("type", 1)),
            description=field_config.get("description", ""),
            property_config=field_config.get("property")
        )

        logger.info(f"更新字段: {field_id}")
        result = self.api.update_field(app_token, table_id, field_id, field_def)
        logger.info(f"✓ 字段更新成功")
        return result

    def delete_field(self, app_token: str, table_id: str, field_id: str) -> bool:
        """
        删除字段

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            field_id: 字段 ID

        Returns:
            是否删除成功
        """
        logger.info(f"删除字段: {field_id}")
        result = self.api.delete_field(app_token, table_id, field_id)
        if result:
            logger.info(f"✓ 字段删除成功")
        else:
            logger.error(f"✗ 字段删除失败")
        return result

    def batch_delete_fields(
        self,
        app_token: str,
        table_id: str,
        field_names: List[str]
    ) -> Dict[str, Any]:
        """
        批量删除字段

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            field_names: 要删除的字段名称列表

        Returns:
            删除结果
        """
        # 获取当前字段
        current_fields = self.api.list_fields(app_token, table_id)
        field_map = {f.get("field_name"): f.get("field_id") for f in current_fields}

        deleted = []
        failed = []

        for field_name in field_names:
            field_id = field_map.get(field_name)
            if field_id:
                try:
                    if self.delete_field(app_token, table_id, field_id):
                        deleted.append(field_name)
                    else:
                        failed.append(field_name)
                except Exception as e:
                    logger.error(f"删除字段 {field_name} 失败: {e}")
                    failed.append(field_name)
            else:
                logger.warning(f"字段不存在: {field_name}")
                failed.append(field_name)

        return {
            "deleted": deleted,
            "failed": failed
        }

    def create_select_options(
        self,
        app_token: str,
        table_id: str,
        field_id: str,
        options: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        为选择类型字段创建选项

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            field_id: 字段 ID
            options: 选项列表 [{"name": "选项名", "color": 0}]

        Returns:
            更新结果
        """
        # 获取当前字段
        fields = self.api.list_fields(app_token, table_id)
        field = next((f for f in fields if f.get("field_id") == field_id), None)

        if not field:
            raise ValueError(f"字段不存在: {field_id}")

        # 更新字段属性
        field_def = {
            "field_name": field.get("field_name"),
            "type": field.get("type"),
            "property": {
                "options": options
            }
        }

        return self.api.update_field(app_token, table_id, field_id, field_def)


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="飞书多维表格字段管理工具")
    parser.add_argument("--app-token", "-a", required=True, help="Base app_token")
    parser.add_argument("--table-id", "-t", required=True, help="数据表 ID")
    parser.add_argument("--config", "-c", default="config/fields_definition.json", help="字段配置文件路径")
    parser.add_argument("--table-key", "-k", help="表格配置键名（如 task_table）")
    parser.add_argument("--list", "-l", action="store_true", help="列出表格字段")
    parser.add_argument("--sync", "-s", action="store_true", help="同步字段配置")
    parser.add_argument("--sync-mode", "-m", choices=["add_only", "full_sync"], default="add_only", help="同步模式")

    args = parser.parse_args()

    manager = BitableFieldManager()

    try:
        if args.list:
            # 列出字段
            manager.list_fields_with_details(args.app_token, args.table_id)

        elif args.sync and args.table_key:
            # 同步字段配置
            result = manager.sync_fields_from_config(
                app_token=args.app_token,
                table_id=args.table_id,
                config_path=args.config,
                table_key=args.table_key,
                sync_mode=args.sync_mode
            )
            print("\n✓ 字段同步完成！")
            print(f"  新增: {len(result['added'])} 个")
            print(f"  更新: {len(result['updated'])} 个")
            print(f"  跳过: {result['skipped']} 个")

        else:
            parser.print_help()

    except Exception as e:
        logger.error(f"执行失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
