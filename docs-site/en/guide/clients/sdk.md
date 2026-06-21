---
title: "LangChain and SDK integration"
---

<PageBadge>SDK</PageBadge>

# LangChain and SDK integration

> Any SDK that supports a custom OpenAI-compatible Base URL can connect to PaPiCode.

## LangChain JS example

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

## Backend usage tips

<CardGrid :cols="3">
  <FeatureCard title="Environment variables" eyebrow="Security">
    Store API keys in backend environment variables — never hard-code them into source files.
  </FeatureCard>
  <FeatureCard title="Per-project keys" eyebrow="Isolation">
    Use separate keys for each project so usage can be tracked and revoked independently.
  </FeatureCard>
  <FeatureCard title="Sanitize inputs" eyebrow="Compliance">
    Filter user input before sending it upstream and redact sensitive data from logs.
  </FeatureCard>
</CardGrid>
