---
title: "故障排查"
---

<PageBadge variant="neutral">排查</PageBadge>

# 故障排查

> 当客户端无法调用、返回异常或消耗异常时,可以按以下顺序排查。

<div class="steps">

1. **检查 Base URL** — OpenAI Compatible 客户端应填写 `https://www.papicure.de/v1`,不要重复添加 `/v1/v1` 或 `/chat/completions`。
2. **检查 API Key** — 确认密钥没有被禁用,复制时没有空格或换行。
3. **检查余额** — 确认账户有余额或有效订阅额度。
4. **检查模型名** — 模型名必须是控制台可用模型列表中的名称。

</div>

## 常见问题与解决方案

<CardGrid :cols="2">
  <FeatureCard title="401 / unauthorized" eyebrow="鉴权失败">
    <p><strong>可能原因:</strong> API Key 错误、被禁用,或复制时带入了隐藏空格。</p>
    <p><strong>解决:</strong> 重新复制 Key;确认 Key 未禁用;新建一个测试 Key;注意不要重复写入 <code>Bearer</code> 前缀。</p>
  </FeatureCard>

  <FeatureCard title="403 / no permission" eyebrow="权限不足">
    <p><strong>可能原因:</strong> 账户分组或渠道没有该模型权限。</p>
    <p><strong>解决:</strong> 到模型列表确认可用模型;切换到账户可用模型;联系管理员确认分组权限。</p>
  </FeatureCard>

  <FeatureCard title="404 / model not found" eyebrow="模型不存在">
    <p><strong>可能原因:</strong> 模型名称填写错误或当前分组不可用。</p>
    <p><strong>解决:</strong> 从控制台复制完整模型名;检查大小写、短横线、版本号;不要使用客户端默认却不存在的模型名。</p>
  </FeatureCard>

  <FeatureCard title="429 / rate limited" eyebrow="限流">
    <p><strong>可能原因:</strong> 并发、频率或渠道限流。</p>
    <p><strong>解决:</strong> 降低并发;缩短上下文;稍后重试;为不同工具使用不同 API Key 方便定位。</p>
  </FeatureCard>

  <FeatureCard title="余额充足但请求失败" eyebrow="额度异常">
    <p><strong>可能原因:</strong> 预扣额度、订阅额度、单次请求上限或模型权限不满足。</p>
    <p><strong>解决:</strong> 查看钱包余额、订阅状态和用量日志;减少上下文和输出长度后重试。</p>
  </FeatureCard>

  <FeatureCard title="请求超时" eyebrow="网络异常">
    <p><strong>可能原因:</strong> 网络不稳定、模型响应慢、上下文过长或本地代理异常。</p>
    <p><strong>解决:</strong> 先用短问题测试;检查本地代理;换网络;降低 max tokens;关闭不必要的工具调用。</p>
  </FeatureCard>

  <FeatureCard title="流式输出中断" eyebrow="Stream 异常">
    <p><strong>可能原因:</strong> 客户端流式兼容性、网络中断或上游连接被断开。</p>
    <p><strong>解决:</strong> 关闭 stream 测试;升级客户端;减少输出长度;重试同一模型或切换备用模型。</p>
  </FeatureCard>

  <FeatureCard title="一直显示旧配置" eyebrow="配置未生效">
    <p><strong>可能原因:</strong> 客户端缓存、环境变量未刷新或 CC Switch 未真正切换。</p>
    <p><strong>解决:</strong> 重启客户端和终端;检查环境变量;删除旧 provider 后重新添加;确认当前选择的是 PaPiCode 配置。</p>
  </FeatureCard>

  <FeatureCard title="消耗比预期高" eyebrow="额度异常">
    <p><strong>可能原因:</strong> 上下文太长、重复发送历史消息、开启了 Agent/工具调用。</p>
    <p><strong>解决:</strong> 清理对话历史;降低上下文长度;关闭自动索引或大范围代码库读取;查看用量日志定位模型和请求。</p>
  </FeatureCard>

  <FeatureCard title="模型列表无法刷新" eyebrow="兼容性">
    <p><strong>可能原因:</strong> 客户端没有调用模型列表接口或 Base URL 格式不兼容。</p>
    <p><strong>解决:</strong> 手动填写模型名;确认 Base URL 是 <code>https://www.papicure.de/v1</code>;如客户端要求根地址则填写 <code>https://www.papicure.de</code>。</p>
  </FeatureCard>
</CardGrid>

## 快速自检

```bash
curl https://www.papicure.de/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

如果模型列表能返回,说明网络和密钥基本正常。若客户端仍失败,优先检查客户端的 Base URL、模型名和本地缓存。
