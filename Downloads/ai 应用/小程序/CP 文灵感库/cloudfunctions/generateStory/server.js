const express = require('express');
const dotenv = require('dotenv');
const { buildPrompt, generateSampleStory } = require('./index.js');

// 加载环境变量
dotenv.config();

const app = express();
app.use(express.json());

// 故事生成接口
app.post('/api/generate', async (req, res) => {
  try {
    const story = generateSampleStory(req.body);
    res.json({ success: true, data: story });
  } catch (error) {
    console.error('生成故事失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '生成故事失败，请重试' 
    });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
