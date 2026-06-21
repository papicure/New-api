---
title: "Manage Claude Code profiles with CC Switch"
---

<PageBadge variant="info">Client</PageBadge>

# Manage Claude Code profiles with CC Switch

> CC Switch keeps PaPiCode as a separate profile and lets you switch between providers safely with one click.

## Use cases

<CardGrid :cols="3">
  <FeatureCard title="Multi-provider switch" eyebrow="Flexible">
    Keep the official setup, PaPiCode, and a backup profile side by side and switch on demand.
  </FeatureCard>
  <FeatureCard title="Per-project keys" eyebrow="Isolation">
    Give each project its own API key to isolate usage, debug requests, and contain risk.
  </FeatureCard>
  <FeatureCard title="Fallback for triage" eyebrow="Safety net">
    Temporarily swap to a known-good profile to isolate whether an issue is the client, network, or provider.
  </FeatureCard>
</CardGrid>

## Recommended values

| Field | Value |
| --- | --- |
| **Profile Name** | `papicure` |
| **Base URL** | `https://www.papicure.de` |
| **Auth Token** | `YOUR_API_KEY` |
| **Model** | Claude-compatible model from the console |

## Environment variables

```bash
export ANTHROPIC_BASE_URL="https://www.papicure.de"
export ANTHROPIC_AUTH_TOKEN="YOUR_API_KEY"
```

If your setup expects OpenAI-compatible variables, use:

```bash
export OPENAI_BASE_URL="https://www.papicure.de/v1"
export OPENAI_API_KEY="YOUR_API_KEY"
```

## Setup steps

<div class="steps">

1. **Create the PaPiCode profile** — Add a new profile in CC Switch, named `papicure` or after the project.
2. **Fill in endpoint and key** — Use Anthropic-style or OpenAI-compatible values depending on the client.
3. **Pick a model** — Use a model name exactly as shown in the PaPiCode console.
4. **Switch and reload** — Activate the PaPiCode profile, then restart the terminal or Claude Code so variables apply.
5. **Send a test request** — A short prompt is enough to confirm the network, key, and model are healthy.

</div>

## Common issues

<CardGrid :cols="2">
  <FeatureCard title="Still using old provider" eyebrow="Environment">
    <p><strong>Cause:</strong> The terminal or client kept the old environment variables.</p>
    <p><strong>Fix:</strong> Restart the terminal and client; check <code>env | grep -E "OPENAI|ANTHROPIC"</code>.</p>
  </FeatureCard>
  <FeatureCard title="Unauthorized" eyebrow="Key">
    <p><strong>Cause:</strong> Wrong or disabled API key, or a stray whitespace character.</p>
    <p><strong>Fix:</strong> Copy the key again or create a dedicated key for CC Switch.</p>
  </FeatureCard>
  <FeatureCard title="Model not found" eyebrow="Model">
    <p><strong>Cause:</strong> Wrong model name, or the model is unavailable for this group.</p>
    <p><strong>Fix:</strong> Copy the exact model name from the PaPiCode console.</p>
  </FeatureCard>
  <FeatureCard title="Connection refused / timeout" eyebrow="Network">
    <p><strong>Cause:</strong> The endpoint is unreachable, or a local proxy / DNS cache misbehaves.</p>
    <p><strong>Fix:</strong> Open <code>https://www.papicure.de</code> in a browser; switch network or disable conflicting proxies.</p>
  </FeatureCard>
  <FeatureCard title="Stuck on default model" eyebrow="Config">
    <p><strong>Cause:</strong> The profile's model field did not take effect.</p>
    <p><strong>Fix:</strong> Re-check the profile, restart Claude Code, and pick the model manually if needed.</p>
  </FeatureCard>
  <FeatureCard title="Request fails immediately" eyebrow="Credits">
    <p><strong>Cause:</strong> Not enough wallet balance, subscription quota, or pre-deduction headroom.</p>
    <p><strong>Fix:</strong> Open wallet and usage logs; redeem a code or switch to an available subscription.</p>
  </FeatureCard>
</CardGrid>

::: tip Triage tip
Keep only one set of Base URL and API key environment variables active at a time. Stacked variables can quietly override your switch.
:::
