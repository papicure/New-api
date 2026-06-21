---
title: "How wallet and subscription credits are consumed"
---

<PageBadge variant="info">Billing</PageBadge>

# How wallet and subscription credits are consumed

> PaPiCode uses token credits for billing. Wallet balance and subscription credits are separate funding sources, and the system picks one based on account configuration.

<CardGrid :cols="3">
  <FeatureCard title="Wallet" eyebrow="Pay as you go">
    Credits obtained through redeem codes. Good for occasional usage or topping up an expiring subscription.
  </FeatureCard>
  <FeatureCard title="Subscription" eyebrow="Dedicated pool">
    A dedicated credit pool within a validity period. Best for recurring usage, heavy clients, and team workflows.
  </FeatureCard>
  <FeatureCard title="Groups & routes" eyebrow="Experience tier">
    Different plans may unlock different route experiences, matching higher-frequency or higher-stability needs.
  </FeatureCard>
</CardGrid>

## Deduction order

When subscription credits are available, they are usually consumed first; if the subscription pool is depleted, the system may fall back to the wallet balance. Actual behavior depends on the account configuration.
