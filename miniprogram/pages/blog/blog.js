// miniprogram/pages/blog/blog.js
let keyword = ''
let totalCount = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false, //底部弹出层
    blogList: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadBlogList()
  },
  loadBlogList(start = 0) {
    if (!this.data.hasMore) return
    wx.showLoading({
      title: '拼命加载中'
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        start,
        count: 10,
        keyword,
        $url: 'list',
      }
    }).then((res) => {
      this.setData({
        blogList: this.data.blogList.concat(res.result.data)
      })
      totalCount = res.result.total
      if (totalCount === this.data.blogList.length) {
        this.setData({
          hasMore: false
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },

  onPublish() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
        } else {
          this.setData({
            modalShow: true
          })
        }
      }
    })
  },
  onLoginSuccess(e) {
    const detail = e.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },

  onLoginFail() {
    wx.showModal({
      title: '授权用户才能发布',
      content: '',
    })
  },

  goComment(e) {
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${e.target.dataset.blogid}`
    })
  },

  onSearch(e) {
    this.setData({
      blogList: []
    })
    keyword = e.detail.keyword
    this.loadBlogList()
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
    this.setData({
      blogList: []
    })
    this.loadBlogList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    const blogObj = e.target.dataset.blog
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`
    }
  }
})