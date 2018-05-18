const config = require('../../config')
const icons = require('../../icons')

var app = getApp();
var _this = null;

var winAjax = {
    orderDetail : function(orderId){
        var option = config.orderDetail;
        option.data.orderId = orderId;
        option.success = function(data){
            // var data = {"data":{"msg":"请求成功","code":0,"response":{"targetName":"小惠便利店杨箕店","orderId":100691,"actualPrice":2,"statusValue":"发货中","showActualPrice":"0.02","distributionFee":0,"discountPrice":899,"orderStatus":32,"receiptPhone":"185****0624","marketId":100001,"deliverType":1,"deliverTitle":"自提进度","deliverResult":"待取货","showDistributionFee":"0.00","orderSequenceNumber":"1553212233728168","sequenceNumber":"90820171203005055355047464","marketAddress":"广东广州越秀区杨箕大街（东山新天地旁）（东山新天地旁）","address":"广东广州越秀区（东山新天地旁）","addressTitle":"取货地址：","refundReason":"","showDiscountPrice":"8.99","targetTitle":"取货点：","marketName":"杨箕店","deliverValue":"到店自提","createTime":"2017-12-03 00:54:24","items":[{"itemTemplateId":100000,"itemId":100511,"image":"http://xmarket.oss-cn-shenzhen.aliyuncs.com/item/6909409014240.jpg","marketPrice":500,"quantity":1,"showPrice":"0.01","totalPrice":1,"price":1,"showTotalPrice":"0.01","showMarketPrice":"5.00","name":"上好佳薯条番茄味40G","itemSnapshotId":101107},{"itemTemplateId":100001,"itemId":100512,"image":"http://xmarket.oss-cn-shenzhen.aliyuncs.com/item/6909995103687.jpg","marketPrice":400,"quantity":1,"showPrice":"0.01","totalPrice":1,"price":1,"showTotalPrice":"0.01","showMarketPrice":"4.00","name":"旺旺小小酥（葱香鸡肉味）60g","itemSnapshotId":101108}],"totalItemQuantity":2}},"header":{"Server":"Apache-Coyote/1.1","Set-Cookie":"JSESSIONID=127D18C5A1AF1717E73E1AE510469EA9; Path=/market; HttpOnly","Content-Type":"application/json;charset=UTF-8","Transfer-Encoding":"chunked","Date":"Tue, 15 Aug 2017 10:43:01 GMT"},"statusCode":200,"errMsg":"request:ok"};
            data = data.data ? data.data.response : {};
            _this.setData({
                orderData: data || {}
            });
        };
        app.ajax(_this,option);
    }
}


Page({
  data: {
    mark : 'xxxx店铺',
    pickupTipMsg : '货柜正在出货中、请稍后...',
    containerData : ["04","A003","A004","A004"],
    containerMsg : "",
    orderData : [],
    status : {},
    icons : icons()
  },
  onLoad: function (option) {
  	wx.setNavigationBarTitle({title: '扫码结果'})
    // 初始化信息
    _this = this

    option.containerData = option.containerData  || this.data.containerData.join(',')

    if(option.orderId){
      this.ajax.orderDetail(option.orderId)
    }

    this.setData({
      mark : option.mark,
      pickupTipMsg : option.pickupTipMsg,
      containerData : this.toHeavy(option.containerData || "")
    })
  },
  onUnload : function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 3]; //上2个页面
    prevPage.onLoad()
    wx.navigateBack(2);
  },
  toHeavy: function(data){
    var ary = data.split(',') || []  //["04","04", "A004", "A005"];
    var res = {};
    var msg = [];
    for(var i in ary) {
      if(!ary[i]) continue
      var count = 0;
      for(var j in ary) {
        if(!ary[i]) continue
        if(ary[i] == ary[j]) {
          count++;
          if(count > 1) ary[j] = false
        }
      }
      res[i] = count
    }

    for(var i in res) {
      if(res[i] > 1) {
        msg.push("出口：" + ary[i] + "出货" + res[i] + "次")
      }
    }
    var reAry = []
    for(var i in ary) {
      if(ary[i]) reAry.push(ary[i])
    }
    this.setData({
      containerMsg : msg
    })
    return reAry
  },
  ajax : winAjax
})