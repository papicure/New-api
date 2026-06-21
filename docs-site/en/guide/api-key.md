---
title: "Create and manage API keys"
---

<PageBadge>API Key</PageBadge>

# Create and manage API keys

> API keys authenticate client requests. Create separate keys for different tools and projects.

## Create steps

<div class="steps">

1. **Open the console** — Sign in and go to the API Key / Token management page.
2. **Create a new key** — Give it a clear name such as Cursor, Codex CLI, Chatbox, or your project name.
3. **Save the key** — The key is shown only once. Store it in a secure location.

</div>

## Recommended practices

<CardGrid :cols="3">
  <FeatureCard title="Separate by project" eyebrow="Isolation">
    Create different keys for Cursor, Codex CLI, automation scripts, and backend services so usage stays easy to trace.
  </FeatureCard>
  <FeatureCard title="Rotate regularly" eyebrow="Security">
    Disable or delete keys when a project ends or a key might have been exposed.
  </FeatureCard>
  <FeatureCard title="Keep keys private" eyebrow="Security">
    Never commit keys to public repositories, frontend bundles, or any user-visible configuration.
  </FeatureCard>
</CardGrid>
