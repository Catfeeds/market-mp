const config = require('../../config')

var app = getApp()
var _this = null

var winAjax = {
  weixinBindingCellNumber : function(smsCode){
    var userData = app.data.userInfo
    var option = config.weixinBindingCellNumber
    option.data.phoneNumber = _this.data.phoneNumber
    option.data.openId = app.data.userInfo.openId;
    option.data.smsCode = smsCode
    option.success = function(data){
      userData.bindingPhoneNumber = _this.data.phoneNumber
      userData.hasBinding = 1
      userData.islogin = true
      userData.passportId = data.data.response.passportId
      console.log(userData)
      app.User.saveUserInfo(userData)
      wx.navigateBack();
    }
    app.ajax(_this, option)
  },
  perfectWeixinInformation : function (e){
    var smsCode = _this.data.smsCode
    var userInfo = e.detail.userInfo
    var userData = app.data.userInfo
    console.log(userData)
    console.log(userInfo.gender)
    userData.headImageUrl = userInfo.avatarUrl
    userData.nickName = userInfo.nickName
    userData.islogin = true
    userData.sex = userInfo.gender == 1 ? 1 : 0; // 后台 0:女、1:男 //微信获取 性别 0：未知、1：男、2：女
    if (userData.status == 4) { //  完善用户资料
        var perfect = config.perfectWeixinInformation
        perfect.data.passportId = userData.passportId
        perfect.data.headImageUrl = userInfo.avatarUrl
        perfect.data.nickName = userInfo.nickName
        perfect.data.openId = userData.openId
        perfect.data.sex = userInfo.gender
        perfect.success = function (data) {
            if (data.data.code == 0) {
                console.log(userData)
                app.User.saveUserInfo(userData)
                _this.ajax.weixinBindingCellNumber(smsCode)
            }
        }
        app.ajax(_this, perfect)
    }
    
  },
  phoneBeUsed : function(success){
    var option = config.phoneBeUsed
    option.data.phoneNumber = _this.data.phoneNumber
    option.success = function(data){
      if(data.data.code == 0){
        success()
      }else{
        wx.showModal({
          title: '提示',
          content: data.data.msg,
          showCancel: false,
          success: function(){
            _this.setData({smsDisabled : false})
          }
        })
      }
    }
    app.ajax(_this, option)

  },
  requestVerificationCode : function(){
      var option = config.requestVerificationCode
      option.data.phoneNumber = _this.data.phoneNumber
      // option.data.openId = getApp().data.userInfo.openId;
      option.success = function(data){
        var time = _this.data.time - 1
        _this.setData({ time : time })
        var s = setInterval(function(){
          time -= 1
          if(time == 0){
            clearInterval(s)
            _this.setData({
              time : 60,
              smsDisabled : false,
              setInterval : false
            })
          }else{
            _this.setData({
              setInterval : true,
              time : time
            })
          }
        },1000);
      }
      app.ajax(_this ,option)
  }
}

Page({
  data: {
    time : 60,
    phoneNumber : null,
    smsCode : null,
    smsDisabled : true,
    setInterval : false, // 开始倒计时
    inputFocus : true,
    userTerms : true,
    btnDisabled : true
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({title: '绑定手机号码'})
    _this = this

  },
  onUnload : function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上1个页面
    prevPage.onReload()
  },
  onInput : function(e){
      console.log(e.detail.value.length)
    console.log(e.detail.value.length >= 11 &&(/^1[34578]\d{9}$/.test(e.detail.value)))
    if(e.detail.value.length >= 11){
      if((/^1[34578]\d{9}$/.test(e.detail.value))){
        this.setData({
          phoneNumber : e.detail.value,
          smsDisabled : this.data.setInterval,
          inputFocus : false
        })
      }else{
        wx.showModal({
          title: '提示',
          content: '请输入11位手机号码',
          showCancel : false,
          success : function(){
            _this.setData({
              inputFocus : true,
              phoneNumber : null
            })
          }
        })
      }
    }
  },
  onSmsInput: function (e){
      console.log(e.detail.value.length)
      if (e.detail.value.length == 4) {
        _this.setData({
            btnDisabled: false,
            smsCode: e.detail.value
        })
      } else if (e.detail.value.length > 4) {
          wx.showModal({
              title: '提示',
              content: '请输入4位验证码',
              showCancel: false,
              success: function () {
                  _this.setData({
                      btnDisabled: true
                  })
              }
          })
      } else{
          _this.setData({
              btnDisabled: true
          })
      }
  },
  checkboxChange : function(e){
    this.setData({
      userTerms : e.detail.value == "true"
    })
  },
  onSmsCode : function(e){
    if(this.data.userTerms){
      _this.setData({smsDisabled : true})
    //   this.ajax.phoneBeUsed(function(data){
        _this.ajax.requestVerificationCode()
    //   })
    }else{
      wx.showModal({
        title: '提示',
        content: '请仔细阅读用户服务条款',
        showCancel : false,
        success: function(res) {}
      })
    }
  },
  onSubmit : function(e){
    if(e.detail.value.smsCode == ""){
        wx.showModal({
          title: '提示',
          content: '请输入验证码',
          showCancel : false
        })
    }else{
      this.ajax.weixinBindingCellNumber(e.detail.value.smsCode)
    }
  },
  onGo: function(e){
    wx.navigateTo({url: e.target.dataset.url})
  },
  getUserInfo: function (e) {
    console.log(e)
    // _this.ajax.weixinBindingCellNumber(this.data.smsCode);
    _this.ajax.perfectWeixinInformation(e)
  },
  ajax: winAjax
})