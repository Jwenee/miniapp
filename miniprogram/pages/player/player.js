// pages/player/player.js
const app = getApp()
let musiclist = []
let nowPlayingIndex = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false,
    isLyricShow: false,
    lyric: '',
    isSame: false // 是否点击同一首
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this.loadMusicDetail(options.musicId)
  },

  loadMusicDetail(musicId) {
    if (musicId === app.getPlayingMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    if (!this.data.isSame) {
      backgroundAudioManager.stop()
    }

    let music = musiclist[nowPlayingIndex]
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })

    app.setPlayingMusicId(parseInt(musicId))

    wx.showLoading({
      title: '歌曲加载中'
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicurl'
      }
    }).then((res) => {
      const result = JSON.parse(res.result)
      if (result.data[0].url === null) {
        wx.showToast({
          title: '无权限播放'
        })
        return
      }
      if (!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.epname = music.al.name
        backgroundAudioManager.singer = music.ar[0].name

        this.savePlayHistory()
      }
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()
      // 获取歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric'
        }
      }).then((res) => {
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc

        if (lrc) {
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },

  togglePlaying() {
    if (this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  onPrev() {
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length -1
    }
    let id = musiclist[nowPlayingIndex].id
    this.loadMusicDetail(id)
  },
  onNext() {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    let id = musiclist[nowPlayingIndex].id
    this.loadMusicDetail(id)
  },

  showLyric() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  timeUpdate(e) {
    this.selectComponent('.lyric').update(e.detail.currentTime)
  },
  // 系统控制面板触发的事件
  onPlay() {
    this.setData({
      isPlaying: true
    })
  },

  onPause() {
    this.setData({
      isPlaying: false
    })
  },

  savePlayHistory() {
    const music = musiclist[nowPlayingIndex] //正在播放歌曲
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    let include = false
    for (let i = 0; i < history.length; i++) {
      if (history[i].id === music.id) {
        include = true
        break
      }
    }
    if (!include) {
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})