// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: {
      type: String,
      value: ''
    }
  },

  observers: {
    lyric(lrc) {
      if (lrc === '暂无歌词') {
        this.setData({
          lyricList: [{
            lrc,
            time: 0
          }],
          nowLyricIndex: -1
        })
      } else {
        this.parseLyric(lrc)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lyricList: [],
    nowLyricIndex: 0, //高亮歌词
    scrollTop: 0  //滚动条高度
  },

  lifetimes: {
    ready() {
      // 750rpx
      wx.getSystemInfo({
        success(res) {
          // 求出1rpx的大小
          lyricHeight = res.screenWidth / 750 * 64
        }
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    parseLyric(lyricStr) {
      let line = lyricStr.split('\n')
      let lyricArr = []
      line.forEach((item) => {
        let time = item.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time != null) {
          let lrc = item.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把时间转化为秒
          let timeToSec = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          lyricArr.push({
            lrc,
            time: timeToSec
          })
        }
      })
      this.setData({
        lyricList: lyricArr
      })
    },
    update(currentTime) {
      let lrcList = this.data.lyricList
      if (lrcList.length === 0) return
      // 某些歌曲歌词结束后还有部分尾声，需判断处理滚动到最后一句
      if (currentTime > lrcList[lrcList.length - 1].time) {
        if (this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      for (let i = 0; i < lrcList.length; i++) {
        if (currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          break;
        }
      }
    }
  }
})
