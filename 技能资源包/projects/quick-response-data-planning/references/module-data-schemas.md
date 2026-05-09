# M1-M7模块数据结构规范

## 目录
- [M1 用户画像与定价](#m1-用户画像与定价)
- [M2 合规节点追踪](#m2-合规节点追踪)
- [M3 工厂执行管理](#m3-工厂执行管理)
- [M4_M5 多渠道运营](#m4_m5-多渠道运营)
- [M6 质量分析](#m6-质量分析)
- [M7 采购与交付](#m7-采购与交付)
- [GLOBAL 全局预警](#global-全局预警)

---

## M1 用户画像与定价

### 适用场景
- 用户画像分析
- 3D设计标准管理
- 价格系数配置
- 用户分群与偏好追踪

### 数据结构

```json
{
  "module": "M1",
  "data_schema": {
    "sku_code": "string(required)",
    
    "persona_distribution": {
      "trend_pioneer": {
        "percentage": "number(0-100)",
        "price_sensitivity": "string(enum:low/medium/high)",
        "historical_波动": "array(number)"
      },
      "quality_rational": {
        "percentage": "number(0-100)",
        "price_sensitivity": "string(enum:low/medium/high)",
        "historical_波动": "array(number)"
      },
      "value_seeker": {
        "percentage": "number(0-100)",
        "price_sensitivity": "string(enum:low/medium/high)",
        "historical_波动": "array(number)"
      }
    },
    
    "3d_standards": {
      "fabric_elasticity": "number",
      "rendering_light_code": "string(hex)",
      "version": "string",
      "modification_trace": "array({
        timestamp: timestamp,
        modifier: string,
        change_summary: string
      })"
    },
    
    "persona_premium_coefficient": {
      "current_value": "number",
      "4_week_trend": "array(number)",
      "change_rate": "number",
      "warning_threshold": "number(default:0.1)"
    }
  },
  "required_fields": ["sku_code", "persona_distribution", "3d_standards"]
}
```

### 字段说明

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| sku_code | string | SKU编码 | 必填，唯一 |
| persona_distribution | object | 用户分群分布 | 百分比之和=100 |
| 3d_standards | object | 3D设计标准 | 必填 |
| persona_premium_coefficient | object | 人群溢价系数 | 当前值范围0.5-2.0 |

---

## M2 合规节点追踪

### 适用场景
- 环保合规检测（T40d节点）
- 测试报告追踪（T25d节点）
- 标签验证（T18d节点）
- RSL合规检查

### 数据结构

```json
{
  "module": "M2",
  "data_schema": {
    "project_batch": "string(required)",
    
    "compliance_nodes": {
      "node1_t40d": {
        "detection_time": "timestamp",
        "executor": "string",
        "result": "string(enum:pass/fail)",
        "historical_comparison": "number"
      },
      "node2_t25d": {
        "test_report_path": "string",
        "version": "string",
        "planned_completion": "date",
        "actual_completion": "date",
        "advance_days": "integer",
        "risk_propagation": "object"
      },
      "node3_t18d": {
        "label_verification": "boolean",
        "signature": "string",
        "confirmation_time": "timestamp",
        "cross_department_confirmation": {
          "design": "boolean",
          "compliance": "boolean",
          "operations": "boolean"
        }
      }
    },
    
    "risk_level_prediction": {
      "current_status": "string(enum:🟢/🟡/🔴)",
      "historical_status": "array(string)",
      "warning_mechanism": "string"
    }
  },
  "required_fields": ["project_batch", "compliance_nodes"]
}
```

### 节点时间说明

| 节点 | 名称 | 距项目启动 | 说明 |
|------|------|-----------|------|
| T40d | 环保检测 | 40天前 | ZDHC MRSL检测 |
| T25d | 测试报告 | 25天前 | AATCC/ISO测试 |
| T18d | 标签验证 | 18天前 | 洗水唛合规 |

### 预警规则
- 连续2周黄色 → 自动升级红色
- 节点延误 > 3天 → 红色

---

## M3 工厂执行管理

### 适用场景
- 48小时样品追踪
- 2小时巡检记录
- 灰度容差分析
- 工厂产能评估

### 数据结构

```json
{
  "module": "M3",
  "data_schema": {
    "factory_id": "string(required)",
    
    "48h_sample_tracking": {
      "required_time": "timestamp",
      "actual_completion": "timestamp",
      "achievement_rate": "number(0-1)",
      "executor": "string",
      "problem_records": "array({
        problem_id: string,
        description: string,
        severity: string(enum:low/medium/high)
      })",
      "solution_time": "timestamp",
      "historical_comparison": "number"
    },
    
    "2h_patrol_records": {
      "daily_patrol_count": "integer",
      "average_response_time": "number(hours)",
      "problem_resolution": "array({
        problem_id: string,
        resolution_time: number,
        resolution_method: string
      })",
      "patrol_quality_score": "number(0-5)",
      "comparison_last_week": "number"
    },
    
    "gray_tolerance_analysis": {
      "tolerance_usage_rate": "number(0-1)",
      "allowed_range": "array(number, length=2)",
      "status": "string(enum:🟢/🟡/🔴)",
      "reason_codes": "array({
        code: string,
        description: string,
        frequency: number
      })",
      "auto_warning": "string"
    }
  },
  "required_fields": ["factory_id", "48h_sample_tracking", "2h_patrol_records"]
}
```

### 关键指标

| 指标 | 目标值 | 预警阈值 |
|------|-------|---------|
| 48h样品达成率 | ≥95% | <90% |
| 2h巡检响应时间 | ≤2h | >3h |
| 灰度容差使用率 | ≤10% | >12% |

---

## M4_M5 多渠道运营

### 适用场景
- 多渠道价格加权计算
- 快反成本容差分析
- 利润率追踪
- 库存周转管理

### 数据结构

```json
{
  "module": "M4_M5",
  "data_schema": {
    "channel_weighted_price": {
      "official_website": {
        "weight": "number(0-1)",
        "price": "number",
        "7day_trend": "array(number)"
      },
      "live_streaming": {
        "weight": "number(0-1)",
        "price": "number",
        "return_rate": "number(0-1)"
      },
      "private_domain": {
        "weight": "number(0-1)",
        "price": "number",
        "repurchase_rate": "number(0-1)"
      },
      "calculation_result": "number",
      "comparison_last_week": "number"
    },
    
    "fast_response_cost_tolerance": {
      "base_cost": "number",
      "historical_baseline": "number",
      "fast_response_premium": "number",
      "premium_rate": "number(0-1)",
      "actual_profit_margin": "number(0-1)",
      "warning_mechanism": "string"
    }
  },
  "required_fields": ["channel_weighted_price", "fast_response_cost_tolerance"]
}
```

### 价格权重参考

| 渠道 | 正常权重 | 快反权重 | 说明 |
|------|---------|---------|------|
| 官网 | 0.4 | 0.3 | 品牌调性 |
| 直播 | 0.3 | 0.5 | 快反主力 |
| 私域 | 0.3 | 0.2 | 复购优先 |

### 预警规则
- 利润率连续3天 < 阈值 → 红色
- 渠道价格偏差 > 15% → 黄色

---

## M6 质量分析

### 适用场景
- 质检报告分析
- 质量问题归因
- 供应商质量评估
- 质量趋势追踪

### 数据结构

```json
{
  "module": "M6",
  "data_schema": {
    "quality_indicators": {
      "fabric_defect_rate": "number(0-1)",
      "sewing_defect_rate": "number(0-1)",
      "overall_quality_score": "number(0-100)",
      "aql_level": "string(enum:1.0/1.5/2.5/4.0)"
    },
    
    "defect_analysis": {
      "major_defects": "array({
        defect_type: string,
        count: number,
        root_cause: string
      })",
      "minor_defects": "array({
        defect_type: string,
        count: number,
        impact_level: string
      })"
    },
    
    "supplier_quality_trend": {
      "current_score": "number(0-100)",
      "6month_trend": "array(number)",
      "benchmark_score": "number",
      "gap_analysis": "number"
    }
  },
  "required_fields": ["quality_indicators", "defect_analysis"]
}
```

---

## M7 采购与交付

### 适用场景
- 采购订单管理
- 交期追踪
- 成本核算
- 供应商协同

### 数据结构

```json
{
  "module": "M7",
  "data_schema": {
    "purchase_order": {
      "po_number": "string",
      "supplier_id": "string",
      "po_amount": "number",
      "currency": "string(default:CNY)",
      "payment_terms": "string"
    },
    
    "delivery_tracking": {
      "planned_delivery": "date",
      "actual_delivery": "date",
      "delay_days": "integer",
      "delay_reason": "string",
      "expedite_cost": "number"
    },
    
    "cost_breakdown": {
      "material_cost": "number",
      "processing_cost": "number",
      "logistics_cost": "number",
      "total_cost": "number",
      "cost_per_unit": "number"
    }
  },
  "required_fields": ["purchase_order", "delivery_tracking"]
}
```

---

## GLOBAL 全局预警

### 适用场景
- 跨模块综合预警
- 项目健康度评估
- 资源协调预警
- 高管决策支持

### 数据结构

```json
{
  "module": "GLOBAL",
  "data_schema": {
    "project_health_score": {
      "overall_score": "number(0-100)",
      "module_scores": {
        "M1": "number(0-100)",
        "M2": "number(0-100)",
        "M3": "number(0-100)",
        "M4_M5": "number(0-100)",
        "M6": "number(0-100)",
        "M7": "number(0-100)"
      },
      "critical_issues": "array(string)"
    },
    
    "cross_module_alerts": {
      "red_light_projects": "number",
      "yellow_light_projects": "number",
      "escalation_required": "boolean"
    },
    
    "resource_utilization": {
      "designer_workload": "number(0-1)",
      "factory_capacity": "number(0-1)",
      "warehouse_capacity": "number(0-1)"
    }
  },
  "required_fields": ["project_health_score", "cross_module_alerts"]
}
```

### 全局预警规则

| 条件 | 状态 | 处理 |
|------|------|------|
| 红灯项目 > 20% | 🔴 | 启动应急会议 |
| 任一模块连续2周黄色 | 🔴 | PMO介入 |
| 资源利用率 > 90% | 🟡 | 预警关注 |
| 所有模块绿色 | 🟢 | 例行监控 |
