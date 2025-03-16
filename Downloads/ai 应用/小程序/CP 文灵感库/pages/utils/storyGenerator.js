// 生成示例故事
function buildPrompt(params) {
  const {
    character1,
    character2,
    storyType,
    coreStyle,
    specialElement,
    viewpoint,
    wordCount,
    storySummary
  } = params;

  return `请根据以下参数创作一篇CP向故事：

#核心设定
角色名称：[${character1}] & [${character2}]
故事类型：${storyType}
核心风格：${coreStyle}
特殊元素：${specialElement || '无'}
叙述视角：${viewpoint}
故事梗概：${storySummary || '无'}

#输出要求
字数控制：${wordCount}字
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

function generateStory(params) {
  const prompt = buildPrompt(params);
  
  // 根据故事类型生成不同的场景描述
  const scenes = {
    '校园': '教室里、操场上、图书馆',
    '娱乐圈': '片场、后台、颁奖典礼',
    '古风': '亭台楼阁、青石小路、杨柳依依',
    '星际': '宇宙飞船、未知星球、太空站',
    '末日': '废墟城市、地下避难所、荒芜大地',
    '西幻': '魔法城堡、森林、酒馆',
    '民国': '老上海、茶馆、石板路',
    '职场': '办公室、会议室、咖啡厅',
    'ABO': '私密公寓、医院、实验室',
    '兽人': '森林、部落、神秘洞穴'
  };

  // 根据核心风格生成不同的情节发展
  const plotStyles = {
    '甜宠': '温馨浪漫的日常、甜蜜的互动、温暖的陪伴',
    '虐恋': '误会与分离、痛苦的抉择、深刻的思念',
    '沙雕': '搞笑的意外、夸张的表现、欢乐的氛围',
    '悬疑': '神秘的线索、扑朔迷离、出人意料',
    '治愈': '温暖的安慰、互相治愈、成长蜕变',
    '黑化': '黑暗面的展露、复仇欲望、内心挣扎',
    '追妻火葬场': '追悔莫及、卑微追求、痛改前非',
    '强强对抗': '针锋相对、实力较量、惺惺相惜'
  };

  // 生成故事开头
  const intro = `在${scenes[params.storyType]}中，${params.character1}和${params.character2}的故事缓缓展开。这是一个充满${params.coreStyle}风格的${params.storyType}故事。`;

  // 生成特殊元素相关内容
  let specialContent = '';
  if (params.specialElement) {
    specialContent = `\n\n命运的转折发生在${params.specialElement}之后。`;
  }

  // 生成对话内容
  const dialogue = `\n\n"你知道吗？"${params.character1}${params.coreStyle === '虐恋' ? '哽咽着' : '轻声'}说道，"我一直在等这一刻。"

${params.character2}${plotStyles[params.coreStyle].split('、')[0]}地回应，"我也是。从我们相遇的那一天起，就注定会有今天。"`;

  // 生成场景描述
  const scene = `\n\n${scenes[params.storyType].split('、')[0]}里，${plotStyles[params.coreStyle].split('、')[1]}的氛围笼罩着两人。`;

  // 生成结局
  const ending = `\n\n"我们一起走吧，"${params.character1}伸出手。
"好，"${params.character2}握住那只手，"无论未来如何，我都会陪在你身边。"

在${scenes[params.storyType].split('、')[2]}的背景下，他们的故事仍在继续......`;

  // 组合完整故事
  const story = intro + specialContent + dialogue + scene + ending;
  
  // 添加免责声明
  return story + `\n\n---\n免责声明：本故事由AI自动生成，仅供娱乐。故事情节、人物和对话均为AI虚构，如有雷同纯属巧合。请理性对待AI生成内容，不代表任何个人或组织的观点。`;
}

module.exports = {
  generateStory
};
