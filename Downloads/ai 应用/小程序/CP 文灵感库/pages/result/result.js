const { saveStory, getStoryById } = require('../utils/storage.js');

Page({
  data: {
    loading: true,
    error: null,
    story: null
  },

  onLoad(options) {
    if (options.id) {
      // 从故事列表进入，加载已保存的故事
      const story = getStoryById(options.id);
      if (story) {
        this.setData({
          story,
          loading: false
        });
      } else {
        this.setData({
          error: '故事不存在或已被删除',
          loading: false
        });
      }
    } else {
      // 从首页进入，显示新生成的故事
      const app = getApp();
      const story = app.globalData.generatedStory;
      
      if (story) {
        this.setData({
          story,
          loading: false
        });
      } else {
        this.setData({
          error: '故事加载失败，请返回重试',
          loading: false
        });
      }
    }
  },

  copyStory() {
    if (!this.data.story) return;
    
    wx.setClipboardData({
      data: this.data.story.content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'error',
          duration: 2000
        });
      }
    });
  },

  saveStory() {
    if (!this.data.story) return;

    try {
      saveStory(this.data.story);
      
      // 显示保存成功提示并跳转
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        mask: true, // 防止用户重复点击
        duration: 1500
      });

      // 延迟跳转到故事列表（使用switchTab因为stories是tabBar页面）
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/stories/stories'
        });
      }, 1500);
    } catch (error) {
      console.error('保存故事失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error',
        duration: 2000
      });
    }
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
