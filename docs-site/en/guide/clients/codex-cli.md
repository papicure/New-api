---
title: "Use PaPiCode in Codex CLI"
---

<PageBadge variant="info">Client</PageBadge>

# Use PaPiCode in Codex CLI

> If your Codex CLI setup supports OpenAI-compatible configuration, use PaPiCode as the custom API entry.

```bash
export OPENAI_BASE_URL="https://www.papicure.de/v1"
export OPENAI_API_KEY="YOUR_API_KEY"
```

If your client uses a config file, set the equivalent Base URL and API key fields.

::: warning Security
Never commit API keys to a public repository. Prefer system environment variables or a local private config file.
:::
