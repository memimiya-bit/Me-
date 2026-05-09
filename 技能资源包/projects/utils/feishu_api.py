"""
飞书多维表格（Bitable）API 封装工具类
提供表格操作、字段管理、视图配置和消息推送等功能
"""

import json
import os
import time
import logging
from typing import Any, Dict, List, Optional, Union
from functools import wraps

import requests
from cozeloop.decorator import observe
from coze_workload_identity import Client

# 配置日志
logger = logging.getLogger(__name__)


def retry_on_rate_limit(max_retries: int = 3, delay: float = 1.0):
    """
    限流重试装饰器

    Args:
        max_retries: 最大重试次数
        delay: 重试延迟（秒）
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if "429" in str(e) or "rate limit" in str(e).lower():
                        if attempt < max_retries - 1:
                            wait_time = delay * (2 ** attempt)
                            logger.warning(f"触发限流，等待 {wait_time} 秒后重试...")
                            time.sleep(wait_time)
                        else:
                            raise Exception(f"API 调用超过最大重试次数: {e}")
                    else:
                        raise e
            return None
        return wrapper
    return decorator


def require_token(func):
    """访问令牌装饰器"""
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        if not hasattr(self, '_access_token') or not self._access_token:
            self._refresh_token()
        return func(self, *args, **kwargs)
    return wrapper


class FeishuAPIError(Exception):
    """飞书API异常"""
    def __init__(self, code: int, msg: str, data: Any = None):
        self.code = code
        self.msg = msg
        self.data = data
        super().__init__(f"Feishu API Error [{code}]: {msg}")


class FeishuBitableAPI:
    """
    飞书多维表格（Bitable）API 客户端
    提供表格、字段、视图、记录等操作接口
    """

    BASE_URL = "https://open.larkoffice.com/open-apis"

    def __init__(self, base_url: Optional[str] = None, timeout: int = 30):
        """
        初始化飞书API客户端

        Args:
            base_url: API基础URL
            timeout: 请求超时时间（秒）
        """
        self.base_url = base_url or self.BASE_URL
        self.timeout = timeout
        self._access_token: Optional[str] = None
        self._token_refresh_time: float = 0
        self._token_expiry: float = 7200  # 2小时
        self._refresh_token()

    def _refresh_token(self):
        """刷新访问令牌"""
        try:
            client = Client()
            self._access_token = client.get_integration_credential("integration-feishu-base")
            self._token_refresh_time = time.time()
            logger.info("飞书访问令牌刷新成功")
        except Exception as e:
            logger.error(f"获取飞书访问令牌失败: {e}")
            raise

    def _is_token_expired(self) -> bool:
        """检查令牌是否过期"""
        return time.time() - self._token_refresh_time > self._token_expiry

    @require_token
    @observe
    @retry_on_rate_limit(max_retries=3, delay=1.0)
    def _request(
        self,
        method: str,
        path: str,
        params: Optional[Dict] = None,
        json_data: Optional[Dict] = None,
        data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        发送API请求

        Args:
            method: HTTP方法
            path: API路径
            params: 查询参数
            json_data: JSON请求体
            data: 表单数据

        Returns:
            API响应数据

        Raises:
            FeishuAPIError: 当API返回错误时抛出
        """
        # 检查令牌是否需要刷新
        if self._is_token_expired():
            self._refresh_token()

        url = f"{self.base_url}{path}"
        headers = {
            "Authorization": f"Bearer {self._access_token}",
            "Content-Type": "application/json; charset=utf-8"
        }

        try:
            logger.debug(f"请求: {method} {url}")
            if json_data:
                logger.debug(f"请求体: {json.dumps(json_data, ensure_ascii=False)[:500]}")

            resp = requests.request(
                method,
                url,
                headers=headers,
                params=params,
                json=json_data,
                data=data,
                timeout=self.timeout
            )

            resp_data = resp.json()
            logger.debug(f"响应: {resp_data}")

            # 检查响应码
            if resp_data.get("code") != 0:
                error_code = resp_data.get("code")
                error_msg = resp_data.get("msg", "未知错误")
                raise FeishuAPIError(error_code, error_msg, resp_data.get("data"))

            return resp_data

        except requests.exceptions.RequestException as e:
            logger.error(f"API请求异常: {e}")
            raise FeishuAPIError(-1, f"网络请求失败: {e}")

    # ==================== Base (多维表格) 管理 ====================

    @observe
    def create_base(
        self,
        name: str,
        folder_token: Optional[str] = None,
        time_zone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        创建多维表格 Base

        Args:
            name: Base 名称
            folder_token: 归属文件夹 Token
            time_zone: 文档时区

        Returns:
            创建的 Base 信息，包含 app_token
        """
        body = {"name": name}
        if folder_token:
            body["folder_token"] = folder_token
        if time_zone:
            body["time_zone"] = time_zone

        result = self._request("POST", "/bitable/v1/apps", json_data=body)
        return result.get("data", {})

    @observe
    def get_base_info(self, app_token: str) -> Dict[str, Any]:
        """
        获取 Base 信息

        Args:
            app_token: Base 的唯一标识

        Returns:
            Base 元信息
        """
        result = self._request("GET", f"/bitable/v1/apps/{app_token}")
        return result.get("data", {})

    @observe
    def search_base(self, query: str, count: int = 20) -> List[Dict[str, Any]]:
        """
        搜索多维表格

        Args:
            query: 搜索关键字
            count: 返回数量

        Returns:
            匹配的 Base 列表
        """
        body = {
            "search_key": query,
            "count": count,
            "docs_types": ["bitable"]
        }
        result = self._request("POST", "/suite/docs-api/search/object", json_data=body)
        return result.get("data", {}).get("files", [])

    # ==================== 数据表管理 ====================

    @observe
    def list_tables(self, app_token: str, page_size: int = 100) -> List[Dict[str, Any]]:
        """
        列出 Base 下所有数据表

        Args:
            app_token: Base 的唯一标识
            page_size: 分页大小

        Returns:
            数据表列表
        """
        tables = []
        page_token = None

        while True:
            params = {"page_size": min(page_size, 100)}
            if page_token:
                params["page_token"] = page_token

            result = self._request("GET", f"/bitable/v1/apps/{app_token}/tables", params=params)
            data = result.get("data", {})
            tables.extend(data.get("items", []))

            if not data.get("has_more"):
                break
            page_token = data.get("page_token")

        return tables

    @observe
    def create_table(
        self,
        app_token: str,
        table_name: str,
        fields: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        创建数据表

        Args:
            app_token: Base 的唯一标识
            table_name: 表名称
            fields: 初始字段定义列表

        Returns:
            创建的数据表信息，包含 table_id
        """
        body = {"table_name": table_name}
        if fields:
            body["fields"] = fields

        result = self._request("POST", f"/bitable/v1/apps/{app_token}/tables", json_data=body)
        return result.get("data", {})

    @observe
    def delete_tables(self, app_token: str, table_ids: Union[List[str], str]) -> Dict[str, Any]:
        """
        批量删除数据表

        Args:
            app_token: Base 的唯一标识
            table_ids: 待删除的表 ID 列表

        Returns:
            删除结果
        """
        if isinstance(table_ids, str):
            table_ids = [table_ids]

        body = {"table_ids": table_ids}
        result = self._request("POST", f"/bitable/v1/apps/{app_token}/tables/batch_delete", json_data=body)
        return result.get("data", {})

    # ==================== 字段管理 ====================

    @observe
    def list_fields(
        self,
        app_token: str,
        table_id: str,
        page_size: int = 100
    ) -> List[Dict[str, Any]]:
        """
        列出数据表字段

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            page_size: 分页大小

        Returns:
            字段列表
        """
        fields = []
        page_token = None

        while True:
            params = {"page_size": min(page_size, 100)}
            if page_token:
                params["page_token"] = page_token

            result = self._request(
                "GET",
                f"/bitable/v1/apps/{app_token}/tables/{table_id}/fields",
                params=params
            )
            data = result.get("data", {})
            fields.extend(data.get("items", []))

            if not data.get("has_more"):
                break
            page_token = data.get("page_token")

        return fields

    @observe
    def add_field(
        self,
        app_token: str,
        table_id: str,
        field_name: str,
        field_type: int,
        description: Optional[str] = None,
        property_config: Optional[Dict] = None,
        client_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        新增字段

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            field_name: 字段名称
            field_type: 字段类型
            description: 字段描述
            property_config: 字段属性配置
            client_token: 幂等操作标识

        Returns:
            新增的字段对象
        """
        params = {}
        if client_token:
            params["client_token"] = client_token

        field_def = {
            "field_name": field_name,
            "type": field_type
        }

        if description:
            field_def["description"] = description

        if property_config:
            field_def["property"] = property_config

        result = self._request(
            "POST",
            f"/bitable/v1/apps/{app_token}/tables/{table_id}/fields",
            params=params,
            json_data=field_def
        )
        return result.get("data", {})

    @observe
    def batch_add_fields(
        self,
        app_token: str,
        table_id: str,
        fields: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        批量新增字段

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            fields: 字段定义列表

        Returns:
            成功创建的字段列表
        """
        added_fields = []

        for field in fields:
            try:
                result = self.add_field(
                    app_token=app_token,
                    table_id=table_id,
                    field_name=field.get("field_name", ""),
                    field_type=field.get("type", 1),
                    description=field.get("description"),
                    property_config=field.get("property")
                )
                added_fields.append(result)
            except FeishuAPIError as e:
                logger.warning(f"添加字段失败: {field.get('field_name')}, 错误: {e}")

        return added_fields

    @observe
    def update_field(
        self,
        app_token: str,
        table_id: str,
        field_id: str,
        field_def: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        更新字段

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            field_id: 字段 ID
            field_def: 字段定义（全量更新）

        Returns:
            更新后的字段对象
        """
        result = self._request(
            "PUT",
            f"/bitable/v1/apps/{app_token}/tables/{table_id}/fields/{field_id}",
            json_data=field_def
        )
        return result.get("data", {})

    @observe
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
        result = self._request(
            "DELETE",
            f"/bitable/v1/apps/{app_token}/tables/{table_id}/fields/{field_id}"
        )
        return result.get("code") == 0

    # ==================== 记录管理 ====================

    @observe
    def add_records(
        self,
        app_token: str,
        table_id: str,
        records: List[Dict[str, Any]],
        user_id_type: str = "open_id"
    ) -> List[Dict[str, Any]]:
        """
        批量新增记录

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            records: 记录列表，每条格式: {"fields": {...}}
            user_id_type: 用户 ID 类型

        Returns:
            创建成功的记录列表
        """
        params = {"user_id_type": user_id_type}
        body = {"records": records}

        result = self._request(
            "POST",
            f"/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_create",
            params=params,
            json_data=body
        )
        return result.get("data", {}).get("records", [])

    @observe
    def update_records(
        self,
        app_token: str,
        table_id: str,
        records: List[Dict[str, Any]],
        user_id_type: str = "open_id"
    ) -> List[Dict[str, Any]]:
        """
        批量更新记录

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            records: 记录列表，每条需包含 record_id
            user_id_type: 用户 ID 类型

        Returns:
            更新后的记录列表
        """
        params = {"user_id_type": user_id_type}
        body = {"records": records}

        result = self._request(
            "POST",
            f"/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_update",
            params=params,
            json_data=body
        )
        return result.get("data", {}).get("records", [])

    @observe
    def batch_get_records(
        self,
        app_token: str,
        table_id: str,
        record_ids: Union[List[str], str],
        user_id_type: str = "open_id"
    ) -> List[Dict[str, Any]]:
        """
        批量获取记录

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            record_ids: 记录 ID 列表
            user_id_type: 用户 ID 类型

        Returns:
            记录列表
        """
        if isinstance(record_ids, str):
            record_ids = [record_ids]

        params = {"user_id_type": user_id_type}
        body = {"record_ids": record_ids}

        result = self._request(
            "POST",
            f"/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_get",
            params=params,
            json_data=body
        )
        return result.get("data", {}).get("records", [])

    @observe
    def search_records(
        self,
        app_token: str,
        table_id: str,
        filter_config: Optional[Dict] = None,
        sort_config: Optional[List[Dict]] = None,
        field_names: Optional[List[str]] = None,
        page_size: int = 100
    ) -> List[Dict[str, Any]]:
        """
        条件查询记录

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            filter_config: 筛选条件配置
            sort_config: 排序条件配置
            field_names: 返回的字段列表
            page_size: 每页大小

        Returns:
            匹配的记录列表
        """
        records = []
        page_token = None

        while True:
            params = {"page_size": min(page_size, 500)}
            if page_token:
                params["page_token"] = page_token

            body = {}
            if filter_config:
                body["filter"] = filter_config
            if sort_config:
                body["sort"] = sort_config
            if field_names:
                body["field_names"] = field_names

            result = self._request(
                "POST",
                f"/bitable/v1/apps/{app_token}/tables/{table_id}/records/search",
                params=params,
                json_data=body if body else None
            )
            data = result.get("data", {})
            records.extend(data.get("items", []))

            if not data.get("has_more"):
                break
            page_token = data.get("page_token")

        return records

    @observe
    def delete_records(
        self,
        app_token: str,
        table_id: str,
        record_ids: Union[List[str], str]
    ) -> bool:
        """
        批量删除记录

        Args:
            app_token: Base 的唯一标识
            table_id: 数据表 ID
            record_ids: 待删除的记录 ID 列表

        Returns:
            是否删除成功
        """
        if isinstance(record_ids, str):
            record_ids = [record_ids]

        body = {"record_ids": record_ids}
        result = self._request(
            "POST",
            f"/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_delete",
            json_data=body
        )
        return result.get("code") == 0


class FeishuMessageAPI:
    """
    飞书消息推送 API 客户端
    通过 webhook 发送消息
    """

    def __init__(self):
        """初始化消息客户端"""
        self._webhook_url: Optional[str] = None
        self._client = Client()

    def _get_webhook_url(self) -> str:
        """获取 webhook URL"""
        if not self._webhook_url:
            credential = self._client.get_integration_credential("integration-feishu-message")
            self._webhook_url = json.loads(credential).get("webhook_url")
        return self._webhook_url

    @observe
    def send_text_message(self, text: str) -> Dict[str, Any]:
        """
        发送文本消息

        Args:
            text: 消息文本

        Returns:
            发送结果
        """
        payload = {
            "msg_type": "text",
            "content": {"text": text}
        }
        return self._send(payload)

    @observe
    def send_at_message(self, text: str, user_ids: List[str]) -> Dict[str, Any]:
        """
        发送 @ 消息

        Args:
            text: 消息文本
            user_ids: 被 @ 的用户 ID 列表

        Returns:
            发送结果
        """
        at_text = " ".join([f'<at user_id="{uid}">@{uid}</at>' for uid in user_ids])
        full_text = f"{text} {at_text}"

        payload = {
            "msg_type": "text",
            "content": {"text": full_text}
        }
        return self._send(payload)

    @observe
    def send_rich_text(self, title: str, content: List[List[Dict]]) -> Dict[str, Any]:
        """
        发送富文本消息

        Args:
            title: 标题
            content: 内容（支持 text, a, at 标签）

        Returns:
            发送结果
        """
        payload = {
            "msg_type": "post",
            "content": {
                "post": {
                    "zh_cn": {
                        "title": title,
                        "content": content
                    }
                }
            }
        }
        return self._send(payload)

    @observe
    def send_card(
        self,
        title: str,
        content: str,
        actions: Optional[List[Dict]] = None,
        header_color: str = "blue"
    ) -> Dict[str, Any]:
        """
        发送交互式卡片

        Args:
            title: 卡片标题
            content: 卡片内容
            actions: 操作按钮列表
            header_color: 头部颜色

        Returns:
            发送结果
        """
        elements = [{
            "tag": "div",
            "text": {
                "tag": "plain_text",
                "content": content
            }
        }]

        if actions:
            elements.append({"tag": "action", "actions": actions})

        payload = {
            "msg_type": "interactive",
            "card": {
                "header": {
                    "title": {
                        "tag": "plain_text",
                        "content": title
                    },
                    "template": header_color
                },
                "elements": elements
            }
        }
        return self._send(payload)

    def _send(self, payload: Dict) -> Dict[str, Any]:
        """发送消息"""
        try:
            response = requests.post(
                self._get_webhook_url(),
                json=payload,
                timeout=10
            )
            result = response.json()
            logger.info(f"消息发送结果: {result}")
            return result
        except Exception as e:
            logger.error(f"消息发送失败: {e}")
            raise


# ==================== 工厂函数 ====================

def get_feishu_api() -> FeishuBitableAPI:
    """获取飞书多维表格 API 实例"""
    return FeishuBitableAPI()


def get_feishu_message_api() -> FeishuMessageAPI:
    """获取飞书消息 API 实例"""
    return FeishuMessageAPI()


if __name__ == "__main__":
    # 测试代码
    print("飞书API工具类测试")

    # 初始化API客户端
    bitable_api = get_feishu_api()
    print("✓ 飞书多维表格API客户端初始化成功")

    # 初始化消息客户端
    message_api = get_feishu_message_api()
    print("✓ 飞书消息API客户端初始化成功")
