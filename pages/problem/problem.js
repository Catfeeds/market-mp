const config = require('../../config')

var app = getApp()
var _this = null

var winAjax = {
  loaderProblemTypes : function(){
    var option = config.loaderProblemTypes
    option.success = function(data){
      if(data.data.code == 100){
        // 没有数据
        return
      }
      _this.setData({
        problemTypes : data.data.response.datas
      })
    }
    app.ajax(_this, option)
  }
}

Page({
  data: {
    problemTypes : []
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({title: '常见问题'})
    _this = this
    this.setData({showTemp : option.tempName})
    this.ajax.loaderProblemTypes()
  },
  onGo : function(e){
    wx.navigateTo({url : e.target.dataset.url})
  },
  ajax : winAjax
})