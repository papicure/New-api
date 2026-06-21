---
title: "Troubleshooting"
---

<PageBadge variant="neutral">Triage</PageBadge>

# Troubleshooting

> Use this checklist when a client cannot call the API, returns errors, or consumes credits unexpectedly.

**Check Base URL**

Use `https://www.papicure.de/v1` and avoid duplicate `/v1/v1` or `/chat/completions`.

**Check API key**

Make sure the key is active and has no extra spaces.

**Check credits**

Your wallet or subscription must have available credits.

**Check model name**

Use a model listed in your console.

## Common errors and fixes

Error

Likely cause

Fix

401 / unauthorized

Wrong key, disabled key, or hidden whitespace

Copy the key again, create a test key, and avoid duplicating the Bearer prefix.

403 / no permission

Your group or route cannot access the model

Use a model available in your console or ask the administrator to confirm group permissions.

404 / model not found

Wrong model name

Copy the exact model name, including case, hyphens, and version suffixes.

429 / rate limited

Concurrency, frequency, or upstream route limit

Lower concurrency, reduce context, wait and retry, or use separate keys per client.

Credits exist but request fails

Pre-charge, subscription quota, request limit, or model permission issue

Check wallet, subscription, and usage logs; retry with a shorter prompt.

Timeout

Network, proxy, slow model, or long context

Test with a short prompt, check local proxy, reduce max tokens, and retry.

Streaming interrupted

Client streaming compatibility or connection interruption

Disable streaming for a test, upgrade the client, reduce output length, or switch model.

Old configuration remains active

Client cache, stale environment variables, or CC Switch did not apply

Restart the client and terminal; inspect environment variables; recreate the provider if needed.

Unexpectedly high usage

Long context, repeated history, Agent mode, or tool calls

Clear conversation history, reduce context, disable broad codebase indexing, and inspect usage logs.

Model list cannot refresh

Client does not call model list or expects a different URL format

Fill model names manually; use `https://www.papicure.de/v1`, or `https://www.papicure.de` if the client asks for a root URL.

## Quick self-check

```
curl https://www.papicure.de/v1/models   -H "Authorization: Bearer YOUR_API_KEY"
```

If the model list returns, your network and API key are basically working. Then focus on client Base URL, model name, and local cache.
