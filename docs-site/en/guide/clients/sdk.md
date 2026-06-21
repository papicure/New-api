---
title: "LangChain and SDK integration"
---

# LangChain and SDK integration

> Any SDK that supports a custom OpenAI-compatible Base URL can connect to PaPiCode.

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

## Backend usage tips

-   Store API keys in backend environment variables.
-   Create separate keys for different projects.
-   Sanitize user input and redact sensitive logs.
