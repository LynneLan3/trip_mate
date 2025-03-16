const STORIES_KEY = 'saved_stories';

// 获取保存的故事列表
function getSavedStories() {
  return wx.getStorageSync(STORIES_KEY) || [];
}

// 保存故事
function saveStory(story) {
  const stories = getSavedStories();
  const storyToSave = {
    ...story,
    id: Date.now().toString(),
    createTime: new Date().toISOString()
  };
  stories.unshift(storyToSave);
  wx.setStorageSync(STORIES_KEY, stories);
  return storyToSave;
}

// 获取指定故事
function getStoryById(id) {
  const stories = getSavedStories();
  return stories.find(story => story.id === id);
}

// 删除故事
function deleteStory(id) {
  const stories = getSavedStories();
  const newStories = stories.filter(story => story.id !== id);
  wx.setStorageSync(STORIES_KEY, newStories);
}

module.exports = {
  getSavedStories,
  saveStory,
  getStoryById,
  deleteStory
};
