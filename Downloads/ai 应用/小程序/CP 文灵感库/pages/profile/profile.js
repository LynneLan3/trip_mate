const { clearAllStories } = require('../utils/storage.js');

Page({
  data: {
    userInfo: null,
    hasUserInfo: false
  },

  onLoad() {
    // 检查是否已有用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true
      });
    }
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于显示用户昵称',
      success: (res) => {
        const userInfo = res.userInfo;
        // 保存用户信息到本地存储
        wx.setStorageSync('userInfo', userInfo);
        this.setData({
          userInfo,
          hasUserInfo: true
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    });
  }
});
