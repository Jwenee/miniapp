// pages/blog-edit/blog-edit.js
const MAX_WORDS_NUM = 140
const MAX_IMG_NUM = 9
let content = ''
let userInfo = {}

const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0,
    footerBottom: 0,
    images: [],
    selectPhoto: true // 选择框是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo = options
  },

  onInput(e) {
    let wordsNum = e.detail.value.length
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = e.detail.value
  },

  onFocus(e) {
    this.setData({
      footerBottom: e.detail.height
    })
  },

  onBlur() {
    this.setData({
      footerBottom: 0
    })
  },

  onChooseImage() {
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: (res) => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        // 还能选几张
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      }
    })
  },

  onDelImage(e) {
    const index = e.target.dataset.index
    this.data.images.splice(index,1)
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length === MAX_IMG_NUM -1) {
      this.setData({
        selectPhoto: true
      })
    }
  },

  onPreviewImage(e) {
    wx.previewImage({
      current: e.target.dataset.imgsrc, // 当前显示图片的链接，不填则默认为 urls 的第一张
      urls: this.data.images,
    })
  },

  onSend() {
    if (content.trim() === '') {
      wx.showModal({
        title: '请输入内容'
      })
      return
    }
    wx.showLoading({
      title: '发布中',
      mask: true
    })
    let promiseArr = []
    let fileIds = []
    for (let i = 0; i < this.data.images.length; i++) {
      let upPromise = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: `blog/${Date.now()}-${Math.random()*10000000}${suffix}`,
          filePath: item,
          success: (res) => {
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })      
      })
      promiseArr.push(upPromise)
    }
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: fileIds,
          createTime: db.serverDate()
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功'
        })
        // 返回并刷新
        wx.navigateBack()
        const pages = getCurrentPages()
        // 获取上一个界面
        const prevPage = pages[pages.length - 2]
        prevPage.onPullDownRefresh()
      }).catch((err) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布失败'
        })
      })
    })
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