---
title: "LangChain / SDK 接入"
---

# LangChain / SDK 接入

> 只要 SDK 支持 OpenAI Compatible Base URL，就可以接入 PaPiCode。

## LangChain JS 示例

```
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

-   API Key 放在服务端环境变量中。
-   为不同业务创建不同 Key，便于统计和停用。
-   对用户输入做必要的安全过滤和日志脱敏。
