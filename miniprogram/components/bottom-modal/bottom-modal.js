// components/bottom-modal/bottom-modal.js
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
  options: {
    styleIsolation: 'apply-shared', //外部样式
    multipleSlots: true // 多个slot
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose() {
      this.setData({
        modalShow: false
      })
    }
  }
})
