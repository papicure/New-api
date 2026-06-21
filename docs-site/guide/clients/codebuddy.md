---
title: "在 CodeBuddy 中使用 PaPiCode"
---

# 在 CodeBuddy 中使用 PaPiCode

> 如果您使用的 CodeBuddy 版本支持自定义模型、OpenAI Compatible 或自定义 API 地址，可以将 PaPiCode 配置为模型供应商。

**打开模型设置**

进入 CodeBuddy 的设置页，查找 Model、Provider、API Key、Custom Model 或 OpenAI Compatible 相关配置。

**新增自定义服务商**

服务商类型选择 OpenAI Compatible；如果没有该选项，可选择 OpenAI 并修改 Base URL。

**填写接口地址**

Base URL 填写 `https://www.papicure.de/v1`，不要额外添加 `/chat/completions`。

**填写 API Key**

使用 PaPiCode 控制台创建的 API Key。建议为 CodeBuddy 单独创建一个 Key。

**选择模型测试**

选择控制台中可用的模型名称，发送一条短消息验证是否能正常返回。

## 推荐填写

Provider Type`OpenAI Compatible`

Base URL`https://www.papicure.de/v1`

API Key`YOUR_API_KEY`

Model`选择控制台可用模型`

**版本差异**

不同 CodeBuddy 版本的菜单名称可能不同。只要能配置自定义 Base URL 和 API Key，就按 OpenAI Compatible 方式接入。
