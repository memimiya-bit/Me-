---
name: quick-response-data-planning
description: 快反模式人-周-项目三维度数据层规划；支持M1-M7模块结构定义、时序数据管理和RGB预警，适用于快时尚供应链实时决策
---

# 快反模式数据层架构规划

## 任务目标
- 本 Skill 用于：规划快反模式的标准化数据层架构
- 能力包含：三维度统一数据模型、M1-M7模块规范、时序数据管理、RGB预警机制
- 触发条件：用户需要规划快反供应链数据层、设计M1-M7模块结构、配置RGB状态机

## 核心价值
- 统一数据模型：人-周-项目三维度时序架构
- 模块化设计：M1-M7各模块独立又联动
- 实时预警：RGB状态机驱动快速响应
- 性能保障：BRIN索引+物化视图优化

## 前置准备
- PostgreSQL 14+ 或 TimescaleDB 环境
- 时序数据存储需求评估
- 部门角色权限矩阵

## 三维度架构概览

### 人维度
| 字段 | 类型 | 说明 |
|------|------|------|
| person_id | VARCHAR(50) | 人员唯一标识（工号/系统ID） |
| person_role | VARCHAR(30) | 角色类型（买手/合规专员/设计师等） |
| department | VARCHAR(30) | 部门（商品部/合规部/设计部等） |

### 周维度
| 字段 | 类型 | 说明 |
|------|------|------|
| week_number | INT | ISO周数（2024-W35） |
| calendar_date | DATE | 具体日期 |
| season_factor | NUMERIC(4,2) | 季节调节系数（默认1.0） |

### 项目维度
| 字段 | 类型 | 说明 |
|------|------|------|
| project_id | VARCHAR(50) | 项目唯一标识（P2024Q4-001） |
| sku_id | VARCHAR(50) | SKU编码（可为空） |
| module_code | VARCHAR(10) | 模块代码（M1/M2/M3/M4_M5/M6/M7/GLOBAL） |

## RGB状态机

| 状态 | 颜色 | 含义 | 响应要求 |
|------|------|------|---------|
| NORMAL | 绿 | 正常运行 | 例行监控 |
| WARNING | 黄 | 预警关注 | 24h内响应 |
| CRITICAL | 红 | 严重告警 | 立即响应 |

### 状态升级规则
- 连续2周黄色 → 自动升级红色
- 单周风险评分 > 80 → 红色
- 利润率连续3天 < 阈值 → 红色

## 工作流程

### 标准规划流程
1. **需求收集** — 确定业务域和模块范围
2. **维度设计** — 规划人/周/项目三维字段
3. **模块配置** — 按M1-M7配置各模块数据结构
4. **预警规则** — 配置RGB状态和升级逻辑
5. **性能优化** — 设计索引和物化视图
6. **权限配置** — 设置行级安全和审计策略

### 模块选择策略
| 场景 | 推荐模块 |
|------|---------|
| 用户画像+定价 | M1 + M7 |
| 合规追踪 | M2 |
| 工厂管理 | M3 |
| 多渠道运营 | M4_M5 |
| 质量管理 | M6 |
| 全链路预警 | GLOBAL |

## 索引设计原则

### 时序索引
```sql
-- BRIN索引：适合时序数据的范围查询
CREATE INDEX idx_tsc_time ON time_series_core USING BRIN (week_number) WITH (pages_per_range = 8);
```

### 维度索引
```sql
-- 项目+周联合索引
CREATE INDEX idx_tsc_project ON time_series_core (project_id, week_number);

-- 人员+周联合索引
CREATE INDEX idx_tsc_person ON time_series_core (person_id, week_number);

-- 模块+周联合索引
CREATE INDEX idx_tsc_module ON time_series_core (module_code, week_number);
```

### 风险索引（部分索引）
```sql
-- 仅对高风险数据建立索引
CREATE INDEX idx_tsc_risk ON time_series_core (risk_score) WHERE risk_score > 80;
```

## 使用示例

### 示例1：快反项目数据规划
- 场景：规划SS25快反项目数据层
- 输入：project_id=P2025SS-001，module_code=M3
- 输出：完整的time_series_core结构 + M3模块data_payload schema
- 要点：season_factor设为1.2（春夏旺季系数）

### 示例2：多模块联动规划
- 场景：规划一个跨M1/M4_M5/M7的项目
- 输入：project_id=P2025Q1-001，modules=[M1,M4_M5,M7]
- 输出：统一project_id下的多模块数据结构
- 要点：确保M1的persona_premium_coefficient与M4_M5的加权价格联动

### 示例3：全局预警配置
- 场景：配置跨模块的全局预警规则
- 输入：module_code=GLOBAL
- 输出：RGB状态聚合逻辑 + 升级规则配置
- 要点：红灯项目 > 20% 触发应急会议

## 资源索引
- 参考文档：见 [references/](references/)
  - [triple-dimension-model.md](references/triple-dimension-model.md) — 三维度统一数据结构与索引
  - [module-data-schemas.md](references/module-data-schemas.md) — M1-M7各模块JSON Schema
  - [lifecycle-management.md](references/lifecycle-management.md) — 数据生命周期与分层存储
  - [performance-optimization.md](references/performance-optimization.md) — 物化视图与批量写入优化
  - [security-permission.md](references/security-permission.md) — 行级安全与审计追踪
  - [deployment-monitoring.md](references/deployment-monitoring.md) — 部署架构与监控指标

## 注意事项
- 时序数据优先使用BRIN索引，避免全表扫描
- data_payload为JSONB格式，支持灵活扩展但需控制字段数量
- RGB状态变更需记录原因，用于归因分析
- 物化视图按需刷新，避免影响写入性能
