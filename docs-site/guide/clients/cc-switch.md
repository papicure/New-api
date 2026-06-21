---
title: "使用 CC Switch 管理 Claude Code 配置"
---

<PageBadge variant="info">客户端</PageBadge>

# 使用 CC Switch 管理 Claude Code 配置

> CC Switch 适合在多个 Claude Code 或兼容供应商之间切换。可把 PaPiCode 保存为一个独立配置,方便一键切换和回退。

## 适用场景

<CardGrid :cols="3">
  <FeatureCard title="多供应商切换" eyebrow="灵活">
    同时保留官方配置、PaPiCode 配置和备用配置,需要时快速切换。
  </FeatureCard>
  <FeatureCard title="多人或多项目" eyebrow="隔离">
    为不同项目准备不同 API Key,方便隔离用量、定位问题和控制风险。
  </FeatureCard>
  <FeatureCard title="排障回退" eyebrow="兜底">
    调用异常时临时切换到备用配置,判断是客户端、网络还是供应商问题。
  </FeatureCard>
</CardGrid>

## PaPiCode 配置值

| 字段 | 值 |
| --- | --- |
| **Profile Name** | `papicure` |
| **Base URL** | `https://www.papicure.de` |
| **Auth Token** | `YOUR_API_KEY` |
| **Model** | 选择控制台可用 Claude 兼容模型 |

## 环境变量方式

```bash
export ANTHROPIC_BASE_URL="https://www.papicure.de"
export ANTHROPIC_AUTH_TOKEN="YOUR_API_KEY"
```

如果您的 Claude Code 或 CC Switch 版本要求 OpenAI Compatible 格式,则使用:

```bash
export OPENAI_BASE_URL="https://www.papicure.de/v1"
export OPENAI_API_KEY="YOUR_API_KEY"
```

## 配置步骤

<div class="steps">

1. **新建 PaPiCode 配置** — 在 CC Switch 中新增一个 profile,命名为 `papicure` 或项目名称。
2. **填写端点与密钥** — 根据工具要求填写 Anthropic 或 OpenAI Compatible 的 Base URL 与 API Key。
3. **选择模型** — 模型名使用 PaPiCode 控制台展示的可用模型,不要自行简写或改大小写。
4. **保存后切换** — 切换到 PaPiCode profile 后,重新打开终端或重启 Claude Code,让环境变量生效。
5. **发起测试** — 先发送一条短请求,确认网络、密钥和模型都正常。

</div>

## 常见异常

<CardGrid :cols="2">
  <FeatureCard title="切换后仍走旧供应商" eyebrow="环境变量">
    <p><strong>原因:</strong> 终端或客户端还保留旧环境变量。</p>
    <p><strong>处理:</strong> 关闭当前终端重新打开;检查 <code>env | grep -E "OPENAI|ANTHROPIC"</code> 的输出。</p>
  </FeatureCard>
  <FeatureCard title="提示 unauthorized" eyebrow="鉴权">
    <p><strong>原因:</strong> API Key 错误、复制了空格、密钥被禁用。</p>
    <p><strong>处理:</strong> 重新复制密钥;确认 Key 状态正常;为 CC Switch 单独创建新 Key 测试。</p>
  </FeatureCard>
  <FeatureCard title="提示 model not found" eyebrow="模型">
    <p><strong>原因:</strong> 模型名不在当前账户可用列表中。</p>
    <p><strong>处理:</strong> 回到 PaPiCode 控制台复制模型名,确认账户分组有该模型权限。</p>
  </FeatureCard>
  <FeatureCard title="connection refused / timeout" eyebrow="网络">
    <p><strong>原因:</strong> 网络无法访问端点、本地代理异常或 DNS 缓存问题。</p>
    <p><strong>处理:</strong> 浏览器打开 <code>https://www.papicure.de</code> 检查连通性;切换网络或关闭冲突代理。</p>
  </FeatureCard>
  <FeatureCard title="一直使用默认模型" eyebrow="配置">
    <p><strong>原因:</strong> CC Switch profile 中模型字段未生效。</p>
    <p><strong>处理:</strong> 检查 profile 的模型字段;保存后重启 Claude Code;必要时在客户端设置中手动选择模型。</p>
  </FeatureCard>
  <FeatureCard title="请求开始后很快失败" eyebrow="额度">
    <p><strong>原因:</strong> 余额不足、订阅额度耗尽或预扣额度不够。</p>
    <p><strong>处理:</strong> 进入钱包和用量日志查看余额;兑换额度或更换可用订阅。</p>
  </FeatureCard>
</CardGrid>

::: tip 排障建议
同时只保留一组生效的 Base URL 和 API Key。多套环境变量叠加时,客户端可能读取优先级最高的一组,导致看起来"切换了但没有生效"。
:::
