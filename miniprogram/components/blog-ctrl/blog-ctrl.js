// components/blog-ctrl/blog-ctrl.js
const db = wx.cloud.database()
let userInfo = {}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: {
      type: String,
      value: ''
    },
    blog: {
      type: Object,
      value: {}
    }
  },
  // 外部样式
  externalClasses: [
    'iconfont',
    'icon-pinglun',
    'icon-fenxiang'
  ],

  /**
   * 组件的初始数据
   */
  data: {
    loginShow: false,
    modalShow: false,
    content: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                this.setData({
                  modalShow: true
                })
              }
            })
          } else {
            this.setData({
              loginShow: true
            })
          }
        }
      })
    },

    onLoginSuccess(e) {
      userInfo= e.detail
      this.setData({
        loginShow: false
      }, () => {
        this.setData({
          modalShow: true
        })
      })
    },

    onLoginFail() {
      wx.showModal({
        title: '授权用户才能进行评论'
      })
    },

    onInput(e) {
      this.setData({
        content: e.detail.value
      })
    },

    onSend() {
      let content = this.data.content
      if (content.trim() === '') {
        wx.showModal({
          title: '评论内容不能为空'
        })
        return
      }
      wx.showLoading({
        title: '评价中',
        mask: true
      })
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功'
        })
        this.setData({
          modalShow: false,
          content: ''
        })
        this.triggerEvent('refreshCommentList')
      })
    }
  }
})
