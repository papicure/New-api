---
title: "LangChain / SDK 接入"
---

<PageBadge>SDK</PageBadge>

# LangChain / SDK 接入

> 只要 SDK 支持 OpenAI Compatible Base URL,就可以接入 PaPiCode。

## LangChain JS 示例

```js
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  apiKey: process.env.PAPICODE_API_KEY,
  configuration: {
    baseURL: "https://www.papicure.de/v1",
  },
  model: "gpt-5.1",
});
```

## 服务端调用建议

<CardGrid :cols="3">
  <FeatureCard title="环境变量" eyebrow="安全">
    API Key 放在服务端环境变量中,不要写入代码仓库。
  </FeatureCard>
  <FeatureCard title="按业务隔离" eyebrow="隔离">
    为不同业务创建不同 Key,便于统计用量、单独停用和定位问题。
  </FeatureCard>
  <FeatureCard title="输入过滤" eyebrow="合规">
    对用户输入做必要的安全过滤,对调用日志做敏感信息脱敏。
  </FeatureCard>
</CardGrid>
