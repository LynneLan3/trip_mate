const { getSavedStories, deleteStory } = require('../utils/storage.js');

Page({
  data: {
    stories: []
  },

  onShow() {
    this.loadStories();
  },

  loadStories() {
    const stories = getSavedStories().map(story => ({
      ...story,
      createTimeText: this.formatTime(story.createTime)
    }));
    
    this.setData({ stories });
  },

  formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    // 1小时内
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} 分钟前`;
    }
    
    // 24小时内
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} 小时前`;
    }
    
    // 7天内
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} 天前`;
    }
    
    // 超过7天显示具体日期
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  },

  viewStory(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/result/result?id=${id}`
    });
  },

  deleteStory(e) {
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个故事吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          deleteStory(id);
          this.loadStories();
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  goToCreate() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
