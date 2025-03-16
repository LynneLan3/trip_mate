# 故事生成云函数配置指南

## 环境变量配置

在微信云开发控制台中配置以下环境变量：

- `DEEPSEEK_API_KEY`: Deepseek API 密钥

### 配置步骤

1. 登录微信开发者工具
2. 点击云开发控制台
3. 选择"环境变量"
4. 点击"新建环境变量"
5. 添加变量：
   - 变量名：`DEEPSEEK_API_KEY`
   - 变量值：您的 Deepseek API Key
   - 备注：Deepseek API 密钥（可选）

## 安全注意事项

- 请勿在代码中直接硬编码 API Key
- 定期更换 API Key 以提高安全性
- 监控 API 使用情况，设置合理的使用限制

## 错误处理

云函数会处理以下类型的错误：

- `MISSING_API_KEY`: 未配置 API Key
- `API_ERROR`: API 调用失败
- `INVALID_PROMPT`: 无效的生成提示
- `RATE_LIMIT`: 达到 API 调用限制
- `UNKNOWN`: 未知错误

## 配置参数

可以在 `index.js` 中的 `CONFIG` 对象调整以下参数：

```javascript
const CONFIG = {
  API_URL: 'https://api.deepseek.com/v1/chat/completions',
  MODEL: 'deepseek-chat',
  MAX_RETRIES: 3,           // API 调用重试次数
  RETRY_DELAY: 1000,        // 重试延迟（毫秒）
  DEFAULT_TEMPERATURE: 0.7,  // 生成文本的随机性
  DEFAULT_MAX_TOKENS: 4000   // 最大生成字数
}
```

## 部署说明

1. 确保已安装所有依赖：
   ```bash
   npm install
   ```

2. 上传并部署云函数：
   - 在微信开发者工具中右键点击 `generateStory` 文件夹
   - 选择"上传并部署：云端安装依赖"

## 调试建议

1. 使用云开发控制台的"云函数日志"查看运行日志
2. 测试时可以使用较短的提示文本
3. 注意监控 API 的响应时间和错误率
