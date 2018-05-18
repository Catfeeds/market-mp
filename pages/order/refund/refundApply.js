const config = require('../../../config')

var app = getApp();
var _this = null;

var winAjax = {
    refundOrder : function(orderSequenceNumber){
      var option = config.refundOrder
      option.data.orderSequenceNumber = _this.data.orderSequenceNumber
      option.data.title = _this.data.title
      option.data.content = _this.data.content
      option.success = function(data){
          wx.showToast({
            title: data.msg,
            icon: 'success',
            duration: 2000
          })
          setTimeout(function(){
            var pages = getCurrentPages()
            var prevPage = pages[pages.length - 2]
            prevPage.onLoad()
            wx.navigateBack()
          },1000)
      }
      app.ajax(_this ,option)
    }
}


Page({
  data: {
    orderSequenceNumber : '',
    actualPrice : 0.0,
    title : false,
    content : '',
    orderInfo : {},
    tareaFocus : false,
    isSubmit : true,
    status : {}
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({title: '退款'}) 
    // 初始化信息
    _this = this

    this.setData({
      orderSequenceNumber : option.sequence,
      actualPrice : option.actualPrice
    })

  },
  onGo: function(e){
    wx.navigateTo({url: e.target.dataset.url})
  },
  onSubmit: function(e){
    if(!this.data.title){
      wx.navigateTo({url: 'refundWhy'})  
      return
    }
    if(!this.data.isSubmit) return
      
    this.setData({
      isSubmit : false,
      content : e.detail.value.content
    })
    console.log(_this.data.title)
     _this.ajax.refundOrder()
  },
  onFocus : function(){
    this.setData({
      tareaFocus : true
    })
  },
  ajax : winAjax
})