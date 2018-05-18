const config = require('../../config')

var app = getApp();
var _this = null;

var winAjax = {
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

      // 网络监听错误方法
      option.networkError = function(){
        _this.data.status.isPay = true;
        _this.setData({status : _this.data.status});
      }
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
            app.Cart.REMOVER_CHECK()
            setTimeout(function(){
              wx.reLaunch({'url' : '../index/index'});
            },1000)
         },
         'fail':function(res){
            _this.data.status.isPay = true;
            _this.setData({status : _this.data.status});
            console.error(res);
         },
         'complete' : function(res){
            console.error(res)
            if(res.errMsg = 'requestPayment:cancel'){
              _this.data.status.isPay = true;
              _this.setData({status : _this.data.status});
            }
         }
      })
    },
    findContainerData : function(orderSequenceNumber,orderId){
        var option = config.findContainerData
        option.data.orderSequenceNumber = orderSequenceNumber
        option.success = function(data){
          if(data.data.code == 0){
            data = data.data.response;
            _this.setData({
                containerData: data.containerData
            });
          }
        }
        app.ajax(_this, option);
    },
    orderDetail : function(orderId){
        var option = config.orderDetail;
        option.data.orderId = orderId;
        option.success = function(data){
            // data = {"data":{"msg":"请求成功","code":0,"response":{"sequenceNumber":"90820170815173208513526183","targetName":"小惠便利店恒大山水城店","address":"广东省广州市增城市御峰四街3号","addressTitle":"取货地址：","orderId":100018,"actualPrice":71,"statusValue":"待支付","targetTitle":"取货点：","distributionFee":0,"discountPrice":0,"orderStatus":1,"deliverType":1,"deliverValue":"到店自提","createTime":"2017-08-15 17:32:09","deliverTitle":"配送进度","deliverResult":"已取货","items":[{"itemTemplateId":100001,"itemId":100001,"image":"http://ksupplychain.oss-cn-shenzhen.aliyuncs.com/supplychain/items/i_100056.jpg","quantity":3,"totalPrice":33,"price":11,"name":"哈尔滨（冰纯）330ml","itemSnapshotId":100037},{"itemTemplateId":100002,"itemId":100002,"image":"http://ksupplychain.oss-cn-shenzhen.aliyuncs.com/supplychain/items/i_100057.jpg","quantity":1,"totalPrice":12,"price":12,"name":"哈尔滨（冰纯）500ml","itemSnapshotId":100038},{"itemTemplateId":100003,"itemId":100003,"image":"http://ksupplychain.oss-cn-shenzhen.aliyuncs.com/supplychain/items/i_100058.jpg","quantity":2,"totalPrice":26,"price":13,"name":"哈尔滨（冰纯）600ml","itemSnapshotId":100039}],"orderSequenceNumber":"190820170815173209893575711","totalItemQuantity":6},"accessToken":""},"header":{"Server":"Apache-Coyote/1.1","Set-Cookie":"JSESSIONID=127D18C5A1AF1717E73E1AE510469EA9; Path=/market; HttpOnly","Content-Type":"application/json;charset=UTF-8","Transfer-Encoding":"chunked","Date":"Tue, 15 Aug 2017 10:43:01 GMT"},"statusCode":200,"errMsg":"request:ok"};
            data = data.data ? data.data.response : {};
            if(data.refundReason != ''){
              data.refundReason = JSON.parse(data.refundReason)
            }
            _this.setData({
                order: data || {}
            });

            if(data.orderStatus == 8196){
              // 为 8196时 在自提进度或者配送进度下 加多一个显示(还要加多一个请求，就是那个findContainerData的接口) 取货口(灰色)         01 02 03 01 04(红色)
              winAjax.findContainerData(data.orderSequenceNumber, data.orderId);
            }
        };
        app.ajax(_this,option);
    },
    refundOrder : function(orderSequenceNumber){
      var option = config.refundOrder
      option.data.orderSequenceNumber = orderSequenceNumber
      option.success = function(data){
          wx.showToast({
            title: data.msg,
            icon: 'success',
            duration: 2000
          })
          _this.ajax.ordersData();
      }
      app.ajax(_this ,option)
    },
    // 再次购买
    directPurchase : function(items){

      var itemSet = false,itemNames = false;
      for(var key in items){
        if(!itemSet) itemSet = {}
        if(!itemNames) itemNames = {}
        if(itemSet[items[key].itemId] == null) itemSet[items[key].itemId] = {};
        if(itemNames[items[key].itemId] == null) itemNames[items[key].itemId] = {};
        itemSet[items[key].itemId] = items[key].quantity;
        itemNames[items[key].itemId] = items[key].name;
      }

      var option = config.directPurchase
      option.data.itemSet = itemSet
      option.success = function(data){
        data = data.data.response.pageItemMsg;
        for(var i in data){
          if(itemNames[data[i].itemId]){
            data[i].num = itemSet[data[i].itemId]
            data[i].check = true
            delete itemNames[data[i].itemId]
          }
        }

        var msgNames = []
        for(var i in itemNames){
          msgNames.push(itemNames[i]);
        }

        _this.openCart(msgNames,data)
      }
      app.ajax(_this ,option)
    }
}

Page({
  data: {
    order : {},
    status : {tabActive : 0, isPay : true},
    containerData:[]
  },
  onLoad: function (option){
    wx.setNavigationBarTitle({title: '订单详情'})
    // 初始化信息
    _this = this

    this.ajax.orderDetail(option.orderId);

    if(option.isPay) this.setData({isPay: true})
  },
  onPay : function(e){
    if(this.data.status.isPay){
      this.data.status.isPay = false;
      this.setData({status : this.data.status});
      this.ajax.paymentOrder(e.target.dataset.sequence);
    }
  },
  onGo: function(e){
    wx.navigateTo({url: e.target.dataset.url})
  },
  onCall: function (e) {
      wx.makePhoneCall({
          phoneNumber: e.target.dataset.number //配送员电话
      })
  },
  onRefundOrder : function(e){
    wx.showModal({
      title: '提示',
      content: '确认退款',
      success: function(res) {
        if (res.confirm) {
          _this.ajax.refundOrder(e.target.dataset.sequence)
        } else if (res.cancel) {
          
        }
      }
    })
  },
  onContainerData : function(){
    if(this.data.containerData.length == 0){
      this.ajax.findContainerData(this.data.order.orderSequenceNumber, this.data.orderId);
    }
  },
  onAgainBuy : function(){
      this.ajax.directPurchase(this.data.order.items)
  },
  openCart : function(msgNames,data){
    if(msgNames.length > 0){
      wx.showModal({
        title: '无货提示',
        confirmText :"继续下单",
        content: "缺货："+msgNames.join("、"),
        success: function(res) {
          if (res.confirm) {
            app.Cart.ADD_All(data);
            app.onGo("../cart/cart")
          } else if (res.cancel) {
            return false
          }
        }
      })
    }else{
      app.Cart.ADD_All(data);
      app.onGo("../cart/cart")
    }
  },
  ajax : winAjax
})




















