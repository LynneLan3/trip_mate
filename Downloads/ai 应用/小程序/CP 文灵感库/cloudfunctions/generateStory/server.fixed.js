const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { buildPrompt, generateSampleStory } = require('./index.js');

// 加载环境变量
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

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

// 显式设置监听所有网络接口
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`服务器运行在 http://${HOST}:${PORT}`);
});
