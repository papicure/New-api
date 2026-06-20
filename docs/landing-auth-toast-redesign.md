# 重构任务 — 落地页 + 登录注册页 + Toast 提示弹窗

> 承接 `docs/ui-revamp-plan.md` 的 ClaudeCode 风格体系（暖陶土橙 + 奶油米白 + serif 大标题）。本文档是三个独立改造任务：A 修 Toast、B 重做落地页、C 重做认证页。
> 设计令牌、字体、圆角、阴影一律复用 `theme.css` 现有语义 token（`--primary` / `--card` / `--accent` 等），**不得新写死颜色**。
> 参考截图在 `imge/`：落地页 = `22/23/24/25.png`，登录注册页 = `19/20.png`，Toast 现状问题 = 对话中绿色「成功创建 1 个 API 密钥」。

---

## 通用约束（三个任务都适用）

- 包管理与脚本一律 `bun`（在 `web/default/` 下）。
- 所有文案走 i18next：`useTranslation()` + `t('English key')`，新增 key 补 `web/default/src/i18n/locales/{en,zh,fr,ru,ja,vi}.json`，完成后跑 `bun run i18n:sync` 确认 0 缺失。
- 颜色只用语义 token / Tailwind 语义类（`bg-primary`、`text-muted-foreground`、`border-border`…），禁止 `bg-orange-500` 这类硬编码。
- 明亮 + 暗色双模式都要自查。
- 每个任务完成后 `bun run build:check`（`tsc -b && rsbuild build`）必须通过。
- 文案直接沿用参考截图那一套中文（下文已逐条给出），英文 key 取其语义。

---

## Part A — 修复 Toast 提示弹窗

**问题**：`src/routes/__root.tsx` 的 `<Toaster … richColors />` 开了 `richColors`，让 sonner 套用自带的浓郁薄荷绿/大红，盖掉了 `src/components/ui/sonner.tsx` 里已经调好的暖色语义 token（`--success`/`--destructive` 经 `color-mix` 混入 `--popover` 的柔和版本）。再加关闭按钮常驻外挂，整体与奶油暖调割裂。

**改法**：
1. `src/routes/__root.tsx`：移除 `<Toaster>` 上的 `richColors` 属性（保留 `closeButton duration={5000} position='top-center'`）。这样 toast 自动回落到 `sonner.tsx` 已定义的柔和暖色方案。
2. `src/components/ui/sonner.tsx`：
   - 保持现有 CSS 变量映射不动（已正确）。
   - 关闭按钮改为**默认隐藏、hover 时显形**，且定位贴入卡片右上角内侧（不要浮在外侧）。用 sonner 的 `toastOptions.classNames.closeButton` 或全局 CSS：`[data-sonner-toast] [data-close-button]{ opacity:0; transition:opacity .15s } [data-sonner-toast]:hover [data-close-button]{ opacity:1 }`，并把 `left`/`top` 调到卡片内右上。
   - 确认成功态视觉：暖橄榄绿描边 + 奶油底 + 主文字深棕，而非纯绿。
3. 验收：触发一次成功 toast（如创建 API Key），应为柔和暖色卡片、圆角随 `--radius`、关闭按钮 hover 才出现；暗色模式同样协调。

---

## Part B — 落地页重构（`src/features/home/`）

落地页框架已存在（`sections/hero.tsx`、`features.tsx`、`cta.tsx` 及 `components/` 下的 `hero-terminal-demo.tsx`、`feature-item.tsx`、`gateway-card.tsx`、`icon-card.tsx`、`connection-line.tsx`）。按下列 8 区块**重排版式与内容**，复用现有组件，缺的新建。顶栏 `public-header` 和 footer 见对应说明。

### B1. 顶栏（已有 `public-header.tsx`）
- 左 logo + 站名；中导航：首页 / 定价 / 模型价格 / 使用教程 / 关于我们 / AI工具（下拉）；右：语言、主题、登录、**免费注册（陶土橙实心 CTA）**。
- 仅做配色与排版对齐，导航数据沿用现有 `use-top-nav-links`。

### B2. Hero（对照 22.png 上半）
- 左列：
  - 小胶囊标签「optimiz」（浅橙底 + 星形图标）。
  - serif 巨标题两行：`用自然语言` / `构建未来`（**第二行用 `text-primary` 橙色**）。
  - 副文案：「告别复杂配置，即刻接入 Claude Code、Codex、Gemini CLI 等顶级 AI 编程工具。无论你是开发者还是企业团队，都能在这里找到合适的解决方案。」
  - 三按钮：`立即开始 →`（陶土橙实心）、`模型价格`（描边）、`获取 Claude Code ⌄`（描边带下拉）。
- 右列：**深色 macOS 代码窗口**（复用/改造 `hero-terminal-demo.tsx`）：标题栏红黄绿三点；卡片内顶部「✦ Welcome to Claude Code」浅色块；下方代码片段（`Think harder... _` 光标 + `while(curious){ question_everything(); dig_deeper(); connect_dots(unexpected); } if(stuck){ keep_thinking(); }`）语法高亮。窗口用深炭底（暗色 token），与奶油页面形成对比。

### B3. 为什么选择我们（22.png 下半）
- 居中标题「为什么选择我们」(serif) + 副标题「简单、强大、可靠。我们重新定义 AI 编程体验。」
- 4 列特性卡（`feature-item`）：图标徽章（圆角浅橙底）+ 标题 + 描述：
  - 零配置接入 / 多模型支持 / 拼车共享 / 成本优化（文案见 22.png）。
  - 「多模型支持」卡图标位放三个模型 logo（Claude/GPT/Gemini）。

### B4. 顶级 AI 编程工具（23.png）
- 居中标题「顶级 AI 编程工具」+ 副标题「一个平台，接入全球最强大的 AI 编程助手」。
- 3 张**横向大卡**（`gateway-card`），**左右交替**布局（图标左→右→左），图标带**品牌色径向光晕**：
  - Claude Code（ANTHROPIC 出品，橙晕）— 标签：200K 上下文窗口 / 深度代码理解 / 安全可控输出。
  - Codex（OPENAI 出品，绿晕）— 标签：多语言支持 / 实时代码补全 / 自然语言转代码。
  - Gemini CLI（GOOGLE 出品，蓝晕）— 标签：多模态理解 / 命令行原生 / 极速响应。
- 文案见 23.png；光晕用径向渐变，颜色取各品牌色但低饱和，不破坏暖调主基。

### B5. 全平台支持（24.png 顶）
- 小标题「全平台支持」+ 三个平台图标（macOS / Windows / Linux）横排，灰度图标 + 标签。

### B6. 灵活拼车，按需付费（24.png 中）
- 居中标题「灵活拼车，**按需付费**」(第二段橙) + 副标题「多种订阅方式，让 AI 编程更经济实惠。与其他用户共享资源池，享受相同的强大功能。」
- **bento 卡片网格**：左侧一张高卡「共享池模式」（图标 + 描述 + 勾选列表：智能负载均衡 / 成本降低 60% / 无需排队等待）；右侧 3 张小卡：安全隔离 / 同等体验 / 即开即用（文案见 24.png）。

### B7. 常见问题 + CTA（24.png 底）
- 居中标题「常见问题」+ 副标题「还有疑问？我们来解答」。
- 左：FAQ 手风琴（如何开始使用？/ 支持哪些 AI 模型？/ … 复用现有 collapsible）。
- 右：**深色 CTA 卡**「准备好开始了吗？」+ 「立即体验 AI 编程的强大能力。无需信用卡。」+ 主色按钮（复用 `cta.tsx`）。

### B8. Footer（`src/components/layout/components/footer.tsx`）
- 视觉照 25.png：左品牌 logo + 一句话简介 + 联系按钮（如 QQ 群）；右三列链接（服务透明 / 隐私与安全 / 计费与套餐）；底部版权行。
- 🔴 **红线**：底部版权**必须保留现有 new-api / QuantumNous 项目归属串及其 i18n key**（`footer.defaultCopyright`、`footer.newapi.projectAttributionSuffix` 等，指向 `github.com/QuantumNous/new-api`）。可以新增你的站名版权与「© year 站名」并存，但**不得删除/替换/隐藏 newapi 归属**。改的是布局与配色，不是归属内容。

---

## Part C — 登录 / 注册页 split-screen（`src/features/auth/`）

现状 `auth-layout.tsx` 是居中单卡片，改为**左右分屏**（对照 19/20.png）。

- 改 `auth-layout.tsx` 为两栏栅格：
  - **左栏**（白/卡片底，承载表单 children）：顶部品牌 logo + 站名；serif 大标题「欢迎回来」+ 副标题（登录页「账号密码登录」/ 注册页「邮箱注册」，可由页面传入）；登录/注册 **tab 切换**；表单字段带**前缀图标**（邮箱/用户/锁/验证码）；陶土橙实心提交按钮；底部协议勾选「登录即代表你同意…《用户协议》和《隐私政策》」。
  - **右栏**（奶油渐变底，`lg` 以上显示，移动端隐藏）：serif 巨标题「开启你的 **AI 编程** 之旅」（关键词橙，注册页可用「体验」）；副标语「提供 Claude Code · Codex · Gemini CLI，顶级 AI 编程助手接入」；**复用 `hero-terminal-demo`** 终端窗口（`claude --version` → `Claude Code v1.0.87` → `claude "写一个快速排序算法"` → `✓ 已连接 Claude Code，正在生成 …`）；下方三个 CLI 胶囊标签：Claude Code / Codex / Gemini CLI。
- 把终端 demo 抽成可在 home 与 auth 共用的组件（若当前耦合在 home，提取到 `src/components/` 或 `src/features/auth` 可复用位置）。
- 登录 `sign-in/` 与注册 `sign-up/` 复用同一 `auth-layout`，仅左栏表单不同；忘记密码/OTP/重置等页沿用左栏样式（右栏可保留或简化）。
- 响应式：`< lg` 仅显示左栏并居中；终端文案走 i18n；暗色模式适配右栏渐变与终端对比度。

---

## 验收清单

- [ ] A：toast 为柔和暖色、关闭按钮 hover 才现、明暗协调，`richColors` 已移除。
- [ ] B：落地页 8 区块按 22-25 还原，文案 i18n，光晕/bento/FAQ/深色 CTA 到位。
- [ ] B：footer 重排后 **new-api/QuantumNous 归属原样保留**。
- [ ] C：登录/注册为 split-screen，右栏终端 demo + CLI 标签，移动端隐藏右栏。
- [ ] 无新增硬编码颜色；`i18n:sync` 0 缺失；`bun run build:check` 通过；明暗双模式自查。
