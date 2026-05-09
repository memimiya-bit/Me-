#!/usr/bin/env python3
"""
飞书多维表格数据写入脚本
功能：将结构化数据写入指定的飞书多维表格
"""

import os
import json
import argparse
from coze_workload_identity import requests  # 铁律：必须从此包导入


def get_feishu_access_token():
    """获取飞书访问令牌"""
    skill_id = "keyword_info_processor"  # 实际skill_id待定
    credential = os.getenv("COZE_FEISHU_BITABLE_keyword_info_processor")
    if not credential:
        raise ValueError("缺少飞书多维表格凭证配置，请检查环境变量")
    return credential


def batch_create_records(app_token, table_id, records, access_token):
    """
    批量创建记录

    API: POST /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_create
    """
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_create"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    payload = {
        "records": records
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        if response.status_code >= 400:
            raise Exception(f"HTTP请求失败: {response.status_code}, {response.text}")

        data = response.json()

        # 飞书API错误判断
        if data.get("code") != 0:
            raise Exception(f"飞书API错误: code={data.get('code')}, msg={data.get('msg')}")

        return {
            "status": "success",
            "record_ids": [r.get("record_id") for r in data.get("data", {}).get("records", [])],
            "total": len(data.get("data", {}).get("records", []))
        }

    except requests.exceptions.RequestException as e:
        raise Exception(f"请求失败: {str(e)}")


def check_record_exists(app_token, table_id, field_name, field_value, access_token):
    """
    检查记录是否存在（用于去重）
    """
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    params = {
        "field_names": field_name,
        "filter": f"AND([{field_name}].[\"=\"].\"{field_value}\")"
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)
        if response.status_code >= 400:
            return None

        data = response.json()
        if data.get("code") == 0:
            records = data.get("data", {}).get("items", [])
            return records[0].get("record_id") if records else None

        return None

    except requests.exceptions.RequestException:
        return None


def update_record(app_token, table_id, record_id, fields, access_token):
    """
    更新已有记录
    """
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    payload = {
        "fields": fields
    }

    try:
        response = requests.put(url, headers=headers, json=payload, timeout=30)
        if response.status_code >= 400:
            raise Exception(f"HTTP请求失败: {response.status_code}")

        data = response.json()
        if data.get("code") != 0:
            raise Exception(f"飞书API错误: code={data.get('code')}, msg={data.get('msg')}")

        return {"status": "success", "record_id": record_id}

    except requests.exceptions.RequestException as e:
        raise Exception(f"更新失败: {str(e)}")


def write_to_feishu_table(app_token, table_id, fields_data, enable_dedup=False, dedup_field="内容摘要"):
    """
    主函数：写入数据到飞书表格

    参数:
        app_token: 飞书多维表格的app_token
        table_id: 数据表的table_id
        fields_data: 字段数据字典
        enable_dedup: 是否启用去重
        dedup_field: 去重字段名
    """
    # 获取访问令牌
    access_token = get_feishu_access_token()

    # 构建记录格式
    record = {
        "fields": fields_data
    }

    # 如果启用去重
    if enable_dedup and dedup_field in fields_data:
        existing_record_id = check_record_exists(
            app_token, table_id, dedup_field,
            fields_data[dedup_field], access_token
        )

        if existing_record_id:
            # 更新现有记录
            result = update_record(app_token, table_id, existing_record_id, fields_data, access_token)
            result["message"] = "记录已存在，已更新"
            return result

    # 创建新记录
    result = batch_create_records(app_token, table_id, [record], access_token)
    result["message"] = "数据已写入飞书表格"
    return result


def main():
    parser = argparse.ArgumentParser(description="写入数据到飞书多维表格")
    parser.add_argument("--app_token", required=True, help="飞书多维表格的app_token")
    parser.add_argument("--table_id", required=True, help="数据表的table_id")
    parser.add_argument("--fields", required=True, help="字段数据JSON字符串")
    parser.add_argument("--enable_dedup", action="store_true", help="启用去重")
    parser.add_argument("--dedup_field", default="内容摘要", help="去重字段名")

    args = parser.parse_args()

    # 解析字段数据
    try:
        fields_data = json.loads(args.fields)
    except json.JSONDecodeError as e:
        print(json.dumps({"status": "error", "message": f"JSON解析失败: {str(e)}"}))
        return

    # 写入数据
    try:
        result = write_to_feishu_table(
            args.app_token,
            args.table_id,
            fields_data,
            args.enable_dedup,
            args.dedup_field
        )
        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))


if __name__ == "__main__":
    main()
