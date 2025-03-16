App({
  globalData: {
    userInfo: null,
    apiKey: '', // Deepseek API key will be configured here
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',  // Replace with actual Deepseek endpoint
    generatedStory: null
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
  }
})
