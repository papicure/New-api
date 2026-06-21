---
title: "Use PaPiCode in Claude Code"
---

<PageBadge variant="info">Client</PageBadge>

# Use PaPiCode in Claude Code

> If your Claude Code version supports custom compatible endpoints, configure the PaPiCode URL and API key.

```bash
export ANTHROPIC_BASE_URL="https://www.papicure.de"
export ANTHROPIC_AUTH_TOKEN="YOUR_API_KEY"
```

::: warning Note
Client support varies by version. If your client expects OpenAI-compatible settings, use `https://www.papicure.de/v1` instead.
:::

## Troubleshooting tips

<CardGrid :cols="3">
  <FeatureCard title="Check the API key" eyebrow="Key">
    Make sure there are no trailing spaces or hidden characters around the token.
  </FeatureCard>
  <FeatureCard title="Check the balance" eyebrow="Credits">
    Confirm the account has available wallet balance or an active subscription.
  </FeatureCard>
  <FeatureCard title="Use the right URL" eyebrow="Endpoint">
    For OpenAI-compatible mode, use <code>https://www.papicure.de/v1</code>.
  </FeatureCard>
</CardGrid>
