# UI 设计指南

> **设计类型**: App 设计（应用架构设计）
> **确认检查**: 本指南适用于可交互的应用/网站/工具。

> ℹ️ Section 1-2 为设计意图与决策上下文。Code agent 实现时以 Section 3 及之后的具体参数为准。

## 1. Design Archetype (设计原型)

### 1.1 内容理解

- **目标用户**: QR-7S快反全链路智能管理系统使用者，包含商品企划、设计团队、供应链管控、运营决策等多角色业务人员，需要日常查看管控进度、识别风险、处理任务
- **核心目的**: 将M1企划、任务总控、版本管理、物料管理、产品库整合为统一后台管理系统，实现快反全链路数据整合与风险可视化管控，走"对话即管理"极简MVP路线
- **期望情绪**: 专业、清晰、可控、高效
- **需避免的感受**: 信息过载、视觉混乱、风险隐匿、交互繁琐

### 1.2 设计语言

- **Aesthetic Direction**: 企业级数据管控后台，MVP版本聚焦跑通核心闭环，设计语言保持极简专业，数据层级清晰，风险预警通过语义色彩统一呈现，支持业务人员快速识别问题并决策
- **Visual Signature**: 
  1. 沉稳靛蓝主色调建立专业信任感，符合服装供应链企业后台气质
  2. 统一语义色彩规范（红紧急/橙预警/黄关注），风险等级一目了然
  3. 清晰网格线分隔数据，锐利直角减少视觉干扰，聚焦数据本身
  4. 全系统复用任务列表组件，交互体验一致，降低开发成本
  5. 数字和评分使用等宽字体，数据对齐整齐便于对比
- **Emotional Tone**: 专业可控 · 高效决策
- **Design Style**: **Grid 网格** — 数据密集型管控系统，清晰网格分隔让海量数据更有条理，锐利直角强化专业感，等宽字体增强数据可读性
- **Application Type**: Admin（企业后台管理系统）- 6个功能模块，需要持久侧边导航

## 2. Design Principles (设计理念)

1. **风险可见**：通过统一语义色彩规范，让高风险/逾期/异常状态一目了然，缩短决策响应时间
2. **数据清晰**：网格布局分隔数据，锐利设计减少视觉噪音，让数据本身成为焦点
3. **组件复用**：统一任务列表、状态标签等交互组件，保持体验一致性降低开发成本
4. **高效交互**：筛选和详情通过弹窗/抽屉完成，减少页面跳转，保持列表上下文
5. **双向关联**：版本与产品、物料与版单建立双向跳转，打通数据孤岛
6. **MVP极简**：聚焦跑通核心闭环，不做过度设计，只保留必要功能和视觉元素

## 3. Color System (色彩系统)

**配色设计理由**：QR-7S快反全链路管控系统面向服装供应链专业人士，需要建立专业信任感，选择沉稳靛蓝作为主色；同时业务核心是风险管控，必须定义清晰的语义色彩区分风险等级，帮助用户在海量数据中快速识别问题。

### 3.1 主题颜色

| 角色               | CSS 变量               | Tailwind Class            | HSL 值    
| ------------------ | ---------------------- | ------------------------- | ---------- 
| bg                 | `--background`         | `bg-background`           | hsl(215 25% 97%)
| card               | `--card`               | `bg-card`                 | hsl(0 0% 100%)
| text               | `--foreground`         | `text-foreground`         | hsl(218 45% 13%)
| textMuted          | `--muted-foreground`   | `text-muted-foreground`   | hsl(216 16% 45%)
| primary            | `--primary`            | `bg-primary`              | hsl(212 80% 45%) 
| primary-foreground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%)
| accent             | `--accent`             | `bg-accent`               | hsl(212 80% 96%) 
| accent-foreground  | `--accent-foreground`  | `text-accent-foreground`  | hsl(212 80% 45%)
| border             | `--border`             | `border-border`           | hsl(214 20% 90%)

### 3.2 Sidebar 颜色

| 角色                       | CSS 变量                       | Tailwind Class                    | HSL 值     | 设计说明                         |
| -------------------------- | ------------------------------ | --------------------------------- | ---------- | -------------------------------- |
| sidebar                    | `--sidebar`                    | `bg-sidebar`                      | hsl(218 45% 11%) | Sidebar 背景色，作为导航区域基底 |
| sidebar-foreground         | `--sidebar-foreground`         | `text-sidebar-foreground`         | hsl(214 20% 85%) | Sidebar 文字色，对比度 ≥ 4.5:1   |
| sidebar-primary            | `--sidebar-primary`            | `bg-sidebar-primary`              | hsl(212 80% 45%) | 激活态背景色                     |
| sidebar-primary-foreground | `--sidebar-primary-foreground` | `text-sidebar-primary-foreground` | hsl(0 0% 100%) | 激活态文字色，对比度 ≥ 4.5:1     |
| sidebar-accent             | `--sidebar-accent`               | `bg-sidebar-accent`               | hsl(217 33% 20%) | Hover 态背景，提供交互反馈       |
| sidebar-accent-foreground  | `--sidebar-accent-foreground`  | `text-sidebar-accent-foreground`  | hsl(214 20% 85%) | Hover 态文字                     |
| sidebar-border             | `--sidebar-border`             | `border-sidebar-border`           | hsl(217 33% 22%) | Sidebar 边框，维持整体风格       |
| sidebar-ring               | `--sidebar-ring`               | `ring-sidebar-ring`               | hsl(212 80% 45%) | 聚焦环颜色                       |

### 3.3 语义颜色（必填，风险预警统一规范）

| 语义 | CSS 变量 | HSL 值 | Tailwind 应用示例 | 使用场景 |
| ---- | -------- | ------ | ----------------- | -------- |
| 紧急/阻塞/极高风险/逾期 | `--danger` | hsl(0 72% 51%) | `bg-[hsl(var(--danger))] text-white` | 逾期任务、红色预警、阻塞状态、极高风险 |
| 预警/高风险 | `--warning` | hsl(24 95% 50%) | `bg-[hsl(var(--warning))] text-white` | 预警任务、橙色预警、高风险、闲置预警 |
| 关注/中风险 | `--caution` | hsl(48 96% 48%) | `bg-[hsl(var(--caution))] text-black` | 需要关注、黄色预警、中风险 |
| 正常/安全/已完成 | `--success` | hsl(142 72% 35%) | `bg-[hsl(var(--success))] text-white` | 已完成、正常状态、低风险 |

> **使用规范**：严格遵循此映射：红色(`--danger`)用于紧急/阻塞，橙色(`--warning`)用于预警，黄色(`--caution`)用于关注，确保用户形成一致认知。所有状态标签使用胶囊形状，背景色配对比达标文字（黄色用黑色文字，其他用白色文字）。

## 4. Typography (字体排版)

- **Heading**: Inter + 系统无衬线字体栈 → `font-sans`
- **Body**: Inter + 系统无衬线字体栈 → `font-sans`
- **数字/表格数据/DRS评分/资金占用**: Roboto Mono + 系统等宽字体栈 → `font-mono`
- **字体导入**: 使用系统字体栈，无需引入外部资源

**排版层级**:

| 元素 | 字号 | 字重 | 行高 | 用途 |
| ---- | ---- | ---- | ---- | ---- |
| Page Title | `text-2xl` | `font-bold` | `leading-tight` | 页面大标题 |
| Section Title | `text-lg` | `font-semibold` | `leading-tight` | 区块标题 |
| Card Title | `text-base` | `font-medium` | `leading-normal` | 卡片标题 |
| Body Text | `text-sm` | `font-normal` | `leading-relaxed` | 正文字段 |
| Table Cell | `text-sm` | `font-normal` | `leading-normal` | 表格单元格 |
| Numeric Data | `text-sm` | `font-normal` | `leading-normal` `font-mono` | 数字/评分/金额数据 |
| Muted Text / Label | `text-xs` | `font-normal` | `leading-normal` | 辅助说明/标签 |

## 5. Layout Strategy (布局策略)

### 5.1 结构方向

**导航策略**：功能模块共6个（业务总览、业务详情、任务管理、版本管理、物料管理、产品库），数量较多且需要频繁切换，需要持久导航 → 采用侧边栏布局，桌面端固定显示，移动端折叠为抽屉汉堡菜单。

**页面架构特征**：
- 数据密集型后台系统，高信息密度需要紧凑布局但保持清晰网格分隔
- 大量表格数据展示，需要足够横向空间容纳多列数据（业务类型、风险等级、负责人、进度等）
- 各列表页统一采用 `筛选区 + 列表区` 双层结构，筛选区顶部固定，列表区可独立滚动
- 详情弹窗/抽屉展示，不破坏列表上下文，提升操作效率
- 产品库使用网格卡片布局，适配图片展示需求
- MVP阶段保持简洁，不增加复杂定制布局，优先保证核心功能跑通

### 5.2 响应式原则

**断点策略**：
- 桌面端(`>1024px`)：侧边栏展开固定，完整显示表格所有列
- 平板(`768px-1024px`)：侧边栏折叠为图标模式，表格支持横向滚动
- 移动端(`<768px`)：侧边栏默认收起为汉堡菜单，表格单列堆叠展示，产品库网格变为单列

**内容密度**：
- 移动端单列布局，所有可点击区域最小尺寸 ≥ 44px，满足触摸操作
- 桌面端保持多列布局，充分利用屏幕空间展示数据
- 产品库：桌面端3-4列卡片，平板2列，移动端1列

## 6. Visual Language (视觉语言)

**形态特征**：
- 锐利专业 → Grid网格风格要求直角设计，主要使用 `rounded-none` / `rounded-sm`，拒绝大圆角软化设计
- 网格分隔 → 使用细 `border-border` 分隔表格单元格和卡片，清晰界定每个数据范围
- 层次极简 → 依赖边框和背景色差异建立层次，卡片仅使用 `shadow-sm`，减少视觉干扰
- 数据对齐 → 数字、评分、金额、资金占用等数据使用等宽 `font-mono`，对齐整齐便于快速比较
- 状态标签统一 → 所有风险/状态标签使用胶囊形状 `rounded-full px-2 py-0.5 text-xs`

**装饰策略**：
- MVP极简设计，不使用额外装饰元素，去掉所有不必要的背景渐变、几何点缀
- 风险状态通过色彩传递信息，不需要额外图形装饰分散注意力
- 完全依靠网格布局和清晰排版建立视觉层次
- 快捷入口区使用卡片网格展示动态数据（待办任务数、预警任务数），不重复侧边导航链接，提供实际价值

**动效原则**：
- 快速响应，所有交互动效时长控制在 150-200ms，干脆利落不拖泥带水
- 悬停状态提供明确背景变化反馈，表格行 hover 使用 `bg-accent`
- 弹窗/抽屉滑入动画简洁，不干扰用户当前注意力

**可及性保障**：

- 正文文字与背景对比度 ≥ 4.5:1，大号标题对比度 ≥ 3:1 ✓
- 风险语义色彩满足对比度要求，红/橙语义色使用白色文字，黄色使用黑色文字确保可读性
- 所有交互元素有明确的 hover/focus 视觉反馈
- 大数据表格表头固定，滚动时保持上下文可见
- 边框和文本颜色满足 WCAG AA 标准

**组件状态规范**：

| 组件 | Default | Hover | Focus | Disabled |
| ---- | ------- | ----- | ----- | -------- |
| Primary Button | `bg-primary text-primary-foreground` | `bg-primary/90` | `ring-2 ring-primary/50` | `opacity-50 cursor-not-allowed` |
| Secondary Button | `bg-card border-border` | `bg-accent` | `ring-2 ring-primary/30` | `opacity-50 cursor-not-allowed` |
| Table Row | `bg-card` | `bg-accent` | - | `opacity-60` |
| Filter Option | `bg-transparent text-muted-foreground` | `bg-accent` | `ring-1 ring-primary` | - |
| Input | `bg-card border-border` | `border-primary/60` | `ring-2 ring-primary/30 border-primary` | `opacity-50 bg-muted` |

**业务特殊规范**：

- M1企划作为业务类型之一，在业务总览筛选器中与其他业务类型平级展示，不单独割裂
- 所有异常状态（逾期、高风险、闲置预警）都使用语义颜色规范的胶囊标签，视觉语言统一
- 版本详情面板提供「快捷跳转至所属产品详情」按钮，产品详情面板提供「查看该产品所有版本」快捷入口，建立双向关联
- 任务列表在业务详情页、任务管理页复用同一组件，通过传入不同数据源和筛选条件实现复用，代码不重复
- 首页快捷入口展示动态数据（待办任务数、预警任务数），而不是重复侧边导航链接，提供价值不冗余
- MVP聚焦核心闭环，飞书AI聊天机器人配置由用户手动在飞书后台完成，前端不做重复开发