---
title: "模型与价格说明"
---

<PageBadge variant="info">模型</PageBadge>

# 模型与价格说明

> PaPiCode 支持多种模型和客户端协议。实际可用模型以控制台模型列表为准。

::: tip 计费提示
模型调用会根据输入 Token、输出 Token、缓存 Token、工具调用和账户分组等因素计算额度消耗。
:::

<CardGrid :cols="3">
  <FeatureCard title="高性能模型" eyebrow="复杂任务">
    适合复杂推理、代码生成、长上下文任务。常用于 Claude Code、Codex CLI、Cursor Agent。
  </FeatureCard>
  <FeatureCard title="轻量模型" eyebrow="低成本">
    速度快,适合常规问答、摘要、分类。匹配日常助手、批处理、低成本调用。
  </FeatureCard>
  <FeatureCard title="多模态模型" eyebrow="视觉">
    支持图像理解或生成能力,适合截图分析、视觉内容处理。
  </FeatureCard>
</CardGrid>
