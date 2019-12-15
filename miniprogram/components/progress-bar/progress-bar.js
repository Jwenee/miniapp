// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 //current secound
let totalDuration = 0 //总时长秒
// 进度条是否在拖拽,避免拖动和时间更新事件冲突
let isMoving = false 

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0,
  },
  lifetimes: {
    ready() {
      if (this.properties.isSame && this.data.showTime.totalTime === '00:00') {
        this.setTime()
      }
      this.getMovableDis()
      this.bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((res) => {
        movableAreaWidth = res[0].width
        movableViewWidth = res[1].width
      })
    },

    bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        isMoving = false
        // 系统控制面板
        this.triggerEvent('musicPlay')
      })
      backgroundAudioManager.onStop(() => {
      })
      backgroundAudioManager.onPause(() => {
        this.triggerEvent('musicPause')
      })
      backgroundAudioManager.onWaiting(() => {
      })
      backgroundAudioManager.onCanplay(() => {

        if (typeof backgroundAudioManager.duration != 'undefined') {
          this.setTime()
        } else {
          setTimeout(() => {
            this.setTime()
          }, 1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        if (isMoving) return
        const { currentTime, duration } = backgroundAudioManager
        const currentTimeFmt = this.dateFormat(currentTime)
        const distant = (movableAreaWidth - movableViewWidth) * currentTime / duration
        // 减少时间更新，每一秒更新，避免每秒内多次触发
        let sec = currentTime.toString().split('.')[0]
        if (sec != currentSec) {
          this.setData({
            movableDis: distant,
            progress: currentTime /duration * 100,
            ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
          })
          currentSec = sec
          this.triggerEvent('timeUpdate',{ currentTime })
        }
      })
      backgroundAudioManager.onEnded(() => {
        this.triggerEvent('musicEnd')
      })
      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: `错误:${res.errCode}`
        })
      })

    },
    setTime() {
      const duration = backgroundAudioManager.duration
      totalDuration = duration
      const durationFmt = this.dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    dateFormat(sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this.padLeftZero(min),
        'sec': this.padLeftZero(sec)
      }
    },
    padLeftZero(num) {
      return num < 10 ? `0${num}` : num
    },
    onChange(e) {
      // 拖动
      if (e.detail.source === 'touch') {
        this.data.progress = e.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = e.detail.x
        isMoving = true
      }
    },
    onTouchEnd() {
      const { currentTime } = backgroundAudioManager
      const currentTimeFmt = this.dateFormat(currentTime)
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })

      backgroundAudioManager.seek(totalDuration * this.data.progress /100)
      isMoving = false
    }
  }
})
