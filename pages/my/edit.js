const icons = require('../../icons')

var app = getApp()
var _this = null
Page({
  data: {
    userInfo: {
      userName : '吐烟圈的老牛先生'
    },
    status:{},
    showTemp : "",
    icons : icons()
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({title: '用户信息'})
    this.setData({showTemp : option.tempName})
  },
  onIpuClose : function(){
    this.data.userInfo.userName = "";
    this.setData({userInfo : this.data.userInfo});
  }
})