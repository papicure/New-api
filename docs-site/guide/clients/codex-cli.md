---
title: "在 Codex CLI 中使用 PaPiCode"
---

<PageBadge variant="info">客户端</PageBadge>

# 在 Codex CLI 中使用 PaPiCode

> Codex CLI 若支持 OpenAI Compatible 配置,可将 PaPiCode 作为自定义 API 入口。

```bash
export OPENAI_BASE_URL="https://www.papicure.de/v1"
export OPENAI_API_KEY="YOUR_API_KEY"
```

如果客户端使用配置文件,请将 Base URL 和 API Key 填入对应字段。

::: warning 安全建议
不要把 API Key 写入公开仓库。建议使用系统环境变量或本地私有配置文件。
:::
