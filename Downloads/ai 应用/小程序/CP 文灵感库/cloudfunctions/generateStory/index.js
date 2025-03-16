const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 构建提示词
function buildPrompt(params) {
  return `请根据以下参数创作一篇CP向故事：

#核心设定
角色名称：[${params.character1}] & [${params.character2}]
故事类型：${params.storyType}
核心风格：${params.coreStyle}
特殊元素：${params.specialElement || '无'}
叙述视角：${params.viewpoint}
故事梗概：${params.storySummary || '无'}

#输出要求
字数控制：${params.wordCount}字
段落结构：开端-冲突升级-高潮-留白结局
敏感词处理：自动替换争议性词汇

#风格强化指令
1. 对话占比≥30%，重要剧情通过对话推进
2. 每300字插入一个戏剧性转折点
3. 环境描写需服务于人物关系刻画

#特别说明
故事结尾必须添加以下免责声明（使用分隔线与正文分开）：

---
免责声明：本故事由AI自动生成，仅供娱乐。故事情节、人物和对话均为AI虚构，如有雷同纯属巧合。请理性对待AI生成内容，不代表任何个人或组织的观点。

请开始创作：`;
}

// 生成示例故事（用于测试）
function generateSampleStory(params) {
  const { character1, character2, storyType, coreStyle } = params;
  return `【这是一个示例故事，用于测试】

${character1}和${character2}是一对${storyType}故事中的主角。这是一个充满${coreStyle}风格的故事。

"你知道吗？"${character1}轻声说道，"我一直在等这一刻。"

${character2}微笑着点头，"我也是。从我们相遇的那一天起，就注定会有今天。"

阳光透过窗户洒在两人身上，仿佛为这一刻镀上了一层金边。他们相视一笑，知道未来的路还很长，但只要有彼此在身边，就一定能克服所有困难。

"我们一起走吧，"${character1}伸出手。
"好，"${character2}握住那只手，"无论未来如何，我都会陪在你身边。"

【故事完】

---
免责声明：本故事由AI自动生成，仅供娱乐。故事情节、人物和对话均为AI虚构，如有雷同纯属巧合。请理性对待AI生成内容，不代表任何个人或组织的观点。`;
}

// 云函数入口
exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    
    // 构建提示词
    const prompt = buildPrompt(event);
    
    // 生成示例故事（实际项目中应替换为真实的API调用）
    const story = generateSampleStory(event);
    
    // 保存到数据库
    const result = await db.collection('stories').add({
      data: {
        userId: OPENID,
        character1: event.character1,
        character2: event.character2,
        storyType: event.storyType,
        coreStyle: event.coreStyle,
        specialElement: event.specialElement,
        viewpoint: event.viewpoint,
        wordCount: event.wordCount,
        content: story,
        createTime: db.serverDate()
      }
    });

    return {
      success: true,
      data: {
        storyId: result._id,
        content: story
      }
    };
  } catch (error) {
    console.error('生成故事失败:', error);
    return {
      success: false,
      error: error.message || '生成故事失败，请稍后重试'
    };
  }
};
