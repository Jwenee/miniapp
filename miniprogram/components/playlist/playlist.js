// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: {
      type: Object,
      value: {}
    }
  },
  observers: {
    // 监听对象某个属性
    ['playlist.playCount'](count) {
      this.setData({
        _count: this._tranNumber(count, 2)
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _count: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goToMusiclist() {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`
      })
    },
    // 播放数据格式化
    _tranNumber(num, point) {
      let numStr = num.toString().split('.')[0];
      if (numStr.length < 6) {
        return numStr;
      } else if (numStr.length >= 6 && numStr.length <= 8) {
        let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point);
        let numN = parseInt(num / 10000) + "." + decimal;
        return `${parseFloat(numN)}万`;
        
      } else if (numStr.length > 8) {
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point);
        let numN = parseInt(num / 100000000) + "." + decimal;
        return `${parseFloat(numN)}亿`;
      }
    }
  }
})
