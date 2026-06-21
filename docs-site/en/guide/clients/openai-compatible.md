---
title: "OpenAI-compatible integration"
---

# OpenAI-compatible integration

> Most clients that support a custom OpenAI Base URL can use PaPiCode directly.

## General configuration

Base URL`https://www.papicure.de/v1`

API Key`YOUR_API_KEY`

Chat Endpoint`/chat/completions`

## Node.js example

```
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

## Python example

```
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
