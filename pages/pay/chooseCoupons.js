const config = require('../../config')

var app = getApp()
var _this = null
var _load = false


var winAjax = {
  filterCoupons : function(option){
      var option = config.filterCoupons;

      var itemSet = false,  checkGood = app.Cart.getCheckData().cartData;
      for(var key in checkGood){
        if(!itemSet) itemSet = {}
        if(itemSet[checkGood[key].itemId] == null) itemSet[checkGood[key].itemId] = {};
        itemSet[checkGood[key].itemId] = checkGood[key].num;
      }
      option.data.itemSet = itemSet;
      option.data.marketId = getApp().Market.get().id;

      console.log(option.data)

      option.success = function(data){
        // data = {data:{"msg":"请求成功","code":0,"response":{"datas":[{"timeExplain":"有效期至2017.10.20","backgroundImage":null,"couponTemplateId":100000,"discountAmount":5,"triggerAmount":10,"title":"新用户专享大礼包","type":1,"useCondition":1,"showDiscountAmount":"￥0.05元","showTriggerAmount":"满0.10元可用","useMarket":"全部商店","name":"新手礼宝","useTime":"未使用","id":100000,"targetMarketId":0,"beginTime":"2017-10-19 17:21:29","endTime":"2017-10-20 17:21:29","desc":"优惠券"}]}}}
          if(data.data.code == 100){
            _this.setData({
              couponsData : false
            });
          }
          data = data.data.response ? data.data.response.datas : {};

          _this.setData({
              couponsData: data
          });
      }
      app.ajax(_this, option)

  }
}


Page({
  data: {
    couponsData : false
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({title: '选择优惠券'})

    // 初始化信息
    _this = this
    console.log(option)

    this.ajax.filterCoupons()
  },
  onChooseCoupon : function(e){
    var coupons = this.data.couponsData
    for(var i in coupons){
      if(coupons[i].id == e.target.dataset.id){
        coupons = coupons[i]
        break;
      }
    }
    console.log(coupons)

    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setData({
      coupon : coupons
    })
    wx.navigateBack();
  },
  onChoose : function(e){
    var couponsData = this.data.couponsData
    for(var i in couponsData){
      if(couponsData[i].id == e.target.dataset.id){
        couponsData[i].show = !couponsData[i].show
        break;
      }
    }
    this.setData({couponsData : couponsData});
  },
  onGo: function(e){
    wx.navigateTo({url: e.target.dataset.url})
  },
  onBack: function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setData({
      coupon : {}
    })
    wx.navigateBack();
  },
  ajax : winAjax
})