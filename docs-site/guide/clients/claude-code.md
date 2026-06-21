---
title: "在 Claude Code 中使用 PaPiCode"
---

<PageBadge variant="info">客户端</PageBadge>

# 在 Claude Code 中使用 PaPiCode

> 如果您的 Claude Code 版本支持自定义兼容端点,可以配置 PaPiCode 的 Base URL 和 API Key。

```bash
export ANTHROPIC_BASE_URL="https://www.papicure.de"
export ANTHROPIC_AUTH_TOKEN="YOUR_API_KEY"
```

::: warning 注意
不同版本客户端对环境变量和兼容协议的支持可能不同,请以您当前客户端文档为准。
:::

## 排查建议

<CardGrid :cols="3">
  <FeatureCard title="检查 API Key" eyebrow="密钥">
    确认 API Key 前后没有多余空格。
  </FeatureCard>
  <FeatureCard title="检查余额" eyebrow="额度">
    确认账户有余额或可用订阅额度。
  </FeatureCard>
  <FeatureCard title="OpenAI 兼容" eyebrow="兼容">
    如果客户端要求 OpenAI Compatible,请使用 <code>https://www.papicure.de/v1</code>。
  </FeatureCard>
</CardGrid>
