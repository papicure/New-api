# 全站 UI 重构总体方案(逐步开发版)

> 这是统领本次前端重构的**主文档**,按 Phase 拆成可独立开发、独立验收的步骤,供后续逐步实现。范围:**整个后台控制台 + 落地页 + 认证页 + Toast**,亮/暗双模式同等打磨。
>
> 设计方向来自对一套同类参考后台的视觉学习(布局、间距、排版、圆角、阴影、表格、卡片、按钮、徽章、动效规律),**做原创复刻**——只学视觉规律,**不复制任何品牌名、文案、账号或私有数据**。
>
> 核心判断:**我们的前端基建已经成熟**(完整 oklch token 体系、统一 `data-table`、VChart 图表、`page-transition`/`motion.ts` 动画基建、`preset/font/radius/scale` 四轴主题、base-ui primitives)。所以"焕然一新"的杠杆**不在配色、不在推倒基建**,而在三处:**① 布局骨架 ② 组件气质 ③ 信息层次**。本方案据此组织。

---

## 〇、通用约束(所有 Phase 都适用)

- 包管理与脚本一律 `bun`(在 `web/default/` 下)。每个 Phase 收尾 `bun run build:check`(`tsc -b && rsbuild build`)必须通过。
- 颜色**只用语义 token / Tailwind 语义类**(`bg-primary`、`text-muted-foreground`、`border-border`、`text-success`…),禁止 `bg-orange-500`、`#c2410c`、裸 `oklch(...)` 写进组件。新色阶进 `src/styles/theme.css` token 层,不散落组件。
- 文案走 i18next:`useTranslation()` + `t('English key')`,新增 key 补全 `src/i18n/locales/{en,zh,fr,ru,ja,vi}.json`,Phase 收尾跑 `bun run i18n:sync` 确认 **0 缺失**。
- **亮 + 暗双模式**每个组件都要自查(`.dark` token 已在 `theme.css:176+`,新增样式必须在两套 token 下都成立)。
- 所有动效必须有 `prefers-reduced-motion: reduce` 回退(后台 motion 组件用 `useReducedMotion()`,CSS 用 `@media (prefers-reduced-motion: reduce)`)。
- 底层 primitive 是 **`@base-ui/react`(不是 Radix)**:直接照搬 shadcn 片段会因 `render` prop / `useRender` / `mergeProps` 模式而失败,改组件时参考现有 `components/ui/*` 已有写法。
- 🔴 **红线(项目治理)**:页脚 new-api / QuantumNous 项目归属串及其 i18n key(`footer.defaultCopyright`、`footer.newapi.projectAttributionSuffix`,指向 `github.com/QuantumNous/new-api`)**必须原样保留**(见 `footer.tsx` 的 `ProjectAttribution`)。可并存站名版权,但不得删除/替换/隐藏。

---

## 一、设计语言基线(全 Phase 共享的视觉规范)

### 1.1 配色(已对位,只需补齐用法)
token 已落地于 `theme.css`,**不要改 token 数值**,只规范用法:
- **主色** `--primary` 陶土橙 `oklch(0.56 0.13 42)`:激活态、主按钮、强调数字、链接、进度条填充。
- **背景** `--background` 奶油;**侧栏** `--sidebar`(比背景略深一档);**卡片** `--card` 近纯白。
- **文字** `--foreground` 深暖棕 / `--muted-foreground` 灰棕。
- **语义色** `--success`(绿,金额/成功)、`--destructive`(红,危险/慢耗时告警)、`--warning`(黄)、`--info`(蓝)、外加紫(可用 `--chart-*`)——用于日志类型、状态点、状态徽章。
- **图表** `--chart-1..5`,VChart 主题随之切换(改 `lib/vchart.ts` 的 `VCHART_OPTION` 而非散写)。

### 1.2 字体三轴(新增 mono 轴)
- **serif**(Lora,`--font-serif` 已有)= 编辑性大标题:页面 H1、区块标题、Hero、CTA。
- **sans**(Public Sans,`--font-sans` 已有)= 正文/UI。
- 🆕 **mono**:`theme.css` 目前**没有 `--font-mono`**。在 `@theme inline` 块新增:
  `--font-mono: 'JetBrains Mono', 'Geist Mono', 'Fira Code', ui-monospace, 'SF Mono', Consolas, 'Liberation Mono', monospace;`
  用于**所有"机器读的字符串"**:请求 ID、API key、token 数、命令/代码块、版本号、倍率/endpoint 标签、统计单位。这是后台"技术感"最廉价有效的信号。

### 1.3 圆角 / 阴影 / 间距(复刻参考规律)
- **圆角**:卡片 `--radius`(≈14–16px)、按钮/输入 `--radius-md`、徽章胶囊 full、小元素 `--radius-sm`。阶梯已由 `--radius` 派生(`theme.css:87-93`),沿用。
- **阴影**(极轻,已有 `@utility shadow-soft / shadow-soft-lg`):普通卡 `shadow-soft`(≈`0 1px 2px /.05`);**特色暖卡**用橙黄柔光叠加(参考规律:`rgba(234,88,12,.08) 4 4 8` + `rgba(251,191,36,.06) inset`)——新增一个 `@utility shadow-warm`(token 化,用 `--primary`/`--warning` 的 color-mix,别写死 rgb)。
- **间距**:gap 主力 8/4px,卡内 padding 20–24px,区块间 24px。密度随 `data-theme-scale` 可调,保持。

### 1.4 动效规律(克制的高级感)
- 统一缓动 `EASE_OUT_CUBIC`(`lib/motion.ts` 已定义),时长 0.15s(色/影)/0.2–0.35s(位移)。
- 入场:路由切换 `pageEnter`(已挂 `AnimatedOutlet`);卡片组 `StaggerContainer`(已有);列表/表格行 stagger(CSS `tableRowEnter` 已有,`index.css:571-603`)。
- 参考站的招牌动效:**KPI 数字滚动入场**、**卡片网格错峰 `staggerAppear`(每张 +0.06s)**、**hover lift**(`index.css:545-559` 已有)。
- 全部 `prefers-reduced-motion` 回退。

---

## 二、Phase 总览

| Phase | 主题 | 产出 | 依赖 |
|---|---|---|---|
| **P0** | 设计令牌与地基 | mono 字体、`shadow-warm`、面包屑启用前置、动效工具确认 | — |
| **P1** | 布局骨架重构 | 侧栏全高 + 主区独立顶栏 + 面包屑 | P0 |
| **P2** | 通用组件气质 | data-table / card / badge / stat-card / code-block / progress 重塑 | P0 |
| **P3** | Dashboard 概览页 | 门面重排(KPI/配额/趋势图/Quick setup/列表) | P1,P2 |
| **P4** | 后台功能页逐页 | keys / logs / prices / users / channels / wallet / profile / system-settings | P2,P3 |
| **P5** | 落地页 + 认证页 + Toast | 终端母题落地、动画接入、真品牌图标、死链、孤儿清理、split 认证、toast | P0,P2 |
| **P6** | 暗色打磨 + 全局验收 | 双模式逐页核对、回归、i18n、build | 全部 |

> 开发顺序建议 P0 → P1 → P2 → P3 → P4 → P5 → P6。P2 与 P1 可并行(组件层 vs 骨架层),但 P3 依赖两者。

---

## Phase 0 — 设计令牌与地基

**目标**:把后续所有 Phase 依赖的底层规范一次性铺好,避免散落返工。

**涉及文件**
- `src/styles/theme.css`(`@theme inline` 块,`:root` 与 `.dark`)
- `src/styles/index.css`(`@utility` 区)

**改法**
1. 新增 `--font-mono` token(见 §1.2),并在 `@theme inline` 暴露为 `--font-mono` 供 `font-mono` 类使用。若走打包字体,用现有 `@fontsource` 方式在 `index.css` import;否则系统/CDN 兜底。
2. 新增 `@utility shadow-warm`(暖色柔光阴影,§1.3),亮/暗各给一组(暗色降透明度)。
3. 确认已有 `@utility bg-dot-grid` / `bg-scanlines` / `terminal-panel`(Explore 报告显示已存在)可复用,P3/P5 会用到;若实现不完整则补齐。
4. 不动 token 数值;若 P3 图表需要,确认 `--chart-1..5` 在暗色下对比度足够。

**验收**:`font-mono` 渲染出等宽字;`shadow-warm` 在亮暗下都柔和不脏;`build:check` 通过。

---

## Phase 1 — 布局骨架重构(最大杠杆)

**目标**:从"顶栏全宽横跨 + 下方 sidebar+inset"改成"**侧边栏全高(logo 在侧栏顶)+ 主区独立顶栏(面包屑栏)**"。这是"焕然一新"的最大来源。

**涉及文件**
- `src/components/layout/components/authenticated-layout.tsx`(布局根,现 `34-60`:`SidebarProvider flex-col` → Header 全宽 → `flex-1` 下 Sidebar+Inset)
- `src/components/layout/components/app-header.tsx`(顶栏,现含 TopNav/Search/BalancePill/Notification/Language/ConfigDrawer/Profile)
- `src/components/layout/components/header.tsx`(header 壳,现 `sticky top-0 z-40 bg-background/85 backdrop-blur-xl`)
- `src/components/layout/components/app-sidebar.tsx`(侧栏)
- `src/components/layout/components/nav-group.tsx`(分组渲染)
- `src/components/layout/components/section-page-layout.tsx`(面包屑 slot 在 `91-93`,**已存在未启用**)
- `src/components/ui/sidebar.tsx`(`SIDEBAR_WIDTH='13rem'` 等常量在 `48-53`)

**改法**
1. **结构翻转**:`authenticated-layout` 改为 `SidebarProvider`(横向默认)→ `<div class="flex">` 内左 `<AppSidebar>`(全高,含 logo)右 `<SidebarInset>`(内部顶部放新的 `<AppHeader>` 面包屑栏 + 下方 `<AnimatedOutlet>`)。即 header 从"全宽顶部"移到"主区内部顶部"。
2. **Logo 进侧栏顶**:把 `system-brand`(logo+系统名)从 header 移到 `app-sidebar` 顶部;侧栏顶部同时放折叠按钮(`SidebarTrigger`)。
3. **顶栏瘦身为面包屑栏**:`app-header` 左侧渲染**面包屑**(`Dashboard › 当前页`,带页面图标)——启用 `section-page-layout` 的 `.Breadcrumb` slot 或在 header 直接根据路由生成;右侧保留 BalancePill / Notification / Language / ConfigDrawer / Profile(顺序不变)。`Search` 可保留。`TopNav` 水平导航在后台可移除(导航已在侧栏)。
4. **侧栏加宽**:`SIDEBAR_WIDTH` `13rem → 15rem`;折叠态 `2.75rem` 保留(折叠变 dropdown 的逻辑 `nav-group.tsx:205-257` 保留)。
5. **分组样式**:组小标题(`OVERVIEW/DEVELOP/ACCOUNT/SYSTEM/GUIDE`)用 11px 大写 `text-muted-foreground` 字重 500;激活项=`bg-sidebar-accent` 浅橙圆角块 + 左侧图标 + `text-sidebar-accent-foreground`;hover 态微底色。底部用户卡保留。
6. **导航数据**沿用 `hooks/use-sidebar-data.ts`(不改信息架构,只改视觉);`useSidebarConfig` 的 admin×user 权限过滤语义**必须保留**。System Settings 的 drill-in 视图(`sidebar-view-registry`)继续工作,`← Back` 头沿用。
7. **滚动/sticky**:主区顶栏在 `SidebarInset` 内 `sticky top-0`,主区独立滚动;侧栏自身全高 `h-svh` 固定。

**验收**:刷新任意后台页,视觉应是"左全高侧栏(顶 logo)+ 右主区(顶面包屑栏 + 内容)";折叠/展开、移动端 drawer、System Settings drill-in、键盘 `Ctrl/Cmd+B` 都正常;亮暗双模式协调;`build:check` 通过。

---

## Phase 2 — 通用组件气质(改一次,全站生效)

**目标**:让基础组件脱离"通用 admin"气质,贴合参考站的克制精致。**改 `components/ui/*` 与 `components/data-table/*` 基础层**,业务页自动继承。

**涉及文件与改法**

1. **表格** `src/components/data-table/core/*`(`data-table-view`、`data-table-row`、`data-table-header`、`column-header`、`badge-cell`、`pagination`):
   - 去掉竖向分隔线,仅保留**行底细线**(`border-border/60`)。
   - 表头:大写、`text-xs`、`text-muted-foreground`、字重 500、字距微开。
   - ID / token 数 / 金额用 `font-mono`;金额成功绿、慢耗时(duration)`text-destructive`、可点值 `text-primary`。
   - 行 hover `bg-table-header`(token 已有);行高放松。
   - 分页/`Load more` 居中、低调。
   - 行入场 stagger 复用 `index.css` 现有 CSS(确认生效)。

2. **卡片** `src/components/ui/card.tsx` / `titled-card.tsx`:默认 `border-border/70` + `shadow-soft` + `--radius`;hover 可选 `-translate-y-0.5 + shadow-soft-lg`(列表卡用);特色卡可选 `shadow-warm`。

3. **StatCard** `src/components/ui/stat-card.tsx`(全局版)+ `src/features/dashboard/components/ui/stat-card.tsx`(带 sparkline 版):统一为"**小圆角浅橙底图标(`bg-primary/10 text-primary`)+ 灰标签 + 大数字**",数字可接 KPI 滚动动效。

4. **徽章** `src/components/ui/badge.tsx`:新增"技术款"变体——`font-mono` + 小字 + 描边,用于倍率(1x/2x/0.2x)、endpoint(`/v1/messages`)、key 片段;状态款(Running 橙底、200 绿底)沿用语义色。

5. **代码块**:抽一个可复用 `CodeBlock`(浅 `bg-muted` 底 + `font-mono` + 右上 Copy 按钮 + 可选 tab 切换)。Dashboard Quick setup、落地页终端、文档片段共用。放 `src/components/`。

6. **进度条** `src/components/ui/progress.tsx`:细圆角轨 + `bg-primary` 填充 + 入场过渡。

7. **按钮** `src/components/ui/button.tsx`:主按钮维持陶土橙实心,统一加 `active:scale-[0.98]` 按压反馈 + `focus-visible:ring-primary/40`;outline hover `border-primary/50`。(变体集合 `25-58` 已较定制,只微调气质。)

**验收**:Logs/Keys 等现有列表自动换上新表格气质;StatCard/Badge/Progress 在亮暗下都对;`build:check` 通过。

---

## Phase 3 — Dashboard 概览页(门面)

**目标**:把概览页重排成参考站那种"一眼专业"的密度与节奏。

**涉及文件**(`src/features/dashboard/`)
- `index.tsx`(`147-307`,overview 走 `OverviewDashboard`)
- `components/overview/overview-dashboard.tsx`、`summary-cards.tsx`、`api-info-panel.tsx`、`announcements-panel.tsx`、`faq-panel.tsx`、`uptime-panel.tsx`、`performance-health-panel.tsx`
- `components/ui/panel-wrapper.tsx`、`components/ui/stat-card.tsx`
- 图表:`lib/vchart.ts`、`components/models/model-charts.tsx`

**版式(自上而下)**
1. **顶部 KPI 行**:4 张 StatCard(余额 / 今日 / 本周 / API Keys 计数),新气质 + 数字滚动入场。
2. **Profile 卡 + 套餐配额卡**并列:配额卡用 `Progress` 橙色进度(日/周/总配额),到期天数标签。
3. **用量趋势**:面积折线图(VChart),橙色渐变填充(`--chart-1` → 透明),改 `VCHART_OPTION` 主题而非散写。
4. **Quick setup**:`CodeBlock` + Claude Code / Codex tab 切换,Windows / Linux-macOS 两段命令 + Copy。
5. **底部双栏**:左 Recent requests(新表格气质)/ 右 Groups 列表卡(名称 + 倍率徽章 + 来源标签 + 右侧状态点/锁)。
6. 帮助横幅、Setup guide hero 保留但套新卡气质。

**验收**:概览页对照参考节奏重排到位,图表暖色渐变,Quick setup 可 tab+复制,KPI 有滚动入场;管理员/普通用户两种可见性都正常;亮暗双模式;`build:check` 通过。

---

## Phase 4 — 后台功能页逐页

**目标**:在 P1 骨架 + P2 组件 + P3 范式定调后,逐页套用,消除残留"旧皮"。每页一个独立可验收单元。

> 通用做法:页面套 `SectionPageLayout`(serif H1 + 描述 + Actions),列表走统一 `data-table`,卡片/徽章/进度条用 P2 新气质,弹窗 `dialogs/` 沿用但核对配色。下面列每页重点。

- **API Keys** `features/keys/index.tsx`:顶部 hero 卡(`shadow-warm` 浅橙底 + Create key 主按钮带 caret)+ Groups 网格卡(倍率徽章/来源/绿勾-锁)+ Key 详情卡(状态点 + 掩码 key + 图标信息行 + chips + 操作:View/Edit/Disable/Delete-红)。
- **Usage Logs** `features/usage-logs/index.tsx`:顶部 In-flight 实时卡(Live 点)+ 4 KPI(Requests/Cost/Avg latency/Success)+ 筛选条(model 下拉 / status / 搜索 / Search 主按钮)+ 主表格(ID/Model/Status/Group/Rate/Stream/耗时/Tokens/Cost,mono+语义色)。
- **Prices / Models** `features/pricing/index.tsx`、`features/models/index.tsx`:左 filter 侧栏(Vendor/Group/Billing/Status 的 chip,选中橙底带计数徽章)+ 右模型卡网格(2 列;模型 logo + 名 + vendor/endpoint chips + Rate + MATCHED GROUPS + INPUT/OUTPUT/CACHE 价格田字格)+ 网格/列表切换 + `staggerAppear` 入场。模型 logo 用 `lib/lobe-icon.tsx`(真品牌图标)。
- **Users** `features/users/index.tsx`:管理员表格,角色/状态彩色徽章,批量操作沿用 `data-table-bulk-actions`。
- **Channels** `features/channels/index.tsx`:渠道表格 + 测试/编辑 drawer(`channel-mutate-drawer.tsx` 等)核对新气质。
- **Wallet** `features/wallet/index.tsx`:充值/订单/转账/邀请——KPI 卡 + 表格 + 充值表单(前缀图标 Input)。
- **Redemption Codes / Subscriptions** `features/redemption-codes`、`features/subscriptions`:列表 + 创建弹窗,套新气质。
- **Profile** `features/profile/index.tsx`:分区大卡(签到日历 / Passkey / 2FA / 语言 / 安全 / sidebar modules),沿用 P2 卡 + 列表项(图标+标题+副标题+右箭头,危险项红)。
- **System Settings** `features/system-settings/*`(site/auth/billing/content/models/operations/security/integrations/general/maintenance/request-limits):drill-in 侧栏视图保留;每个子区用 `Field`/`Form` 组件 + 分区卡;**Settings 主页范式**参考"Billing mode 单选卡(选中橙边+橙 radio)+ Security 列表项(危险红)"。
- **Playground / Chat** `features/playground`、`features/chat`:套骨架与配色,交互保持。

**验收**:逐页核对——无残留旧表格/旧卡片/裸色;每页 i18n 完整;亮暗双模式;每页 `build:check` 通过。可按页提交,便于"逐步开发"。

---

## Phase 5 — 落地页 + 认证页 + Toast

> 本 Phase 整合既有两份细化文档:`docs/ui-design-language-rebuild.md`(终端/代码母题、动画接入、真品牌图标、死链、孤儿清理)与 `docs/landing-auth-toast-redesign.md`(落地 8 区块 / 认证 split-screen / toast)。以下为执行要点,细节查那两份。

**5A. Toast**:`src/routes/__root.tsx` 的 `<Toaster>` **移除 `richColors`**(它盖掉了 `sonner.tsx` 已调好的暖色语义),关闭按钮改为默认隐藏、hover 显形并贴入卡片右上内侧。

**5B. 落地页**(`src/features/home/`)——确立"终端/代码"母题:
- 动画基建已接入(`AnimateInView` + `hero-terminal-demo.tsx` 逐字打字机 + `terminal-demo-blink`/`landing-animate-*` CSS 均已落地)。本轮**重点是验收回炉**(见 5D),而非重做。
- **真品牌图标**:`landing-sections.tsx` 的 `AiTools`/`WhyChooseUs` 把 lucide `Cpu/Bot/Star` 假占位换成 `getLobeIcon('Claude.Color'/'OpenAI.Color'/'Gemini.Color')`(`lib/lobe-icon.tsx`,品牌 key 见 `features/home/constants.ts`)。
- **点阵/扫描线纹理**(`bg-dot-grid`/`bg-scanlines`)用于 Hero、CTA、终端窗口;mono 字体贯穿技术串。
- **8 区块版式**对照参考重排(Hero / 为什么选择我们 / 顶级 AI 工具左右交替大卡+品牌呼吸光晕 / 全平台 / 拼车 bento / FAQ+深色 CTA / Footer)。
- **死链修复**:`hooks/use-top-nav-links.ts` 的 `/docs` fallback(无 `docs_link` 时隐藏或指向外部文档);`footer.tsx` `fallbackColumns` 的 `/models` 核对公开可达,否则改 `/pricing`;全站 `to='/'`/`href='/'` 排查。
- **页脚系统设置可配**:三列链接优先读 `useSystemConfig`,未配置回落 `fallbackColumns`;🔴 newapi 归属红线保留。
- **孤儿组件**:`home/components/` 下 `gateway-card/scrolling-icons/icon-card/stat-item/feature-item/hero-buttons/connection-line` 及 `sections/{cta,features,how-it-works,stats}` ——确认零引用后删除,或真正启用,**不留两套并存**。

**5C. 认证页**(`src/features/auth/`):`auth-layout.tsx` 已是 split-screen(左表单 + 右终端 demo + CLI 胶囊),补齐:左栏前缀图标 Input(邮箱/锁/验证码,focus `border-primary`)、右栏终端打字机同步、右栏渐变叠点阵纹理、`<lg` 仅左栏。

**5D. 落地页/认证页验收回炉(本轮必修——上一轮 P5 实施后人工验收发现的真实缺陷)**

> 说明:动画与终端母题的**代码层已存在且已构建进 dist**。下列问题是"接入残留",必须逐条修掉,不要重写已有动画基建。

1. 🔴 **未注册 i18n key 被当字面量显示**(最显眼,优先修)。下列 key 在 `locales/*.json` 中**全部不存在**,i18next 直接把 key 原文渲染到页面上:
   | 文件:行 | 错误显示文字 | 用途 | 建议英文 key(同时补 6 语言) |
   |---|---|---|---|
   | `sections/hero.tsx:47` | `optimiz` | Hero 顶部徽章 | `Built for AI coding` |
   | `sections/landing-sections.tsx:205` | `toolchain-lockup` | 工具链区 eyebrow | `Toolchain` |
   | `sections/landing-sections.tsx:116` | `why-newapi` | 为何选择区 eyebrow | `Why us` |
   | `sections/landing-sections.tsx:326` | `pool.scheduler` | 拼车/调度区 eyebrow | `Smart routing` |
   | `sections/landing-sections.tsx:412` | `faq.help` | FAQ 区 eyebrow | `Help` |
   - 修法:把这些占位 key 换成**英文源字符串**(本项目 i18n key = 英文原文),并在 `en/zh/fr/ru/ja/vi` 六个 locale 全部补齐,`bun run i18n:sync` 必须 0 缺失。**禁止再用 `optimiz`/`xxx.yyy` 这类非英文占位串**。
   - 收尾全局自查:`grep -rEn "t\('[a-z][a-z.-]*'\)" src/features/home/` 不应再出现非英文句子的短 key。

2. **"没有动画"的根因排查**:代码与 dist CSS(`landing-animate-*`、`terminal-demo-blink`)均在,若仍肉眼无动画,按序排查并修复:
   - 操作系统/浏览器是否开启"减弱动态效果"(触发全局 `prefers-reduced-motion: reduce` → 动画被置 `none`)。这是预期回退,**确认是否为该原因导致的误判**,而非代码缺陷。
   - 打字机节奏:`hero-terminal-demo.tsx` 的 `TYPE_SPEED_MS=22` 偏快、几乎瞬间打完,调成可感知节奏(如 28–40ms,或按字符数动态)。确认 IntersectionObserver `threshold: 0.35` 在首屏即触发(首屏元素可能一进入就过阈,核对真的有逐字过程)。
   - `AnimateInView` 首屏元素:Hero 在首屏,确认 `threshold/rootMargin` 下能正常触发入场,而非"加载时已在视口内、观察器错过首帧"。
   - 卡片 hover-lift、品牌呼吸光晕(`terminal-demo-pulse`)是否真接到对应元素上。

3. 其余 5A/5B/5C 既有验收项(死链、孤儿、真品牌图标、认证 split、toast 暖色、🔴 newapi 归属)按原条目核对。

**验收**:toast 暖色协调;落地页 8 区块有滚动/打字/呼吸动效、真品牌图标、无死链、无孤儿、**无未翻译占位串**;认证 split 完整;红线归属在;`bun run i18n:sync` 0 缺失;亮暗双模式;`build:check` 通过。

---

## Phase 6 — 暗色打磨 + 全局验收

**目标**:双模式同等质量收口,全站回归。

**做法**
1. **逐页过暗色**:背景层次(`background`/`sidebar`/`card` 三档暖炭灰要拉得开)、边框可见性(`--border` 暗色是 `oklch(1 0 0 /10%)`,卡叠卡时确认不糊)、`shadow-warm`/纹理在暗色下不脏、图表 `--chart-*` 对比度、终端窗口与深色 CTA 在暗底上的区分度。
2. **交互态全查**:hover/active/focus-visible/disabled 在亮暗都成立;`prefers-reduced-motion` 全局回退有效。
3. **响应式**:移动端侧栏 drawer、表格→卡片视图(`MobileCardList`)、落地页 `<lg` 折叠。
4. **回归**:`bun run i18n:sync` 0 缺失;`bun run build:check` 通过;主题四轴(preset/font/radius/scale)切换不破版。

**验收清单**
- [ ] P1 骨架:侧栏全高+logo+面包屑顶栏,折叠/drill-in/移动端/快捷键全正常。
- [ ] P2 组件:表格/卡片/StatCard/徽章/代码块/进度条新气质,全站继承。
- [ ] P3 概览:KPI 滚动 + 配额进度 + 暖色趋势图 + Quick setup tab + 列表卡。
- [ ] P4 各功能页无残留旧皮,逐页 i18n + 双模式。
- [ ] P5 落地页终端母题 + 动画 + 真品牌图标 + 死链清零 + 孤儿清理 + 认证 split + toast;🔴 newapi 归属保留。
- [ ] P6 亮暗双模式同等质量;响应式;reduced-motion;主题四轴不破版。
- [ ] 全程无硬编码颜色;`i18n:sync` 0 缺失;`build:check` 通过。
