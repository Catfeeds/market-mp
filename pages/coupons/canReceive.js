const config = require('../../config')

var app = getApp()
var _this = null
var _load = false


var winAjax = {
  waitForReceiveCoupons : function(){
      var option = config.waitForReceiveCoupons;
      option.success = function(data){
         //data = {data:{"msg":"请求成功","code":0,"response":{"datas":[{"timeExplain":"有效期至2017.10.20","backgroundImage":null,"couponTemplateId":100200,"discountAmount":5,"triggerAmount":10,"title":"新用户专享大礼包","type":1,"useCondition":1,"showDiscountAmount":"￥0.05元","showTriggerAmount":"满0.10元可用","useMarket":"全部商店","name":"新手礼宝","useTime":"未使用","id":100000,"targetMarketId":0,"beginTime":"2017-10-19 17:21:29","endTime":"2017-10-20 17:21:29","desc":"优惠券"}]}}}
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
  },
  receiveCoupons : function(couponTemplateId){
    var option = config.receiveCoupons
    option.data.couponTemplateId = couponTemplateId
    option.success = function(data){
          console.log(data)
          wx.showToast({
            title: '领取成功',
            icon: 'success',
            duration: 2000
          })
          _this.ajax.waitForReceiveCoupons()
    }
    app.ajax(_this, option)
  }
}


Page({
  data: {
    couponsData : false,
    status : {
      tabActive : 1,
      scrollUpStop : false
    }
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({title: '可领优惠券'})

    // 初始化信息
    _this = this

    this.ajax.waitForReceiveCoupons()
  },
  onUnload : function(){

    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上2个页面
    prevPage.onLoad()
  },
  onScrollTop: function(e){
  },
  onScrollBottom: function(e){

  },
  onChoose : function(e){
    this.ajax.receiveCoupons(e.target.dataset.id)
  },
  onLookRule: function (e) {
      console.log(this.data.couponsData)
      var couponsData = this.data.couponsData
      for (var i in couponsData) {
          if (couponsData[i].couponTemplateId == e.target.dataset.id) {
              couponsData[i].show = !couponsData[i].show
              break;
          }
      }
      this.setData({ couponsData: couponsData });
  },
  onGo: function(e){
    wx.navigateTo({url: e.target.dataset.url})
  },
  ajax : winAjax
})