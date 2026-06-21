---
title: "Use PaPiCode in Trae"
---

<PageBadge variant="info">Client</PageBadge>

# Use PaPiCode in Trae

> Add PaPiCode as a custom OpenAI-compatible model provider in Trae.

<div class="steps">

1. **Open AI settings** — Go to AI, Models, Model Provider, or custom model settings.
2. **Add custom model** — Select OpenAI Compatible or Custom OpenAI Endpoint.
3. **Set endpoint** — Use `https://www.papicure.de/v1`. If Trae asks for the full endpoint, append the path it requests.
4. **Set key** — Paste your PaPiCode API key.
5. **Set model name** — Copy the exact model name from the PaPiCode console, including case and punctuation.
6. **Save and test** — Send a short request from chat or the code assistant panel.

</div>

## Common fields

| Field | Value |
| --- | --- |
| **API Format** | `OpenAI Compatible` |
| **Base URL** | `https://www.papicure.de/v1` |
| **API Key** | `YOUR_API_KEY` |
| **Model Name** | Available model in console |

::: tip Recommendation
Name the provider clearly, for example PaPiCode GPT or PaPiCode Claude, to avoid selecting the wrong provider.
:::
