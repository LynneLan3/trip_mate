const { getIconPath } = require('../utils/icons');

Component({
  data: {
    selected: 0,
    color: "#8e8e93",
    selectedColor: "#007aff",
    backgroundColor: "#ffffff",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "创作",
        iconPath: "",
        selectedIconPath: ""
      },
      {
        pagePath: "/pages/stories/stories",
        text: "故事",
        iconPath: "",
        selectedIconPath: ""
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        iconPath: "",
        selectedIconPath: ""
      }
    ]
  },
  lifetimes: {
    attached() {
      this.updateIcons();
      
      // 获取当前页面
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const route = currentPage.route;
      
      // 设置选中状态
      const selected = this.data.list.findIndex(item => 
        item.pagePath.includes(route)
      );
      this.setData({ selected });
    }
  },
  methods: {
    updateIcons() {
      const iconTypes = ['edit', 'list', 'user'];
      const list = this.data.list.map((item, index) => ({
        ...item,
        iconPath: getIconPath(iconTypes[index], false),
        selectedIconPath: getIconPath(iconTypes[index], true)
      }));
      this.setData({ list });
    },
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
      this.setData({
        selected: data.index
      });
    }
  }
});
