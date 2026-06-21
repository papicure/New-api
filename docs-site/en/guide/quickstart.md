---
title: "Make your first request in 5 minutes"
---

<PageBadge>Quickstart</PageBadge>

# Make your first request in 5 minutes

> Create an account, get an API key, and call PaPiCode from any OpenAI-compatible client.

<div class="steps">

1. **Sign in to PaPiCode** — Visit the [console](https://www.papicure.de) and create an account with email or any enabled third-party login.
2. **Get credits** — Redeem a code in the wallet page, or use an active subscription.
3. **Create an API key** — Open the API Key page in the console and store the new key securely.
4. **Configure your client** — Use `https://www.papicure.de/v1` as the Base URL and paste your API key.

</div>

## Verify the call

```bash
curl https://www.papicure.de/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.1",
    "messages": [{"role": "user", "content": "Hello PaPiCode"}]
  }'
```
