---
title: "Use PaPiCode in CodeBuddy"
---

<PageBadge variant="info">Client</PageBadge>

# Use PaPiCode in CodeBuddy

> If your CodeBuddy version supports custom models, OpenAI Compatible providers, or custom API endpoints, configure PaPiCode as a provider.

<div class="steps">

1. **Open model settings** — Find Model, Provider, API Key, Custom Model, or OpenAI Compatible settings.
2. **Add a custom provider** — Select OpenAI Compatible. If unavailable, choose OpenAI and override the Base URL.
3. **Set Base URL** — Use `https://www.papicure.de/v1`. Do not append `/chat/completions`.
4. **Set API Key** — Paste the key created in the PaPiCode console. A dedicated key for CodeBuddy is recommended.
5. **Test a model** — Use a model name listed in your console and send a short prompt to verify.

</div>

## Recommended values

| Field | Value |
| --- | --- |
| **Provider Type** | `OpenAI Compatible` |
| **Base URL** | `https://www.papicure.de/v1` |
| **API Key** | `YOUR_API_KEY` |
| **Model** | Available model in console |

::: warning Version differences
Menu names vary between CodeBuddy releases. As long as a custom Base URL and API key can be set, the OpenAI-compatible path works.
:::
