"""
飞书表格字段类型映射器
处理不同飞书表格字段类型与业务字段类型的转换逻辑
"""

import json
import os
from typing import Any, Dict, List, Optional
from functools import wraps
from cozeloop.decorator import observe


class FieldTypeMapper:
    """
    字段类型映射器类
    提供飞书字段类型与业务类型之间的双向转换功能
    """

    # 飞书官方字段类型定义
    FIELD_TYPE_TEXT = 1           # 文本
    FIELD_TYPE_NUMBER = 2         # 数字
    FIELD_TYPE_SINGLE_SELECT = 3  # 单选
    FIELD_TYPE_MULTI_SELECT = 4   # 多选
    FIELD_TYPE_DATE = 5           # 日期
    FIELD_TYPE_CHECKBOX = 7       # 复选框
    FIELD_TYPE_DATETIME = 11      # 日期时间
    FIELD_TYPE_ATTACHMENT = 13    # 附件
    FIELD_TYPE_LINK = 15          # 关联记录
    FIELD_TYPE_FORMULA = 17       # 公式
    FIELD_TYPE_LOOKUP = 18        # LookUP
    FIELD_TYPE_REFERENCE = 19     # 查找引用
    FIELD_TYPE_USER = 20          # 用户
    FIELD_TYPE_PHONE = 1003      # 电话号码

    # 业务类型映射表
    BUSINESS_TYPE_MAPPING = {
        "string": FIELD_TYPE_TEXT,
        "text": FIELD_TYPE_TEXT,
        "description": FIELD_TYPE_TEXT,
        "title": FIELD_TYPE_TEXT,
        "name": FIELD_TYPE_TEXT,
        "email": FIELD_TYPE_TEXT,
        "url": FIELD_TYPE_TEXT,
        "integer": FIELD_TYPE_NUMBER,
        "number": FIELD_TYPE_NUMBER,
        "decimal": FIELD_TYPE_NUMBER,
        "currency": FIELD_TYPE_NUMBER,
        "percentage": FIELD_TYPE_NUMBER,
        "duration": FIELD_TYPE_NUMBER,
        "single_select": FIELD_TYPE_SINGLE_SELECT,
        "select": FIELD_TYPE_SINGLE_SELECT,
        "status": FIELD_TYPE_SINGLE_SELECT,
        "priority": FIELD_TYPE_SINGLE_SELECT,
        "multi_select": FIELD_TYPE_MULTI_SELECT,
        "tags": FIELD_TYPE_MULTI_SELECT,
        "labels": FIELD_TYPE_MULTI_SELECT,
        "date": FIELD_TYPE_DATE,
        "time": FIELD_TYPE_DATE,
        "date_time": FIELD_TYPE_DATETIME,
        "timestamp": FIELD_TYPE_DATETIME,
        "boolean": FIELD_TYPE_CHECKBOX,
        "checkbox": FIELD_TYPE_CHECKBOX,
        "flag": FIELD_TYPE_CHECKBOX,
        "file": FIELD_TYPE_ATTACHMENT,
        "attachment": FIELD_TYPE_ATTACHMENT,
        "image": FIELD_TYPE_ATTACHMENT,
        "reference": FIELD_TYPE_LINK,
        "link": FIELD_TYPE_LINK,
        "relation": FIELD_TYPE_LINK,
        "user": FIELD_TYPE_USER,
        "assignee": FIELD_TYPE_USER,
        "owner": FIELD_TYPE_USER,
        "phone": FIELD_TYPE_PHONE,
        "mobile": FIELD_TYPE_PHONE,
        "tel": FIELD_TYPE_PHONE
    }

    # 飞书类型到业务类型反向映射
    FEISHU_TYPE_TO_BUSINESS = {
        str(FIELD_TYPE_TEXT): "string",
        str(FIELD_TYPE_NUMBER): "number",
        str(FIELD_TYPE_SINGLE_SELECT): "single_select",
        str(FIELD_TYPE_MULTI_SELECT): "multi_select",
        str(FIELD_TYPE_DATE): "date",
        str(FIELD_TYPE_CHECKBOX): "boolean",
        str(FIELD_TYPE_DATETIME): "date_time",
        str(FIELD_TYPE_ATTACHMENT): "attachment",
        str(FIELD_TYPE_LINK): "reference",
        str(FIELD_TYPE_USER): "user",
        str(FIELD_TYPE_PHONE): "phone"
    }

    def __init__(self, config_path: Optional[str] = None):
        """
        初始化字段类型映射器

        Args:
            config_path: 配置文件路径，默认为 data/table_field_config.json
        """
        self.config_path = config_path or self._get_default_config_path()
        self.config = self._load_config()

    def _get_default_config_path(self) -> str:
        """获取默认配置文件路径"""
        workspace_path = os.getenv("COZE_WORKSPACE_PATH", "/workspace/projects")
        return os.path.join(workspace_path, "data/table_field_config.json")

    def _get_data_collection_config_path(self) -> str:
        """获取数据采集配置文件路径"""
        workspace_path = os.getenv("COZE_WORKSPACE_PATH", "/workspace/projects")
        return os.path.join(workspace_path, "data/data_collection_config.json")

    def _load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"field_types": {}, "field_definitions": {}}
        except json.JSONDecodeError as e:
            raise ValueError(f"配置文件格式错误: {e}")

    @observe
    def get_feishu_type(self, business_type: str) -> int:
        """
        将业务类型转换为飞书字段类型

        Args:
            business_type: 业务字段类型（如 'string', 'number', 'date' 等）

        Returns:
            飞书字段类型码

        Raises:
            ValueError: 当业务类型不支持时抛出
        """
        business_type_lower = business_type.lower().strip()

        if business_type_lower in self.BUSINESS_TYPE_MAPPING:
            return self.BUSINESS_TYPE_MAPPING[business_type_lower]

        # 尝试从配置文件中查找
        type_mapping = self.config.get("field_types", {})
        for feishu_code, type_name in type_mapping.items():
            if type_name.lower() == business_type_lower:
                return int(feishu_code)

        raise ValueError(f"不支持的业务字段类型: {business_type}")

    @observe
    def get_business_type(self, feishu_type: int) -> str:
        """
        将飞书字段类型转换为业务类型

        Args:
            feishu_type: 飞书字段类型码

        Returns:
            业务字段类型字符串
        """
        return self.FEISHU_TYPE_TO_BUSINESS.get(str(feishu_type), "unknown")

    @observe
    def get_field_type_name(self, feishu_type: int) -> str:
        """
        获取飞书字段类型名称

        Args:
            feishu_type: 飞书字段类型码

        Returns:
            类型名称字符串
        """
        type_mapping = self.config.get("field_types", {})
        return type_mapping.get(str(feishu_type), "未知类型")

    @observe
    def build_field_definition(
        self,
        field_name: str,
        business_type: str,
        required: bool = False,
        description: str = "",
        property_config: Optional[Dict[str, Any]] = None,
        default_value: Any = None
    ) -> Dict[str, Any]:
        """
        构建飞书字段定义对象

        Args:
            field_name: 字段名称
            business_type: 业务字段类型
            required: 是否必填
            description: 字段描述
            property_config: 字段属性配置（如选项列表等）
            default_value: 默认值

        Returns:
            飞书API所需的字段定义字典
        """
        try:
            feishu_type = self.get_feishu_type(business_type)
        except ValueError:
            feishu_type = self.FIELD_TYPE_TEXT

        field_def = {
            "field_name": field_name,
            "type": feishu_type
        }

        if description:
            field_def["description"] = description

        if property_config:
            field_def["property"] = property_config

        return field_def

    @observe
    def get_field_definitions_from_config(self, table_key: str) -> List[Dict[str, Any]]:
        """
        从配置文件中获取指定表格的字段定义

        Args:
            table_key: 表格配置键名（如 'task_table', 'project_table'）

        Returns:
            字段定义列表
        """
        table_config = self.config.get("field_definitions", {}).get(table_key, {})
        fields = table_config.get("fields", [])

        result = []
        for field in fields:
            field_def = {
                "field_name": field.get("name", ""),
                "type": field.get("type", self.FIELD_TYPE_TEXT),
                "description": field.get("description", "")
            }

            if "property" in field:
                field_def["property"] = field["property"]

            result.append(field_def)

        return result

    @observe
    def convert_value_to_feishu(self, value: Any, business_type: str) -> Any:
        """
        将业务值转换为飞书表格可接受的值格式

        Args:
            value: 业务值
            business_type: 业务类型

        Returns:
            转换后的值
        """
        if value is None:
            return None

        business_type_lower = business_type.lower()

        # 日期类型转换（飞书使用时间戳毫秒）
        if business_type_lower in ["date", "date_time"]:
            if isinstance(value, str):
                from datetime import datetime
                try:
                    if "T" in value:
                        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
                    else:
                        dt = datetime.strptime(value, "%Y-%m-%d")
                    return int(dt.timestamp() * 1000)
                except ValueError:
                    return value
            return value

        # 复选框类型转换
        elif business_type_lower in ["boolean", "checkbox"]:
            if isinstance(value, bool):
                return value
            if isinstance(value, str):
                return value.lower() in ["true", "1", "yes", "是"]
            return bool(value)

        # 数字类型转换
        elif business_type_lower in ["number", "integer", "decimal", "percentage", "currency"]:
            try:
                return float(value) if "." in str(value) else int(value)
            except (ValueError, TypeError):
                return value

        # 用户类型转换
        elif business_type_lower in ["user", "assignee", "owner"]:
            if isinstance(value, dict):
                return value.get("user_id") or value.get("open_id")
            return value

        # 多选类型转换
        elif business_type_lower in ["multi_select", "tags", "labels"]:
            if isinstance(value, list):
                return value
            if isinstance(value, str):
                return [v.strip() for v in value.split(",")]
            return [value]

        # 单选类型转换
        elif business_type_lower in ["single_select", "select", "status", "priority"]:
            if isinstance(value, str):
                return value.strip()
            return value

        # 默认返回原值
        return value

    @observe
    def validate_field_value(self, value: Any, field_config: Dict[str, Any]) -> tuple[bool, str]:
        """
        验证字段值是否符合配置规则

        Args:
            value: 字段值
            field_config: 字段配置

        Returns:
            (是否有效, 错误信息)
        """
        field_name = field_config.get("name", "未知字段")
        required = field_config.get("required", False)
        business_type = field_config.get("type_name", "string")

        # 必填检查
        if required and (value is None or value == ""):
            return False, f"{field_name}为必填字段"

        # 空值不需要进一步验证
        if value is None or value == "":
            return True, ""

        # 类型检查
        business_type_lower = business_type.lower()

        if business_type_lower in ["number", "integer", "decimal", "currency", "percentage"]:
            try:
                float(value)
            except (ValueError, TypeError):
                return False, f"{field_name}必须是数字"

        elif business_type_lower in ["date", "date_time"]:
            if not isinstance(value, (int, str)):
                return False, f"{field_name}必须是日期格式"

        elif business_type_lower == "boolean":
            if not isinstance(value, bool) and value not in [True, False, "true", "false", "0", "1"]:
                return False, f"{field_name}必须是布尔值"

        return True, ""

    @observe
    def get_data_collection_table_config(self, table_key: str) -> Optional[Dict[str, Any]]:
        """
        获取数据采集配置表中指定表格的配置

        Args:
            table_key: 表格配置键名（如 'data_sources', 'raw_contents' 等）

        Returns:
            表格配置字典
        """
        try:
            config_path = self._get_data_collection_config_path()
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            return config.get(table_key)
        except (FileNotFoundError, json.JSONDecodeError):
            return None

    @observe
    def get_data_collection_field_definitions(self, table_key: str) -> List[Dict[str, Any]]:
        """
        获取数据采集配置表中指定表格的字段定义

        Args:
            table_key: 表格配置键名

        Returns:
            字段定义列表
        """
        table_config = self.get_data_collection_table_config(table_key)
        if not table_config:
            return []

        fields = table_config.get("fields", [])
        result = []

        for field in fields:
            field_def = {
                "field_name": field.get("field_name", field.get("name", "")),
                "type": field.get("type", self.FIELD_TYPE_TEXT),
                "description": field.get("description", "")
            }

            if "property" in field:
                field_def["property"] = field["property"]

            if "required" in field:
                field_def["required"] = field["required"]

            result.append(field_def)

        return result

    @observe
    def get_all_data_collection_tables(self) -> List[str]:
        """
        获取所有数据采集表格的配置键名

        Returns:
            表格键名列表
        """
        try:
            config_path = self._get_data_collection_config_path()
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            return list(config.keys())
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    @observe
    def extract_keywords_from_text(self, text: str, top_n: int = 10) -> List[Dict[str, Any]]:
        """
        从文本中提取关键词（基础实现）

        Args:
            text: 输入文本
            top_n: 返回的关键词数量

        Returns:
            关键词列表
        """
        # 简单的关键词提取逻辑（实际项目中应调用LLM）
        if not text:
            return []

        # 去除标点符号和空格
        import re
        words = re.findall(r'[\u4e00-\u9fa5a-zA-Z0-9]+', text)

        # 统计词频
        word_freq = {}
        for word in words:
            word = word.lower()
            if len(word) >= 2:
                word_freq[word] = word_freq.get(word, 0) + 1

        # 按频率排序
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)

        # 返回前N个
        keywords = []
        for i, (word, freq) in enumerate(sorted_words[:top_n]):
            keywords.append({
                "keyword_text": word,
                "confidence_score": round(freq / max(word_freq.values()), 2) if word_freq else 0,
                "weight": round(freq / len(words) * 100, 2) if words else 0,
                "rank": i + 1
            })

        return keywords

    @observe
    def match_routing_rules(self, text: str, rules: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        匹配内容分流规则

        Args:
            text: 输入文本
            rules: 规则列表

        Returns:
            匹配的规则或None
        """
        if not rules or not text:
            return None

        import re
        matched_rules = []

        for rule in rules:
            if not rule.get("is_active", True):
                continue

            patterns = rule.get("keyword_patterns", [])
            if not patterns:
                continue

            # 检查是否匹配任一模式
            matched = False
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    matched = True
                    break

            if matched:
                matched_rules.append(rule)

        # 按优先级排序返回第一个
        if matched_rules:
            matched_rules.sort(key=lambda x: x.get("priority", 999))
            return matched_rules[0]

        return None


# 单例模式实例
_field_mapper_instance: Optional[FieldTypeMapper] = None


def get_field_mapper(config_path: Optional[str] = None) -> FieldTypeMapper:
    """
    获取字段映射器单例实例

    Args:
        config_path: 可选的配置文件路径

    Returns:
        FieldTypeMapper 实例
    """
    global _field_mapper_instance
    if _field_mapper_instance is None:
        _field_mapper_instance = FieldTypeMapper(config_path)
    return _field_mapper_instance


if __name__ == "__main__":
    # 测试代码
    mapper = get_field_mapper()

    # 测试类型转换
    print("测试业务类型转飞书类型:")
    print(f"  string -> {mapper.get_feishu_type('string')}")
    print(f"  number -> {mapper.get_feishu_type('number')}")
    print(f"  date -> {mapper.get_feishu_type('date')}")
    print(f"  user -> {mapper.get_feishu_type('user')}")

    # 测试构建字段定义
    print("\n测试构建字段定义:")
    field = mapper.build_field_definition(
        field_name="测试字段",
        business_type="string",
        required=True,
        description="这是一个测试字段"
    )
    print(f"  {field}")
