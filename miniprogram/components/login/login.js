// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo(e) {
      const userInfo = e.detail.userInfo
      if (userInfo) {
        this.setData({
          modalShow: false
        })
        this.triggerEvent('loginok', userInfo)
      } else {
        this.triggerEvent('loginfail')
      }
    }
  }
})
