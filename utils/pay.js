


payment = {
    paymentOrder : function(orderSequenceNumber){
      var option = config.paymentOrder;
      option.data.orderSequenceNumber = orderSequenceNumber;
      option.data.partnerUserId = getApp().data.userInfo.openId;
      option.data.paymentType = 'WEIXIN_APPLET'; // BALANCE
      option.success = function(data){
        if(data.data.code == 0){
          winAjax[option.data.paymentType](data.data.response);
          wx.hideLoading();
        }else{
          wx.showToast({
            title: data.data.msg,
            icon: 'loading',
            duration: 2000
          })
        }
      };
      app.ajax(_this,option);
    },
    // 余额支付
    BALANCE : function(successData){
      var option = config.pay.BALANCE;
      option.data.paymentParameter = successData
      option.success = function(data){
        if(data.data.code == 0){
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function(){
            wx.reLaunch({'url' : '../index/index'});
          },1000)
        }else{
          wx.showToast({
            title: data.data.msg,
            icon: 'loading',
            duration: 2000
          })
        }
      };
      app.ajax(_this,option);
    },
    // 微信支付
    WEIXIN_APPLET : function(successData){
      wx.requestPayment({
         'timeStamp': successData.timeStamp,
         'nonceStr': successData.nonceStr,
         'package': successData.package,
         'signType': successData.signType,
         'paySign': successData.paySign,
         'success':function(res){
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 2000
            })
            //  清空购物车
            app.Cart.REMOVER();
            setTimeout(function(){
              wx.reLaunch({'url' : '../index/index'});
            },1000)
         },
         'fail':function(res){
            _this.data.status.isTap = true;
            _this.setData({status : _this.data.status});
            console.error(res);
         }
      })
    }
}