const icons = require('../../icons')

var app = getApp()
var _this = null
Page({
  data: {
    userLocation: false,
    userInfo : false,
    option : {
      userLocation: false,
      userInfo : false,
    },
    icons : icons()
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({title: '授权提示'})
    _this = this
    this.setData({option:option})
  },
  onUnload : function(){
    if(!_this.data.option.userInfo && _this.data.userLocation) return
    if(_this.data.option.userInfo && _this.data.userInfo) return

    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上1个页面
    prevPage.setData({auth : true})
    prevPage.onReload({userLocation : false})
  },
  openSetting: function () {
    if (wx.openSetting) {
      wx.openSetting({
        success: function (res) {
          // res.authSetting['scope.userInfo']
          // res.authSetting['scope.userLocation']

          if(_this.data.option.userInfo && !res.authSetting['scope.userInfo']){
            wx.showModal({
              title: '授权提示',
              content: '支付是必须、用户授权用户信息喔.'
            })

          }else{
            if(res.authSetting['scope.userLocation']){
              _this.data.userLocation = true
            }

            if(res.authSetting['scope.userInfo']){
              _this.data.userInfo = true
            }

            _this.setData({
              userLocation : _this.data.userLocation,
              userInfo :  _this.data.userInfo
            })

            wx.reLaunch({url: 'index'})
          }

        }
      })
    } else {
      wx.showModal({
        title: '授权提示',
        content: '小程序需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮'
      })
    }
  }
})

