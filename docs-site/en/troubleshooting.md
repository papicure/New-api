---
title: "Troubleshooting"
---

<PageBadge variant="neutral">Triage</PageBadge>

# Troubleshooting

> Use this checklist when a client cannot call the API, returns errors, or consumes credits unexpectedly.

<div class="steps">

1. **Check Base URL** — Use `https://www.papicure.de/v1` and avoid duplicate `/v1/v1` or `/chat/completions`.
2. **Check API key** — Make sure the key is active and has no extra spaces.
3. **Check credits** — Your wallet or subscription must have available credits.
4. **Check model name** — Use a model listed in your console.

</div>

## Common errors and fixes

<CardGrid :cols="2">
  <FeatureCard title="401 / unauthorized" eyebrow="Auth">
    <p><strong>Cause:</strong> Wrong key, disabled key, or hidden whitespace from copy-paste.</p>
    <p><strong>Fix:</strong> Copy the key again, create a test key, and avoid duplicating the <code>Bearer</code> prefix.</p>
  </FeatureCard>
  <FeatureCard title="403 / no permission" eyebrow="Permission">
    <p><strong>Cause:</strong> Your group or route cannot access the model.</p>
    <p><strong>Fix:</strong> Use a model available in your console or ask the administrator to confirm group permissions.</p>
  </FeatureCard>
  <FeatureCard title="404 / model not found" eyebrow="Model">
    <p><strong>Cause:</strong> Wrong model name.</p>
    <p><strong>Fix:</strong> Copy the exact model name, including case, hyphens, and version suffixes.</p>
  </FeatureCard>
  <FeatureCard title="429 / rate limited" eyebrow="Throttle">
    <p><strong>Cause:</strong> Concurrency, frequency, or upstream route limit.</p>
    <p><strong>Fix:</strong> Lower concurrency, reduce context, wait and retry, or use separate keys per client.</p>
  </FeatureCard>
  <FeatureCard title="Credits exist but request fails" eyebrow="Credits">
    <p><strong>Cause:</strong> Pre-charge, subscription quota, request limit, or model permission issue.</p>
    <p><strong>Fix:</strong> Check wallet, subscription, and usage logs; retry with a shorter prompt.</p>
  </FeatureCard>
  <FeatureCard title="Timeout" eyebrow="Network">
    <p><strong>Cause:</strong> Network, proxy, slow model, or long context.</p>
    <p><strong>Fix:</strong> Test with a short prompt, check the local proxy, reduce <code>max_tokens</code>, and retry.</p>
  </FeatureCard>
  <FeatureCard title="Streaming interrupted" eyebrow="Stream">
    <p><strong>Cause:</strong> Client streaming compatibility or connection interruption.</p>
    <p><strong>Fix:</strong> Disable streaming for a test, upgrade the client, reduce output length, or switch model.</p>
  </FeatureCard>
  <FeatureCard title="Old configuration remains active" eyebrow="Cache">
    <p><strong>Cause:</strong> Client cache, stale environment variables, or CC Switch did not apply.</p>
    <p><strong>Fix:</strong> Restart the client and terminal; inspect environment variables; recreate the provider if needed.</p>
  </FeatureCard>
  <FeatureCard title="Unexpectedly high usage" eyebrow="Usage">
    <p><strong>Cause:</strong> Long context, repeated history, Agent mode, or extra tool calls.</p>
    <p><strong>Fix:</strong> Clear conversation history, reduce context, disable broad codebase indexing, and inspect usage logs.</p>
  </FeatureCard>
  <FeatureCard title="Model list cannot refresh" eyebrow="Compatibility">
    <p><strong>Cause:</strong> Client does not call the model list, or expects a different URL format.</p>
    <p><strong>Fix:</strong> Fill model names manually; use <code>https://www.papicure.de/v1</code>, or <code>https://www.papicure.de</code> if the client asks for a root URL.</p>
  </FeatureCard>
</CardGrid>

## Quick self-check

```bash
curl https://www.papicure.de/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

If the model list returns, your network and API key are basically working. Then focus on client Base URL, model name, and local cache.
