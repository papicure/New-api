# 重构任务 — 建立「终端 / 代码」设计语言

> 这是一份**设计语言重构手册**,不是补丁清单。上一轮已经把颜色换成暖陶土橙 + 奶油米白(`theme.css` 已落地,不用动 token 值),但验收发现:**皮换了、魂没换**——落地页是静态页面,动画基建全部闲置,品牌图标是假的 lucide 占位符,终端窗口没有打字效果,组件还是 shadcn 默认长相,几处死链,页脚硬编码绕过了系统设置。一句话:**看上去仍然像 newapi / 100% 照搬 relaxycode,没有自己的设计语言。**
>
> 本次目标:**确立一套可识别的「终端 / 代码」母题**(typography + 纹理 + 动效 + 组件人格),把已有但闲置的动画基建接进落地页,并修掉所有验收问题。改的是**设计语言与交互层**,不是再换一次配色。
>
> 设计令牌一律复用 `web/default/src/styles/theme.css` 现有语义 token(`--primary`/`--card`/`--accent`/`--success`/`--info`/`--neutral-foreground` 等),**不得新写死颜色**。

---

## 0. 通用约束(所有任务都适用)

- 包管理与脚本一律 `bun`(在 `web/default/` 下)。
- 所有文案走 i18next:`useTranslation()` + `t('English key')`,新增 key 必须补全 `web/default/src/i18n/locales/{en,zh,fr,ru,ja,vi}.json`,完成后跑 `bun run i18n:sync` 确认 **0 缺失**。
- 颜色只用语义 token / Tailwind 语义类(`bg-primary`、`text-muted-foreground`、`border-border`、`text-success`…),**禁止** `bg-orange-500`、`#c2410c`、`oklch(...)` 这类硬编码进组件。新色阶若必须,加进 `theme.css` 的 token 层,不要散落在组件里。
- 明亮 + 暗色双模式都要自查(尤其深色终端窗口、径向光晕、纹理叠加在暗色下的对比度)。
- 所有动效必须有 `prefers-reduced-motion: reduce` 回退(参考 `AnimateInView` 已有写法:reduce 时直接落到终态、不播放过渡)。
- 每个阶段完成后 `bun run build:check`(`tsc -b && rsbuild build`)必须通过。
- 🔴 **红线(项目治理,不可触碰)**:页脚右下角 new-api / QuantumNous 项目归属串及其 i18n key(`footer.defaultCopyright`、`footer.newapi.projectAttributionSuffix`,指向 `github.com/QuantumNous/new-api`)**必须原样保留**,见 `footer.tsx` 的 `ProjectAttribution`。可以并存站名版权,但不得删除/替换/隐藏 newapi 归属。

---

## 1. 设计语言定义 —— 「终端 / 代码」母题

整套视觉要让用户一眼读出「这是给写代码的人用的 AI 网关」,而不是又一个通用 SaaS 落地页。母题由四个支柱构成,**每个页面、每个区块都要至少命中其中一个**,否则就是没贯彻设计语言。

### 1.1 Typography(三轴字体 + 新增 mono 轴)

现状:`theme.css` 只定义了 `--font-sans`(Public Sans)和 `--font-serif`(Lora + CJK 衬线),**没有 `--font-mono`**——终端 demo 现在用的是 Tailwind 兜底等宽栈,不可控。

要做:
1. 在 `theme.css` 的 `@theme inline` 块里**新增 `--font-mono` token**(放在 `--font-serif` 后面),栈建议:
   `'JetBrains Mono', 'Geist Mono', 'Fira Code', ui-monospace, 'SF Mono', 'Cascadia Code', Consolas, 'Liberation Mono', monospace;`
   字体走系统/CDN 自取即可,不强制打包 web font(避免体积);若要打包,用现有 `@fontsource` 方式并在 `index.css` 注释说明。
2. 三轴各司其职,形成**节奏对比**(这是脱离 shadcn 千篇一律 sans 的关键):
   - **serif(Lora)** = 情绪/编辑性大标题。所有 section 主标题、Hero H1、CTA 标题。已在用,保持。
   - **mono(新)** = 代码/技术信号。终端窗口、代码片段、版本号、CLI 命令、品牌厂商署名(`ANTHROPIC` / `OPENAI` / `GOOGLE`)、统计数字的单位后缀、Hero 上的小胶囊标签(`optimiz` 那种)、徽章里的 key/endpoint 文本。**凡是"机器会读的字符串"都走 mono**,这是母题最廉价也最有效的信号。
   - **sans(Public Sans)** = 正文/UI。副标题、段落、表单、菜单。
3. 自查:落地页随手一截,应能同时看到 serif 大标题、mono 技术串、sans 正文三种字形并存且层级分明。

### 1.2 纹理与材质(背景不再是纯色)

shadcn 默认是纯色背景 + 卡片,太干净=没人格。给「代码感」加两种**低调**纹理(都用 token 颜色 + 极低透明度,绝不喧宾夺主):

- **点阵网格(dot-grid)**:Hero 区与 CTA 区背景叠一层 `radial-gradient` 圆点网格(`--border` 色,opacity ≈ 0.4,间距 ≈ 22px),`mask-image` 做边缘羽化淡出。做成一个可复用工具类 `@utility bg-dot-grid`(放 `index.css`,对照已有的 `@utility shadow-soft`)。
- **扫描线 / 等高线(可选,克制)**:深色终端窗口、深色 CTA 卡内侧可叠一层极淡的水平扫描线(`repeating-linear-gradient`,opacity ≈ 0.03),强化 CRT/终端意象。暗色模式下尤其点睛。
- **径向品牌光晕**:`AiTools` 三张大卡的品牌色光晕保留(现已有 `bg-success/10 blur-3xl` 等),但要和 1.3 的真品牌图标绑定,光晕色 = 品牌色低饱和。

### 1.3 品牌锁定(Brand Lockup)—— 干掉假图标

现状 🔴:`landing-sections.tsx` 的 `AiTools` 用 lucide 的 `Cpu`(Claude)/`Bot`(Codex)/`Star`(Gemini)当图标,`WhyChooseUs` 的"多模型支持"用纯文字 `Badge` 写 `Claude/GPT/Gemini`。**这是最像"随便糊的"的地方。**

要做:全站涉及模型/厂商处,换成**真实品牌矢量 logo**,用项目已有的 lobe 图标加载器:
- 加载器:`web/default/src/lib/lobe-icon.tsx` 的 `getLobeIcon("Claude.Color", size)` / `getLobeIcon("OpenAI.Color", size)` / `getLobeIcon("Gemini.Color", size)`(`.Color` 是品牌彩色版;品牌 key 见 `web/default/src/features/home/constants.ts` 已有 `'OpenAI'`、`'Claude.Color'`、`'Gemini.Color'`)。
- `AiTools` 三卡图标位:Claude Code → `Claude.Color`,Codex → `OpenAI.Color`,Gemini CLI → `Gemini.Color`,放进现有 `size-24` 图标容器,配品牌色径向光晕。
- `WhyChooseUs`「多模型支持」卡:把文字 Badge 换成三个真彩色 logo 横排。
- 平台支持区(`PlatformSupport`)的 macOS/Windows/Linux 也尽量用更精致的图标(lucide 现状可接受,但灰度统一)。

### 1.4 命令行符号语汇(贯穿细节)

把 `$`、`>`、`✓`、`_`(光标)、`//`、`⌘` 这类终端符号当作**装饰性语汇**反复出现,形成记忆点:
- section 小标题前缀可用 mono 的 `// section-name` 或 `$ ` 样式(克制,1~2 处即可,别满屏)。
- 按钮/胶囊里 CTA 可带 `→`、`⌄`(已有)。
- FAQ 手风琴项前缀可用 `?` 或 `>` mono 符号。
- 列表勾选用 `✓`(已用 `CircleCheck`,可保留或换 mono `✓`,统一一种)。

---

## 2. 动画语言规范 —— 把闲置的基建接进落地页

现状 🔴:项目**已经造好了完整动画基建,但落地页一处都没用**——
- `web/default/src/components/animate-in-view.tsx`:`<AnimateInView animation="fade-up|fade-in|scale-in|fade-left|fade-right" delay threshold once>`,内部 IntersectionObserver + `prefers-reduced-motion` 回退,直接可用。
- `web/default/src/styles/index.css`:keyframes `landing-fade-up/fade-in/scale-in/fade-left/fade-right` 已定义;另有 `terminal-demo-blink/spin/pulse`(**当前 UNUSED**)、`scroll-up` 可用。
- `web/default/src/lib/motion.ts`:motion/react 的 variants(`MOTION_VARIANTS`、`STAGGER_VARIANTS`、`CARD_ITEM_VARIANTS` 等)+ `MOTION_TRANSITION`(`EASE_OUT_CUBIC = [0.33,1,0.68,1]`)。
- `page-transition.tsx`:页面级过渡封装。

**整体调性:克制的高级感(restrained premium)**——不是浮夸的视差和满屏弹跳,是"每个元素恰到好处地就位"。统一用 `EASE_OUT_CUBIC`,时长 150~350ms。

### 2.1 滚动入场(in-view)—— 落地页每个 section 必做

- `home/index.tsx` 渲染的 6 个区块(Hero / WhyChooseUs / AiTools / PlatformSupport / SharedPool / FAQAndCTA),**每个 section 的标题组 + 卡片组都包 `AnimateInView`**。
- 卡片网格用**错峰(stagger)**:同一行卡片按 index 递增 `delay`(如 `delay={index * 80}`),形成依次落位。`WhyChooseUs` 4 卡、`AiTools` 3 卡、`SharedPool` bento、FAQ 列表全部适用。
- `AiTools` 左右交替的大卡:左卡用 `fade-right`、右卡用 `fade-left`,呼应其左右交替版式。
- threshold/once 用默认即可(`once=true`,只播一次,避免来回滚动反复抖动)。

### 2.2 终端打字机(Hero 的灵魂)

现状 🔴:`hero-terminal-demo.tsx` 是**写死的静态文本**,只有结尾一个 `animate-pulse` 光标。这是最该动起来的地方却最死。

要做:把它改造成**逐行/逐字打字机**:
- 进入视口后,代码行**逐字符 typewrite** 显现(mono 字体),行末光标 `_` 用 `terminal-demo-blink`(已有 keyframe)做稳定闪烁,而非 `animate-pulse`。
- home 变体打完 `while(curious){...}` 代码块;auth 变体打完 `claude --version → v1.0.87 → claude "写一个快速排序" → ✓ 已连接...`(文案已存在,走 i18n)。
- 节奏:逐行延迟入场 + 逐字符 ≈ 每字 18~28ms,整段 ≈ 2~3s,循环或停在终态均可(建议打完停住,可选淡入再循环)。
- 实现可用 motion/react 或纯 setTimeout/state,但**必须 `prefers-reduced-motion` 回退**:reduce 时直接显示完整终态文本、光标静止。
- 抽成 home 与 auth **共用**组件(现已是 `HeroTerminalDemo`,带 `variant` prop,保持;打字逻辑做进同一组件)。

### 2.3 悬停微交互(组件人格的一半)

- **卡片 hover**:`WhyChooseUs`/`AiTools`/`SharedPool` 卡片 hover 时轻微 `-translate-y-0.5` + `shadow-soft → shadow-soft-lg` + `border-border/70 → border-primary/40`,过渡 150ms。让卡片"活"。
- **图标徽章 hover**:卡片 hover 时其图标容器 `bg-primary/10 → bg-primary/15` 或图标轻微 scale。
- **按钮**:主按钮 hover 维持现有,但加 `active:scale-[0.98]` 的按压反馈(全站 Button 统一)。
- **链接**:导航/页脚链接 hover 下划线从中间展开或左侧滑入(用 `bg-current` 伪元素 + `scale-x` 过渡),取代默认直接变色。

### 2.4 品牌"呼吸"动效(B4 区点睛)

`AiTools` 三张品牌卡的径向光晕做**极缓慢的呼吸**(opacity / scale 在 4~6s 周期内微幅起伏,`terminal-demo-pulse` 可复用或新增 keyframe),让品牌色光晕像"在线/活跃"的心跳。三卡错峰相位,避免齐闪。reduce 时静止。

### 2.5 页面切换

后台/认证页路由切换接 `page-transition.tsx` 的 `MOTION_VARIANTS.pageEnter`(已有 blur+y 位移),保证 SPA 跳转有连续感,而非硬切。

---

## 3. 组件人格化 —— 脱离 shadcn 默认长相

目标:让 Button / Card / Badge / Nav / Input 一眼区别于"未改的 shadcn"。**改的是这些 base 组件本身**(`web/default/src/components/ui/`),全站自动继承,不要在业务组件里逐个覆盖。

- **Card**(`ui/card.tsx`):默认更克制的 `border-border/70` + `shadow-soft`,hover 态见 2.3。考虑左上角或顶部加一条 1px 的 `--primary` accent(可选,克制),呼应"代码块"的左边线意象。
- **Button**(`ui/button.tsx`):主按钮维持陶土橙实心,但统一加 `active:scale-[0.98]` + 更明确的 focus-visible ring(`ring-primary/40`)。outline 变体 hover 时 `border-primary/50`。圆角随 `--radius`。
- **Badge**(`ui/badge.tsx`):技术标签类(版本、key、endpoint)走 **mono + 更小字号 + `border` 描边**风格,和普通 secondary badge 区分开。`AiTools` 的能力标签(`200K context` 等)用这种 mono 描边款。
- **Nav / Header**(`public-header.tsx`、`app-header.tsx`、`app-sidebar.tsx`):激活项的指示器用 `--primary` 的左竖条或下划线,而非整块 `bg-accent`。导航 hover 见 2.3 下划线展开。
- **Input**(认证页/表单):带前缀图标(邮箱/用户/锁/验证码),focus 时 `border-primary` + 极淡 `ring-primary/20`,label 走 mono 微强化技术感(克制)。

> 自查标准:把改后的某个卡片/按钮截图,和一个原版 shadcn demo 并排,应能明显看出"这不是默认皮"。

---

## 4. 必修问题清单(验收实测发现,逐条修掉)

### 4.1 死链(确认 2 处,排查全站)
- 🔴 `/docs`:`web/default/src/hooks/use-top-nav-links.ts` 当后台 `docs_link` 未配置时 fallback 到 `/docs` → 站内 404。改为:无 `docs_link` 时**隐藏该导航项**,或 fallback 到外部 `https://docs.newapi.pro`(与 Hero 的 `docsUrl` 兜底一致)。
- 🔴 `/models`:`footer.tsx` `fallbackColumns` 计费列里 `Model pricing → /models`,公开访客可能 404。核对路由表确认 `/models` 公开可达;不可达则改指 `/pricing`。
- 排查:`grep` 全站 `to='/` 与 `href='/`,逐一对照 `src/routes/` 实际存在的公开路由,清掉所有指向不存在/需登录页的公开链接。

### 4.2 页脚改为系统设置可配(现在硬编码)
- 🔴 现状:系统信息本身有"页脚"功能(`footerHtml` 来自 `useSystemConfig`,`footer.tsx` 223-245 用 `dangerouslySetInnerHTML` 渲染),但三列链接 `fallbackColumns`(164-219)**写死在组件里**,后台改不了。
- 要做:页脚三列链接 / 品牌简介 / 联系方式应**优先读系统设置**,仅在未配置时回落到 `fallbackColumns` 默认值。让管理员能在后台维护页脚链接,而不是改代码。(确认后台是否已有对应字段;若无,这部分以"结构上支持配置 + 合理默认"为准,不强行加后台表单——但默认值里的死链必须修对。)
- 🔴 归属红线见 §0,`ProjectAttribution` 原样保留。

### 4.3 接入闲置动画基建
- 见 §2.1~2.2:`AnimateInView` + stagger 接进全部 6 个 section;`HeroTerminalDemo` 打字机化;`terminal-demo-blink/pulse` keyframe 从 UNUSED 变 USED。

### 4.4 真品牌图标
- 见 §1.3:`AiTools` / `WhyChooseUs` 的 lucide 假图标 → `getLobeIcon('*.Color')`。

### 4.5 清理孤儿组件(死代码)
验收发现以下组件**无人引用**(落地页用的是 `sections/landing-sections.tsx` 和 `sections/hero.tsx` 的简化版,而非这些):
`home/components/` 下:`gateway-card.tsx`、`scrolling-icons.tsx`、`icon-card.tsx`、`stat-item.tsx`、`feature-item.tsx`、`hero-buttons.tsx`、`connection-line.tsx`;`home/components/sections/` 下:`cta.tsx`、`features.tsx`、`how-it-works.tsx`、`stats.tsx`。
- 处理:**二选一,别两可**。要么把本次重构所需的版式真正建立在这些组件上(如 `gateway-card`/`cta` 确实更适合承载 §1~§2 的设计,就改用它们并删掉简化版);要么确认简化版才是主线、`grep` 全仓确认零引用后**删除**这些孤儿文件。最终仓库里不允许留"两套并存、一套是死的"。删除前必须 `grep -rn "组件名" src/` 确认零 import。

---

## 5. 落地页 8 区块版式(对照 `imge/22-25.png`,在新设计语言下重排)

> 框架已存在(`home/index.tsx` + `sections/`),内容/文案基本就位。本节是**版式与设计语言的落点**,不是从零写文案。逐区块确认母题(§1)与动效(§2)都已命中。

- **B1 顶栏**(`public-header.tsx`):左 logo+站名;中导航(首页/定价/模型价格/使用教程/关于我们/AI工具下拉,沿用 `use-top-nav-links`,修死链);右语言/主题/登录/**免费注册(陶土橙实心)**。激活态用 §3 的竖条/下划线。
- **B2 Hero**(`sections/hero.tsx`):左列 mono 小胶囊 + serif 巨标题(第二行 `text-primary`)+ 副文案 + 三按钮;右列**深色 macOS 终端窗口**(`HeroTerminalDemo`,打字机化 §2.2,点阵网格背景 §1.2)。
- **B3 为什么选择我们**(`WhyChooseUs`):居中 serif 标题 + 4 列特性卡(stagger 入场 + hover 微交互),"多模型支持"用真品牌 logo。
- **B4 顶级 AI 编程工具**(`AiTools`):3 张横向大卡左右交替,**真品牌彩色 logo + 品牌色呼吸光晕**(§2.4),能力标签用 mono 描边 Badge(§3)。
- **B5 全平台支持**(`PlatformSupport`):macOS/Windows/Linux 横排,灰度统一。
- **B6 灵活拼车按需付费**(`SharedPool`):bento 网格(左高卡 + 右三小卡),勾选列表,stagger 入场。
- **B7 常见问题 + CTA**(`FAQAndCTA`):左 FAQ 手风琴(mono `?`/`>` 前缀,展开过渡顺滑),右**深色 CTA 卡**(扫描线纹理 §1.2)。
- **B8 Footer**(`footer.tsx`):左品牌简介 + 联系(QQ 群);右三列链接(系统设置可配 §4.2,死链修复);底部 **newapi 归属原样保留(红线)**。

---

## 6. 登录 / 注册页 split-screen(`src/features/auth/`)

> `auth-layout.tsx` 上一轮已改成左右分屏(左表单 + 右奶油渐变 `HeroTerminalDemo` auth 变体 + 三 CLI 胶囊),**结构 OK**。本轮只在新设计语言下补齐:

- 左栏表单字段套 §3 的**前缀图标 Input**(邮箱/用户/锁/验证码),focus 态 `border-primary` + 淡 ring。
- 右栏终端窗口同步 §2.2 **打字机**(auth 变体),三 CLI 胶囊用 mono + §2.3 hover。
- 右栏渐变叠 §1.2 点阵网格(暗色下注意对比度)。
- `< lg` 仅显示左栏并居中;忘记密码/OTP/重置沿用左栏样式。

---

## 7. 验收清单

- [ ] §1 母题落地:`--font-mono` token 已加;serif/mono/sans 三轴节奏分明;点阵网格工具类可复用;命令行符号语汇贯穿但克制。
- [ ] §1.3 真品牌图标:`AiTools`/`WhyChooseUs` 已用 `getLobeIcon('Claude.Color'/'OpenAI.Color'/'Gemini.Color')`,无 lucide 假占位。
- [ ] §2 动画接入:6 个 section 全部 `AnimateInView` + stagger;Hero/auth 终端**打字机生效**;`terminal-demo-blink` 等 keyframe 从 UNUSED 变 USED;卡片/按钮/链接 hover 微交互到位;品牌呼吸光晕;全部 `prefers-reduced-motion` 回退。
- [ ] §3 组件人格:Button/Card/Badge/Nav/Input 在 `ui/` 层改造,明显区别于默认 shadcn。
- [ ] §4 死链清零(`/docs`、`/models` 及全站排查);页脚结构支持系统设置 + 默认值死链修对;**孤儿组件已删或已真正启用,无两套并存**。
- [ ] §5/§6 落地页 8 区块 + 认证页 split-screen 在新设计语言下还原(对照 22-25 / 19-20.png),明暗双模式自查。
- [ ] 🔴 footer **new-api / QuantumNous 归属原样保留**。
- [ ] 无新增硬编码颜色;`bun run i18n:sync` 0 缺失;`bun run build:check` 通过。
