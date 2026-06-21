---
title: "Manage Claude Code profiles with CC Switch"
---

# Manage Claude Code profiles with CC Switch

> Use CC Switch to keep PaPiCode as a separate profile and switch between providers safely.

## Recommended values

Profile Name`papicure`

Base URL`https://www.papicure.de`

Auth Token`YOUR_API_KEY`

Model`Claude-compatible model from console`

## Environment variables

```
export ANTHROPIC_BASE_URL="https://www.papicure.de"
export ANTHROPIC_AUTH_TOKEN="YOUR_API_KEY"
```

If your setup expects OpenAI Compatible variables, use:

```
export OPENAI_BASE_URL="https://www.papicure.de/v1"
export OPENAI_API_KEY="YOUR_API_KEY"
```

## Common issues

Symptom

Likely cause

Fix

Still using old provider

Old terminal environment is still active

Restart terminal and client; inspect OPENAI and ANTHROPIC environment variables.

Unauthorized

Wrong or disabled API key

Copy the key again or create a dedicated key for CC Switch.

Model not found

Wrong model name or unavailable group

Copy the exact model name from the console.

Timeout

Network, proxy, or long context issue

Test with a short prompt, check proxy settings, then retry.

Request fails immediately

Insufficient credits or subscription quota

Check wallet, subscription, and usage logs.
