---
title: "额度、余额和订阅如何消耗"
---

<PageBadge variant="info">计费</PageBadge>

# 额度、余额和订阅如何消耗

> PaPiCode 使用 Token 额度进行计费。余额和订阅额度是两种独立资金来源,系统会根据账户配置和可用额度自动选择扣费来源。

<CardGrid :cols="3">
  <FeatureCard title="余额" eyebrow="按量消耗">
    通过兑换码获得,可按量消耗。适合偶尔使用、临时补充额度。
  </FeatureCard>
  <FeatureCard title="订阅额度" eyebrow="独立额度池">
    套餐有效期内的独立额度池。适合固定周期、高频调用、团队协作。
  </FeatureCard>
  <FeatureCard title="分组线路" eyebrow="使用体验">
    不同套餐可能对应不同使用体验,匹配更高频、更稳定或更高规格的场景。
  </FeatureCard>
</CardGrid>

## 扣费顺序

通常有可用订阅额度时优先消耗订阅额度;订阅额度不足时,系统可能回落到钱包余额。具体以账户实际配置为准。
