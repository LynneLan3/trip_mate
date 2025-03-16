const { generateStory } = require('../utils/storyGenerator.js');

Page({
  data: {
    isGenerating: false,
    // 角色设定选项
    nameGenType: ['自动生成', '手动输入'],
    nameGenIndex: 1,
    genderTypes: ['男男', '女女', '男女'],
    genderIndex: 0,
    relationTypes: ['青梅竹马', '死对头', '契约婚姻'],
    relationIndex: 0,

    // 故事类型选项
    storyTypes: ['校园', '娱乐圈', '古风', '星际', '末日', '西幻', '民国', '职场', 'ABO', '兽人'],
    storyTypeIndex: -1,

    // 核心风格
    coreStyles: ['甜宠', '虐恋', '沙雕', '悬疑', '治愈', '黑化', '追妻火葬场', '强强对抗'],
    coreStyleIndex: -1,

    // 特殊元素
    specialElements: ['重生', '穿越', '系统', '读心术', '信息素设定', '超能力', '契约绑定'],
    specialElementIndex: -1,

    // 视角选择
    viewpoints: ['主角1视角', '主角2视角', '上帝视角', '双视角切换'],
    viewpointIndex: -1,

    wordCounts: ['1000', '2000', '3000'],
    wordCountIndex: -1,

    // 台词风格
    dialogueStyles: ['古风文言', '现代口语', '日漫腔', '欧美翻译体', '网络流行语'],
    dialogueIndex: 0
  },

  onNameGenChange(e) {
    this.setData({ nameGenIndex: e.detail.value });
  },

  onGenderChange(e) {
    this.setData({ genderIndex: e.detail.value });
  },

  onRelationChange(e) {
    this.setData({ relationIndex: e.detail.value });
  },

  onStoryTypeChange(e) {
    this.setData({
      storyTypeIndex: Number(e.currentTarget.dataset.value)
    });
  },

  onCoreStyleChange(e) {
    this.setData({
      coreStyleIndex: Number(e.currentTarget.dataset.value)
    });
  },

  onSpecialElementChange(e) {
    this.setData({
      specialElementIndex: Number(e.currentTarget.dataset.value)
    });
  },

  onDialogueChange(e) {
    this.setData({ dialogueIndex: e.detail.value });
  },

  onViewpointChange(e) {
    this.setData({
      viewpointIndex: Number(e.currentTarget.dataset.value)
    });
  },

  onWordCountChange(e) {
    this.setData({
      wordCountIndex: Number(e.currentTarget.dataset.value)
    });
  },

  onSubmit(e) {
    const formData = e.detail.value;
    
    if (!formData.character1?.trim()) {
      wx.showToast({
        title: '请输入第一个角色名称',
        icon: 'none'
      });
      return;
    }

    if (!formData.character2?.trim()) {
      wx.showToast({
        title: '请输入第二个角色名称',
        icon: 'none'
      });
      return;
    }

    if (this.data.storyTypeIndex === -1) {
      wx.showToast({
        title: '请选择故事类型',
        icon: 'none'
      });
      return;
    }

    if (this.data.coreStyleIndex === -1) {
      wx.showToast({
        title: '请选择核心风格',
        icon: 'none'
      });
      return;
    }

    if (this.data.viewpointIndex === -1) {
      wx.showToast({
        title: '请选择叙述视角',
        icon: 'none'
      });
      return;
    }

    if (this.data.wordCountIndex === -1) {
      wx.showToast({
        title: '请选择字数',
        icon: 'none'
      });
      return;
    }

    // 设置加载状态
    this.setData({ isGenerating: true });

    try {
      const params = {
        character1: formData.character1.trim(),
        character2: formData.character2.trim(),
        storyType: this.data.storyTypes[this.data.storyTypeIndex],
        coreStyle: this.data.coreStyles[this.data.coreStyleIndex],
        specialElement: this.data.specialElementIndex !== -1 ? this.data.specialElements[this.data.specialElementIndex] : null,
        viewpoint: this.data.viewpoints[this.data.viewpointIndex],
        wordCount: this.data.wordCounts[this.data.wordCountIndex],
        storySummary: formData.storySummary?.trim() || null
      };

      // 使用本地生成器生成故事
      const story = generateStory(params);
      
      const app = getApp();
      app.globalData.generatedStory = {
        content: story,
        ...params
      };

      // 重置加载状态并跳转
      this.setData({ isGenerating: false });
      wx.redirectTo({
        url: '/pages/result/result'
      });
    } catch (error) {
      console.error('生成故事失败:', error);
      // 重置加载状态并显示错误
      this.setData({ isGenerating: false });
      wx.showToast({
        title: error.message || '生成故事失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  }
});
