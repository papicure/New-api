# UI 全面重构方案 — ClaudeCode 风格（web/default）

> 目标：把 new-api 默认前端（`web/default`）重做成「ClaudeCode / RelaxyCode」那种暖陶土橙 + 奶油米白、editorial 气质的界面，让人一眼看不出是 new-api。
> 范围：L3 全面重构，覆盖落地页、认证页、用户控制台、管理后台、公开页、错误/引导页。
> 约束底线：**仅保留 footer 右下角的 new-api / QuantumNous 版权与项目归属**，其余视觉全部重做。

---

## 0. 技术现状（开发前必读）

- 技术栈：React 19 + TypeScript + TanStack Router(file-based) + TanStack Query + Zustand + Tailwind v4 + Base UI（shadcn 风格自建 UI）+ Lucide/HugeIcons + motion + recharts/vchart + i18next。
- 包管理：**bun**（在 `web/default/` 下执行 `bun install` / `bun run dev` / `bun run build`）。
- 主题体系：**OKLCH + CSS 变量 token**（shadcn 风格语义层），已内置完整的「主题预设 / 字体 / 圆角 / 缩放 / 布局」5 轴自定义系统。**这是本次改造最大的杠杆——配色换肤在 token 层统一完成，不必逐组件改色。**
- 运行时默认主题就是 `default`（Go 侧 `common.GetTheme()` 仅当值为 `"classic"` 才走 classic）。
- `web/classic`（Semi Design 旧前端）是另一套独立代码，本方案**不重构 classic**（见 §8）。

### 关键文件地图

| 关注点 | 文件 |
|---|---|
| Tailwind token 映射 | `web/default/src/styles/theme.css`（`@theme inline` + `:root` + `.dark`） |
| 主题预设色块 | `web/default/src/styles/theme-presets.css` |
| 预设/字体/圆角注册表（单一事实来源） | `web/default/src/lib/theme-customization.ts` |
| 全局 reset / 杂项 | `web/default/src/styles/index.css` |
| 已登录布局 | `web/default/src/components/layout/components/authenticated-layout.tsx` |
| 顶栏 | `…/layout/components/app-header.tsx`、`header.tsx` |
| 侧栏 | `…/layout/components/app-sidebar.tsx` |
| 侧栏菜单数据 | `web/default/src/hooks/use-sidebar-data.ts` |
| 通用页面壳（标题/操作/面包屑/内容/底栏插槽） | `…/layout/components/section-page-layout.tsx` |
| 品牌（logo+站名） | `…/layout/components/system-brand.tsx` |
| 公开页头 | `…/layout/components/public-header.tsx`、`header-logo.tsx` |
| Footer（版权归属在此） | `…/layout/components/footer.tsx` |
| 落地页 | `web/default/src/routes/index.tsx` → `src/features/home/` |
| 认证页 | `src/routes/(auth)/*` → `src/features/auth/`（含 `auth-layout.tsx`） |
| 控制台/管理页 | `src/routes/_authenticated/*` |
| 系统设置 drill-in | `src/components/layout/config/system-settings.config.ts` + 各 feature `section-registry.tsx` |

---

## 1. 设计语言规范（Design Tokens）

> 全部用 OKLCH，落到 `theme.css` 的 `:root` / `.dark`。下列为**目标值建议**，开发时可在 ±0.02 明度内微调以匹配截图，但需保持色相一致（暖橙色相 ~40–80）。

### 1.1 主色与中性色 — 明亮模式（覆盖 `:root`）

```
--background:        oklch(0.985 0.006 75)   /* 奶油米白画布 */
--foreground:        oklch(0.255 0.012 55)   /* 暖深棕黑文字 */
--card:              oklch(0.997 0.004 80)   /* 卡片近白带暖 */
--card-foreground:   oklch(0.255 0.012 55)
--popover:           oklch(0.997 0.004 80)
--popover-foreground:oklch(0.255 0.012 55)

--primary:           oklch(0.560 0.130 42)   /* 陶土橙红 主色 */
--primary-foreground:oklch(0.990 0.005 80)
--secondary:         oklch(0.955 0.014 70)   /* 暖浅米 */
--secondary-foreground: oklch(0.300 0.020 50)
--muted:             oklch(0.962 0.010 72)
--muted-foreground:  oklch(0.520 0.022 55)
--accent:            oklch(0.928 0.030 58)   /* 浅橙强调底（hover/选中底） */
--accent-foreground: oklch(0.300 0.035 45)

--border:            oklch(0.910 0.012 70)
--input:             oklch(0.910 0.012 70)
--ring:              oklch(0.560 0.130 42)
```

语义状态色（暖化但保留语义辨识，截图里 200/成功=绿、耗时=红、倍率=橙）：

```
--destructive: oklch(0.560 0.200 28)   --destructive-foreground: oklch(0.990 0.005 80)
--success:     oklch(0.600 0.130 158)  --success-foreground:     oklch(0.990 0.005 80)
--warning:     oklch(0.700 0.150 70)   --warning-foreground:     oklch(0.255 0.012 55)
--info:        oklch(0.560 0.120 240)  --info-foreground:        oklch(0.990 0.005 80)
--neutral:     oklch(0.680 0.010 60)   --neutral-foreground:     oklch(0.255 0.012 55)
```

图表色（陶土橙和谐色阶，截图消费趋势是单橙渐变）：

```
--chart-1: oklch(0.560 0.130 42)
--chart-2: oklch(0.650 0.120 55)
--chart-3: oklch(0.720 0.100 70)
--chart-4: oklch(0.470 0.090 45)
--chart-5: oklch(0.800 0.070 80)
```

侧栏（比画布略深的奶油，选中态用浅橙 accent）：

```
--sidebar:                    oklch(0.972 0.010 72)
--sidebar-foreground:         oklch(0.300 0.012 55)
--sidebar-primary:            oklch(0.560 0.130 42)
--sidebar-primary-foreground: oklch(0.990 0.005 80)
--sidebar-accent:             oklch(0.928 0.030 58)
--sidebar-accent-foreground:  oklch(0.300 0.035 45)
--sidebar-border:             oklch(0.910 0.012 70)
--sidebar-ring:               oklch(0.560 0.130 42)
--skeleton-base:      oklch(0.955 0.012 72)
--skeleton-highlight: oklch(0.985 0.006 75)
```

> `--table-*` 是基于 `--foreground`/`--background` 的 `color-mix`，无需改公式，会随新底色自动暖化。

### 1.2 主色与中性色 — 暗色模式（覆盖 `.dark`，暖炭底）

```
--background:        oklch(0.220 0.008 50)
--foreground:        oklch(0.940 0.008 75)
--card:              oklch(0.265 0.010 50)
--popover:           oklch(0.285 0.010 50)
--primary:           oklch(0.680 0.140 48)   /* 暗色下提亮的陶土橙 */
--primary-foreground:oklch(0.180 0.010 50)
--secondary:         oklch(0.320 0.012 50)
--muted:             oklch(0.290 0.010 50)
--muted-foreground:  oklch(0.760 0.012 70)
--accent:            oklch(0.360 0.025 50)
--accent-foreground: oklch(0.960 0.008 75)
--border:            oklch(1 0 0 / 10%)
--input:             oklch(1 0 0 / 16%)
--ring:              oklch(0.680 0.140 48)
--sidebar:           oklch(0.205 0.008 50)
--sidebar-foreground:oklch(0.930 0.008 75)
--sidebar-primary:   oklch(0.680 0.140 48)
--sidebar-accent:    oklch(0.345 0.020 50)
/* success/warning/info/destructive/chart-* 同步暖化提亮，保持语义 */
```

### 1.3 字体 / 圆角 / 阴影 / 间距

- **字体**：正文 `Public Sans`（现有 `--font-sans`）。**大标题改用 serif（现有 `Lora` 栈，`--font-serif`）以营造 editorial 气质**——通过新建 `Heading`/`PageTitle` 组件局部应用 `font-serif`，或把新默认 preset 的 `PRESET_DEFAULT_FONT` 设为 `sans` 而标题组件强制 serif。两种皆可，推荐「正文 sans + 页面大标题 serif」。
- **圆角**：保持 `--radius: 1rem`（截图卡片圆角明显）。按钮/输入用 `--radius-md`，卡片用 `--radius-lg`/`--radius-xl`，数据卡可到 `--radius-2xl`。
- **阴影**：新增柔和暖色阴影工具（在 `index.css` 定义 utility 或用 Tailwind 任意值）：
  - 卡片：`shadow-[0_1px_3px_oklch(0.4_0.05_50/0.06),0_8px_24px_-12px_oklch(0.4_0.05_50/0.10)]`
  - 弹窗：更深一档。统一走一个 `.shadow-soft` / `.shadow-soft-lg` utility 便于复用。
- **边框**：低对比暖灰描边（`--border`），卡片普遍 `border + 轻阴影` 并存。
- **间距/密度**：增大留白；页面主标题区上下 padding 加大；卡片 grid gap ≥ 16px；内容区最大宽度沿用 `main.tsx` 的容器查询，保持居中留白。
- **动效**：沿用 `motion`；页面切换淡入、卡片 hover 轻微抬升（translateY -2px + 阴影加深）。克制，不浮夸。

---

## 2. 主题预设策略（移除旧预设 + 新主色派生变体）

单一事实来源：`web/default/src/lib/theme-customization.ts` 的 `THEME_PRESETS`。

1. **把新陶土橙方案直接写进 `theme.css` 的 `:root`/`.dark`**（即 `default` 预设 = 新主色），这样未选预设时就是新风格。
2. **删除旧预设**：移除 `THEME_PRESETS` 中 `anthropic / simple-large / underground / rose-garden / lake-view / sunset-glow / forest-whisper / ocean-breeze / lavender-dream`，并删掉 `theme-presets.css` 里对应的 `[data-theme-preset='…']` 明/暗块。
3. **新增 4 个基于新主色派生的和谐变体**（保留多主题切换能力，但都共享奶油底，只换强调色相/明度），建议：
   - `terracotta`（=默认陶土橙，作为列表里的具名项，可与 default 同值或略深）
   - `clay`（赤陶/砖红，色相 ~30）
   - `amber`（暖琥珀金，色相 ~70）
   - `sage`（与主色互补的橄榄/鼠尾草绿，色相 ~140，作为「反过来」的冷调变体）
   每个变体在 `theme-presets.css` 写明/暗两块，仅覆盖 `--primary / --secondary / --ring / --accent / --chart-* / --sidebar-primary / --sidebar-accent` 等强调 token，不动 background/card。
4. 更新 `theme-customization.ts` 中每个 preset 的 `swatches`（配色抽屉里的小色块预览）。
5. `PRESET_DEFAULT_FONT`：default → `sans`（标题靠组件强制 serif）。
6. 配色抽屉 UI（`config-drawer.tsx`）随 `THEME_PRESETS` 自动更新，无需额外改动；确认抽屉里不再出现已删预设。

---

## 3. 布局与核心组件重塑

### 3.1 侧栏（截图核心特征：分组小标题 + 图标 + 选中态浅橙底）
- 文件：`use-sidebar-data.ts`（数据）+ `app-sidebar.tsx`（渲染）。
- 分组按截图重组为：**概览 / 开发 / 教程 / 账户 / 系统**（中文经 i18n，英文为 key）。把现有 chat/general/personal/admin 组映射进去：
  - 概览：仪表盘(dashboard)
  - 开发：API Keys、日志(usage-logs)、价格(pricing 入口或模型价)
  - 账户：套餐/订阅、钱包/充值(wallet)、个人设置(profile)
  - 系统(admin 可见)：用户、渠道、模型、兑换码、系统设置
  - 教程：可接入文档/about（按需）
- 分组小标题：灰色小字 label（`text-muted-foreground text-xs`），与截图一致。
- 选中项：浅橙 `bg-sidebar-accent text-sidebar-accent-foreground` + 左侧不需竖条（截图是整块浅底圆角）。
- 顶部品牌：星形 logo 图标 + 站名（见 §5），底部用户卡（头像 + 名 + 邮箱 + 展开箭头）。

### 3.2 顶栏（`app-header.tsx`）
- 左：`SidebarTrigger` + 面包屑（截图有「仪表盘 / 子页」面包屑——把面包屑统一上提到 header，或继续用 `SectionPageLayout.Breadcrumb` 但样式对齐截图）。
- 右：**余额胶囊**（截图右上 `¥5.00`，从 `auth.user.quota` 取，新增一个小胶囊组件）+ 帮助 + 通知(`NotificationPopover`) + 主题/配置(`ConfigDrawer`) + 语言(`LanguageSwitcher`) + 头像(`ProfileDropdown`)。
- 顶栏高度 `--app-header-height` 可按截图微调（截图顶栏较薄，约 3–3.5rem）。

### 3.3 通用页面壳（`section-page-layout.tsx`）
- 这是全局「页面 chrome」，改一处即可统一所有 console 页：
  - 大号 **serif 页面标题** + 灰色副标题（截图统一格式：标题 + 一句话描述）。
  - Actions 插槽右对齐。
  - 内容区统一外边距与最大宽度。

### 3.4 卡片与数据展示组件（新建/重做，供各页复用）
- `StatCard`（数据卡）：图标徽章（圆形浅橙底）+ 小标签 + 特大数字（截图：账户余额/今日消费/本周消费/API Keys）。
- `Card` 基础样式：白底 + `--radius-xl` + 暖描边 + `.shadow-soft`，hover 轻抬升。
- 进度条（截图额度条：今日/每周/总额度，超额显示红色）：用 `--primary` 填充，超 100% 转 `--destructive`。
- 表格（日志页）：行分隔细线、状态用 success 绿 badge、倍率橙、耗时红、费用绿；右侧抽屉「请求详情」沿用现有 drawer。
- 价格卡 / 套餐卡 / 优惠券卡 / 订单卡 / 充值档位：按截图 7、8、10、11、12 还原（圆角卡 + 推荐/热门/限时角标 + 主色 CTA 按钮）。
- 角标/Badge：推荐=主色描边、热门=橙、限时=琥珀。

---

## 4. 逐页改造清单

> 改造顺序见 §7 分阶段。每页保证 i18n（`useTranslation()` + `t('English key')`，新增文案补 `web/default/src/i18n/locales/*.json`）。

### 4.1 公开 / 营销
- **落地页** `src/features/home/`（含 `components/sections/`）：英雄区(serif 大标题 + 主色 CTA)、特性卡、模型/定价预览、页脚。整体奶油底 + 陶土橙点缀。
- **公开页头** `public-header.tsx` + `header-logo.tsx`：滚动胶囊化保留，配色换新；登录按钮用主色。
- **定价页** `routes/pricing/*`：对齐截图 7 的「筛选侧栏 + 模型价卡网格 + 列表/网格切换」。
- **排行** `rankings`、**关于** `about`、**隐私/协议** 静态页：套用新 token + serif 标题。

### 4.2 认证（`features/auth/` + `auth-layout.tsx`）
- 登录/注册/忘记密码/重置/OTP/passkey：左图右表或居中卡片，奶油底、品牌 logo、主色按钮、柔和阴影。
- `auth-layout.tsx` 统一壳。OAuth 按钮风格统一。

### 4.3 用户控制台（`routes/_authenticated/`）
- **仪表盘** `dashboard/`：还原截图 1（4 个 StatCard + 用户信息卡 + 套餐额度卡含进度条 + 帮助支持卡 + 消费趋势面积图）。
- **API Keys** `keys/`：还原截图 2/3/4（管理卡 + 可用分组卡网格 + Key 列表 + 查看明文弹窗 + 编辑弹窗 + 一键配置按钮）。
- **日志** `usage-logs/`：还原截图 5/6（进行中请求实时卡 + 4 指标卡 + 筛选条 + 表格 + 详情抽屉）。
- **套餐/订阅** `subscriptions/`：截图 8/9（套餐卡 + 确认购买弹窗 + 余额校验提示）。
- **钱包/充值** `wallet/`、`routes/console/topup.tsx`：截图 13（充值档位 + 支付方式 + 充值记录表 + FAQ 折叠）。
- **优惠券**：截图 10（兑换框 + 状态筛选 tab + 折扣券卡）。
- **订单**：截图 11（状态筛选 tab + 订单卡 + 搜索）。
- **个人设置** `profile/`、**Playground** `playground/`、**Chat** `chat/$chatId`、`chat2link`：套新 token + 组件。

### 4.4 管理后台（`_authenticated` 内 admin 角色可见）
- `users / channels / models / redemption-codes / subscriptions`：表格与表单统一走新 `data-table` 与卡片样式。
- **系统设置 drill-in**（`system-settings/*` 七大区）：侧栏切换视图保留，配色/标题/表单控件换新。站点&品牌区(`site/`)确保站名/logo/footerHtml 配置项可用（见 §5）。

### 4.5 错误页 / 引导
- `(errors)/40x,50x` + `features/errors/`：奶油底大数字 + serif 文案 + 返回主色按钮。
- `setup/` 向导：步骤条 + 卡片化，配色换新。

---

## 5. 品牌处理（合规重点）

- **站点名 / Logo 走运行时配置**：`system-brand.tsx` 显示 `useStatus().status.system_name` + `useSystemConfig().logo`。运营在「系统设置 → 站点&品牌」改站名（如自有品牌）与上传 logo（星形图标）即可——这是 new-api 内置可配置项，**不属于删除归属，合规**。仅需把代码里的硬编码兜底（`'New API'` / `/logo.png`）保留为兜底即可，不必改。
- **Footer 版权（红线）**：`footer.tsx` 中的「© year — New API」+ 指向 `github.com/QuantumNous/new-api` 的项目归属 **必须原样保留**（这就是「右下角的 newapi 版权」）。可以重排 footer 视觉、精简多余链接列，但**不得删除/替换/隐藏该版权与归属字符串及其 i18n key**。
- **不得改动**：Go module path、包名、import 路径、license 头（如 `theme.css` 顶部 AGPL + QuantumNous 版权注释）、Docker/CI 中的项目标识。换肤不需要动这些。

---

## 6. 全局约束与规约

- i18n：所有新增/改动文案走 i18next，key 用英文源串，补齐 `locales/{en,zh,fr,ru,ja,vi}.json`（至少 en/zh）。改完跑 `bun run i18n:sync`（在 `web/default/`）核对。
- 包管理与脚本：一律 `bun`。
- 遵循 `web/default/AGENTS.md` 的 TS/组件/表单/路由/可访问性规范。
- 可访问性：主色与白字对比度达 WCAG AA（陶土橙 `oklch(0.56 …)` + 白字达标；浅底深字达标）。深浅模式都要验证。
- 不引入新的重型 UI 库；复用现有 Base UI/shadcn 组件，只重做样式与组合。
- 保留主题/字体/圆角/缩放/布局 5 轴自定义系统的可用性（只是预设内容换新）。

---

## 7. 分阶段执行计划

> 每阶段结束都应 `bun run build` 通过、明暗两模式自查、关键页截图比对。

**Phase 0 — 设计令牌基线（地基，必须最先做）**
- 改 `theme.css` 的 `:root` + `.dark` 为 §1 新色板；新增阴影 utility（`index.css`）。
- 精简 `theme-customization.ts`：删旧预设、加 4 个新派生预设、更新 swatches、设默认字体。
- 重写 `theme-presets.css`：删旧块、加新变体明/暗块。
- 验收：全站换底色不报错，配色抽屉只剩新预设，明暗切换正常。

**Phase 1 — 布局骨架**
- 侧栏分组重组（`use-sidebar-data.ts` + `app-sidebar.tsx`）。
- 顶栏（`app-header.tsx`）：余额胶囊 + 图标组 + 面包屑。
- 通用页面壳（`section-page-layout.tsx`）：serif 大标题 + 副标题 + Actions。
- 新建复用组件：`StatCard`、`shadow-soft`、进度条、角标 Badge。
- 验收：随便进一个 console 页，框架已是新风格。

**Phase 2 — 用户控制台核心页**（对照截图 1–6、8–13）
- 仪表盘 → API Keys → 日志 → 套餐/订阅 → 充值/钱包 → 优惠券 → 订单 → 个人设置/Playground/Chat。

**Phase 3 — 管理后台**
- users/channels/models/redemption-codes/subscriptions + 系统设置七区 + 站点&品牌配置可用性。

**Phase 4 — 公开与边缘页**
- 落地页、公开页头、定价、排行、关于、隐私/协议、认证页、错误页、setup 向导。
- Footer 重排（**保留版权归属**）。

**Phase 5 — 收尾**
- i18n 补齐 + `i18n:sync`；明暗 + 4 预设全量回归；可访问性对比度核查；`bun run build`；清理废弃 `console/*` 薄入口（重定向或删）。

---

## 8. web/classic 的处理

- `classic` 是 Semi Design 独立前端，与 default 不共享组件/样式，重构成本≈再做一遍。
- 运行时默认走 `default`，classic 仅在后台显式把 theme 设为 `"classic"` 时启用。
- **建议**：本次只重构 `default`；classic 维持原样并在运营层不暴露/不默认。若确需统一，单列为后续独立项目，不纳入本方案 Phase。
- 若决定彻底弃用 classic：需同步处理 `Dockerfile`（移除 `builder-classic` stage）、`router/web-router.go`（移除 `GetTheme()=="classic"` 分支）、`Makefile`、`web/package.json` workspace——属高风险改动，**需单独评估，不在本次默认范围**。

---

## 9. 验收清单

- [ ] 明亮/暗色双模式下，全站为奶油底 + 陶土橙主色，无残留冷灰/蓝。
- [ ] 配色抽屉仅含新默认 + 4 个派生预设，切换正常、swatch 正确。
- [ ] 侧栏分组（概览/开发/账户/系统/教程）+ 选中浅橙底，与截图一致。
- [ ] 顶栏余额胶囊 + 图标组 + 面包屑就位。
- [ ] 仪表盘/API Keys/日志/套餐/充值/优惠券/订单 七个核心页对齐截图。
- [ ] 管理后台与系统设置可用、风格统一。
- [ ] 落地/认证/错误/setup 页换新。
- [ ] Footer 右下角 new-api/QuantumNous 版权与归属**原样保留**。
- [ ] 站名/logo 可由系统设置覆盖。
- [ ] i18n 全覆盖（en/zh 必备），`i18n:sync` 无遗漏。
- [ ] 主色配白字对比度达 WCAG AA。
- [ ] `bun run build` 通过。

## 10. 风险点

- **token 全局生效**：Phase 0 改基础语义色会一次性影响全站，需立即回归明暗两模式。
- **硬编码颜色**：部分组件可能写死了 hex/Tailwind 具体色（如 `bg-blue-500`、`text-gray-900`），需 grep 排查并改为语义 token（`bg-primary`、`text-foreground` 等）。
- **图表库取色**：recharts/vchart 的 series 颜色需显式接 `--chart-*`，否则不会自动变。
- **footer i18n key 混淆**：归属串用了拼接/混淆 key，改 footer 布局时勿误删。
- **对比度**：暗色模式陶土橙需足够提亮，避免按钮文字不可读。
