const icons = require('../../icons')

var app = getApp()
var _this = null
Page({
  data: {
    userInfo: {},
    status:{islogin : false},
    icons : icons()
  },
  onLoad: function () {
    wx.setNavigationBarTitle({title: '我的'})
    var _this = this
    var userInfo = getApp().data.userInfo
    // 检测是否完善用户信息
    if(!userInfo.auth){
      wx.navigateTo({url: '../index/authorization?userInfo=true'})
    }
    
    this.setData({
      userInfo : userInfo
    })
  },
  onReload : function(){
    this.onLoad();
  },
  onGo: function(e){
    wx.navigateTo({url: e.target.dataset.url})
  },
  onCallNumber: function (e) {
      wx.makePhoneCall({
          phoneNumber: '4008090696' //客服电话
      })
  },
})