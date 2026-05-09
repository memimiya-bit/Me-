# 三维度统一数据模型

## 目录
- [概览](#概览)
- [核心表结构](#核心表结构)
- [索引设计](#索引设计)
- [JSONB字段规范](#jsonb字段规范)

---

## 概览

三维度统一数据结构（人-周-项目）是快反模式数据层的核心，通过统一的 `time_series_core` 表实现全链路数据的结构化存储。

```
┌─────────────────────────────────────────────────────┐
│                  应用层 (业务视图)                   │
│  - 人维度视图 | 周维度视图 | 项目维度视图            │
│  - RGB状态机 | 预警引擎 | 决策支持引擎               │
├─────────────────────────────────────────────────────┤
│                  服务层 (数据处理)                   │
│  - 时序计算引擎 | 关系抽取引擎 | 归因分析引擎       │
│  - 自动化交付物生成器 | 跨维度关联服务              │
├─────────────────────────────────────────────────────┤
│                  存储层 (数据存储)                   │
│  - 时序核心表 | 文档元数据表 | 关系图谱表           │
│  - 索引层 | 缓存层 | 归档层                        │
└─────────────────────────────────────────────────────┘
```

---

## 核心表结构

### time_series_core（时序核心表）

```sql
CREATE TABLE time_series_core (
    -- 主键
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========== 人维度 ==========
    person_id VARCHAR(50) NOT NULL,           -- 人员唯一标识
    person_role VARCHAR(30) NOT NULL,         -- 角色类型
    department VARCHAR(30) NOT NULL,          -- 部门
    
    -- ========== 周维度 ==========
    week_number INT NOT NULL,                 -- ISO周数（2024-W35）
    calendar_date DATE NOT NULL,              -- 具体日期
    season_factor NUMERIC(4,2) DEFAULT 1.0,   -- 季节调节系数
    
    -- ========== 项目维度 ==========
    project_id VARCHAR(50) NOT NULL,          -- 项目唯一标识
    sku_id VARCHAR(50),                       -- SKU编码
    module_code VARCHAR(10) NOT NULL,         -- 模块代码
    
    -- ========== 业务数据 ==========
    data_payload JSONB NOT NULL,              -- 结构化业务数据
    rgb_status VARCHAR(10) NOT NULL,          -- RGB状态
    risk_score NUMERIC(5,2) DEFAULT 0.0,     -- 风险评分（0-100）
    
    -- ========== 系统字段 ==========
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INT DEFAULT 1,
    data_source VARCHAR(50) DEFAULT 'system'
);
```

### 维度说明

#### 人维度字段
| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| person_id | 是 | 人员唯一标识 | EMP-001, SYS-USER-123 |
| person_role | 是 | 角色类型 | 买手, 合规专员, 设计师 |
| department | 是 | 部门 | 商品部, 合规部, 设计部 |

**角色类型枚举：**
- 买手 (buyer)
- 合规专员 (compliance_specialist)
- 设计师 (designer)
- 运营专员 (operations_specialist)
- 采购专员 (procurement_specialist)
- 质量分析师 (quality_analyst)
- PMO (project_manager)

#### 周维度字段
| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| week_number | 是 | ISO周数 | 35, 52 |
| calendar_date | 是 | 具体日期 | 2024-08-26 |
| season_factor | 否 | 季节调节系数 | 1.0（正常）, 1.2（旺季）, 0.8（淡季） |

**季节因子参考值：**
- SS季（春夏）：1.2
- AW季（秋冬）：1.3
- 快反项目：1.5
- 清仓季：0.8

#### 项目维度字段
| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| project_id | 是 | 项目唯一标识 | P2024Q4-001 |
| sku_id | 否 | SKU编码 | SKU-SS24-001 |
| module_code | 是 | 模块代码 | M1, M3, M4_M5 |

---

## 索引设计

### 索引策略

| 索引类型 | 适用场景 | 索引语句 |
|---------|---------|---------|
| BRIN索引 | 时序范围查询 | `USING BRIN (week_number)` |
| B-Tree索引 | 等值+范围查询 | `CREATE INDEX ON (project_id, week_number)` |
| 部分索引 | 高风险数据 | `WHERE risk_score > 80` |

### 索引示例

```sql
-- 时序索引（BRIN）：适合按周查询
CREATE INDEX idx_tsc_time ON time_series_core 
    USING BRIN (week_number) WITH (pages_per_range = 8);

-- 项目+周联合索引
CREATE INDEX idx_tsc_project ON time_series_core 
    (project_id, week_number);

-- 人员+周联合索引
CREATE INDEX idx_tsc_person ON time_series_core 
    (person_id, week_number);

-- 模块+周联合索引
CREATE INDEX idx_tsc_module ON time_series_core 
    (module_code, week_number);

-- 高风险部分索引
CREATE INDEX idx_tsc_risk ON time_series_core 
    (risk_score) WHERE risk_score > 80;
```

---

## JSONB字段规范

### data_payload 结构

```json
{
  "module": "M1",
  "timestamp": "2024-08-26T10:30:00Z",
  "business_data": {
    // 根据module_code不同，内容结构各异
  },
  "metadata": {
    "version": "1.0",
    "validated_by": "system"
  }
}
```

### 字段命名规范

| 前缀 | 含义 | 示例 |
|------|------|------|
| sku_ | SKU相关 | sku_code, sku_price |
| persona_ | 用户画像 | persona_distribution |
| compliance_ | 合规相关 | compliance_check |
| quality_ | 质量相关 | quality_score |
| cost_ | 成本相关 | cost_tolerance |
| price_ | 价格相关 | price_weighted |
| risk_ | 风险相关 | risk_level |

---

## 示例数据

```sql
-- 插入示例
INSERT INTO time_series_core (
    person_id, person_role, department,
    week_number, calendar_date, season_factor,
    project_id, sku_id, module_code,
    data_payload, rgb_status, risk_score
) VALUES (
    'EMP-001', '买手', '商品部',
    35, '2024-08-26', 1.2,
    'P2024Q4-001', 'SKU-SS24-001', 'M1',
    '{
        "sku_code": "SKU-SS24-001",
        "persona_distribution": {
            "trend_pioneer": {"percentage": 30, "price_sensitivity": "high"},
            "quality_rational": {"percentage": 70, "price_sensitivity": "medium"}
        },
        "3d_standards": {
            "fabric_elasticity": 0.85,
            "rendering_light_code": "#FFFFFF"
        }
    }'::jsonb,
    'NORMAL',
    25.5
);
```
