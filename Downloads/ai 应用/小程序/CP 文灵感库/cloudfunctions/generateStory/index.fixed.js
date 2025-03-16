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
  
  // 根据故事类型生成不同的场景描述
  const scenes = {
    "校园": "明亮的教室、安静的图书馆、热闹的操场",
    "娱乐圈": "闪光灯下的红毯、幕后的化妆间、嘈杂的片场",
    "古风": "雕梁画栋的宫殿、烟雨朦胧的江南、荒凉的边塞",
    "星际": "未来科技的宇宙飞船、荒芜的外星球、繁华的太空站",
    "末日": "废墟中的城市、物资匮乏的避难所、危机四伏的荒野",
    "西幻": "魔法森林、古老城堡、神秘山脉",
    "民国": "老上海的石库门、烟雾缭绕的茶馆、战火纷飞的年代",
    "职场": "明亮的办公室、高档的餐厅、紧张的会议室",
    "ABO": "信息素弥漫的空间、等级森严的社会、特殊的生理周期",
    "兽人": "原始的森林、部落领地、神秘的古老遗迹"
  };
  
  // 根据核心风格生成不同的情节描述
  const plotStyles = {
    "甜宠": "温柔依赖、欢声笑语、心跳加速",
    "虐恋": "痛苦纠结、泪流满面、爱而不得",
    "沙雕": "荒诞不经、妙语连珠、啼笑皆非",
    "悬疑": "扑朔迷离、暗藏玄机、步步惊心",
    "治愈": "温暖人心、静水流深、心灵慰藉",
    "黑化": "性格扭曲、疯狂执着、逐渐堕落",
    "追妻火葬场": "后悔莫及、痛苦追求、绝地反击",
    "强强对抗": "针锋相对、势均力敌、相互欣赏"
  };
  
  // 生成故事开头
  const intro = `在${scenes[storyType]}中，${character1}和${character2}的故事缓缓展开。这是一个充满${coreStyle}风格的${storyType}故事。`;
  
  // 生成特殊元素相关内容
  let specialContent = '';
  if (params.specialElement) {
    specialContent = `\n\n命运的转折发生在${params.specialElement}之后。`;
  }
  
  // 生成对话内容
  const dialogue = `\n\n"你知道吗？"${character1}${coreStyle === '虐恋' ? '哽咽着' : '轻声'}说道，"我一直在等这一刻。"

${character2}${plotStyles[coreStyle].split('、')[0]}地回应，"我也是。从我们相遇的那一天起，就注定会有今天。"`;
  
  // 生成场景描述
  const scene = `\n\n${scenes[storyType].split('、')[0]}里，${plotStyles[coreStyle].split('、')[1]}的氛围笼罩着两人。`;
  
  // 生成结局
  const ending = `\n\n"我们一起走吧，"${character1}伸出手。
"好，"${character2}握住那只手，"无论未来如何，我都会陪在你身边。"

【故事完】

---
免责声明：本故事由AI自动生成，仅供娱乐。故事情节、人物和对话均为AI虚构，如有雷同纯属巧合。请理性对待AI生成内容，不代表任何个人或组织的观点。`;
  
  // 组合完整故事
  return intro + specialContent + dialogue + scene + ending;
}

module.exports = {
  buildPrompt,
  generateSampleStory
};
