---
title: "在 Trae 中使用 PaPiCode"
---

# 在 Trae 中使用 PaPiCode

> Trae 支持在模型配置中添加自定义模型服务。将 PaPiCode 的 OpenAI Compatible 地址填入后，即可通过统一额度调用模型。

**进入 AI / 模型设置**

打开 Trae 设置，进入 AI、Models、Model Provider 或自定义模型配置区域。

**添加自定义模型**

服务商选择 OpenAI Compatible 或 Custom OpenAI Endpoint。

**配置 Base URL**

填写 `https://www.papicure.de/v1`。如果 Trae 要求填写完整接口地址，再按页面提示补充对应路径。

**配置密钥**

API Key 填写 PaPiCode 控制台创建的密钥。

**填写模型名**

模型名必须与 PaPiCode 控制台可用模型列表一致，大小写和符号都要一致。

**保存并测试**

保存后在聊天或代码助手面板中发起一次简单请求。

## 常见填写项

API Format`OpenAI Compatible`

Base URL`https://www.papicure.de/v1`

API Key`YOUR_API_KEY`

Model Name`控制台可用模型名`

**建议**

如果 Trae 内置模型和自定义模型同时存在，建议给 PaPiCode 模型加上清晰名称，例如 PaPiCode GPT 或 PaPiCode Claude，避免选错供应商。
