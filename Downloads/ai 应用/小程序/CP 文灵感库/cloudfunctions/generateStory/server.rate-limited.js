const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { buildPrompt, generateSampleStory } = require('./index.js');

// 加载环境变量
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// 用户使用量追踪 - 使用内存存储
// 格式: { 'userId_YYYY-MM-DD': count }
const usageTracker = {};

// 获取当前日期字符串 (YYYY-MM-DD 格式)
function getCurrentDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 检查并增加用户使用次数
function checkAndIncrementUserUsage(userId) {
  if (!userId) {
    return { allowed: false, message: '缺少用户ID' };
  }

  const dateStr = getCurrentDateString();
  const key = `${userId}_${dateStr}`;
  
  // 如果是新的一天或新用户，初始化计数
  if (!usageTracker[key]) {
    usageTracker[key] = 0;
  }
  
  // 检查是否超出限制
  if (usageTracker[key] >= 5) {
    return { 
      allowed: false, 
      message: '您今日的生成次数已用完（5/5）。请明天再来尝试。',
      usageCount: usageTracker[key],
      dailyLimit: 5
    };
  }
  
  // 增加使用次数
  usageTracker[key] += 1;
  
  return { 
    allowed: true, 
    usageCount: usageTracker[key],
    dailyLimit: 5
  };
}

// 故事生成接口
app.post('/api/generate', async (req, res) => {
  try {
    // 验证请求体
    if (!req.body || !req.body.userId) {
      return res.status(400).json({
        success: false,
        error: '请求缺少必要的用户ID'
      });
    }

    // 检查用户使用量
    const usageCheck = checkAndIncrementUserUsage(req.body.userId);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: usageCheck.message,
        usageCount: usageCheck.usageCount,
        dailyLimit: usageCheck.dailyLimit
      });
    }

    // 生成故事
    const story = generateSampleStory(req.body);
    
    // 返回结果，包含使用统计
    res.json({ 
      success: true, 
      data: story,
      usage: {
        count: usageCheck.usageCount,
        limit: usageCheck.dailyLimit,
        remaining: usageCheck.dailyLimit - usageCheck.usageCount
      }
    });
  } catch (error) {
    console.error('生成故事失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '生成故事失败，请重试' 
    });
  }
});

// 查询用户使用量接口
app.get('/api/usage/:userId', (req, res) => {
  const { userId } = req.params;
  const dateStr = getCurrentDateString();
  const key = `${userId}_${dateStr}`;
  
  const count = usageTracker[key] || 0;
  const limit = 5;
  
  res.json({
    success: true,
    usage: {
      count: count,
      limit: limit,
      remaining: limit - count
    }
  });
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
