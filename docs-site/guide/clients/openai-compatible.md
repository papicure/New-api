---
title: "OpenAI Compatible 接入"
---

<PageBadge>SDK</PageBadge>

# OpenAI Compatible 接入

> PaPiCode 提供 OpenAI Compatible API。多数支持自定义 Base URL 的客户端都可以直接接入。

## 通用配置

| 字段 | 值 |
| --- | --- |
| **Base URL** | `https://www.papicure.de/v1` |
| **API Key** | `YOUR_API_KEY` |
| **Chat Endpoint** | `/chat/completions` |

## Node.js 示例

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.PAPICODE_API_KEY,
  baseURL: "https://www.papicure.de/v1",
});

const res = await client.chat.completions.create({
  model: "gpt-5.1",
  messages: [{ role: "user", content: "Hello PaPiCode" }],
});
```

## Python 示例

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://www.papicure.de/v1"
)

resp = client.chat.completions.create(
    model="gpt-5.1",
    messages=[{"role": "user", "content": "Hello PaPiCode"}],
)
```
