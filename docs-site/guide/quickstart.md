---
title: "5 分钟完成第一次调用"
---

<PageBadge>快速开始</PageBadge>

# 5 分钟完成第一次调用

> 按照下面步骤创建账号、获取 API Key,并在 OpenAI Compatible 客户端中完成第一次调用。

<div class="steps">

1. **注册或登录 PaPiCode** — 访问 [控制台](https://www.papicure.de),使用邮箱或已启用的第三方登录方式创建账号。
2. **获取额度** — 进入钱包页面,使用兑换码充值;如果您已购买订阅套餐,也可以直接使用订阅额度。
3. **创建 API Key** — 进入 API Key 页面,创建一个新的密钥并妥善保存。
4. **配置客户端** — 将 Base URL 设置为 `https://www.papicure.de/v1`,API Key 填入刚创建的密钥。

</div>

## 验证调用

```bash
curl https://www.papicure.de/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.1",
    "messages": [{"role": "user", "content": "Hello PaPiCode"}]
  }'
```
