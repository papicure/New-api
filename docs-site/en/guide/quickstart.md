---
title: "Make your first request in 5 minutes"
---

# Make your first request in 5 minutes

> Create an account, get an API key, and call PaPiCode from any OpenAI-compatible client.

**Sign in to PaPiCode**

Create an account with email or an enabled third-party login method.

**Get credits**

Redeem a code in the wallet page, or use an active subscription.

**Create an API key**

Create a key in the console and store it securely.

**Configure your client**

Use `https://www.papicure.de/v1` as the Base URL and paste your API key.

```
curl https://www.papicure.de/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.1",
    "messages": [{"role": "user", "content": "Hello PaPiCode"}]
  }'
```
