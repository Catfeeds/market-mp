const config = require('../../config')

var app = getApp()
var _this = null
var _load = false


var winAjax = {
  // 有效 tapActive ： 1
  showValidCoupons : function(){
      var option = config.showValidCoupons;
      this.setCouponsData(option);
  },
  // 已使用 tapActive ： 2
  showUseCoupons : function(){

      var option = config.showUseCoupons;
      this.setCouponsData(option);
  },
  // 无效 tapActive ： 3
  showInvalidCoupons : function(){
      var option = config.showInvalidCoupons;
      this.setCouponsData(option);
  },
  setCouponsData : function(option){
      option.success = function(data){
        // data = {data:{"msg":"请求成功","code":0,"response":{"datas":[{"timeExplain":"有效期至2017.10.20","backgroundImage":null,"couponTemplateId":100000,"discountAmount":5,"triggerAmount":10,"title":"新用户专享大礼包","type":1,"useCondition":1,"showDiscountAmount":"￥0.05元","showTriggerAmount":"满0.10元可用","useMarket":"全部商店","name":"新手礼宝","useTime":"未使用","id":100000,"targetMarketId":0,"beginTime":"2017-10-19 17:21:29","endTime":"2017-10-20 17:21:29","desc":"优惠券"}]}}}
          if(data.data.code == 0){
              data = data.data.response ? data.data.response.datas : {};
              _this.setData({
                  couponsData: data
              });
          } else if (data.data.code == 1) {
              _this.setData({
                  couponsData: false
              });
              console.log(_this.data.couponsData)
              return
          }
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
    wx.setNavigationBarTitle({title: '优惠券'})

    // 初始化信息
    _this = this

    if(option && option.tabActive){
      this.data.status.tabActive = option.tabActive
    }else{
      this.data.status.tabActive = 1
    }
      this.setData({status: this.data.status});
    // 获取未使用优惠券数据
    this.ajax.showValidCoupons()
  },
  onScrollTop: function(e){
  },
  onScrollBottom: function(e){

  },
  onStatus: function(e){ 
    this.data.status[e.target.dataset.statusKey] = e.target.dataset.statusVal ? e.target.dataset.statusVal : (this.data.status[e.target.dataset.statusKey] ? false : true);

    // 特殊处理 订单状态数据
    if(e.target.dataset.statusKey == 'tabActive'){
      if(e.target.dataset.statusVal == '1'){

        config.showValidCoupons.data.pageIndex = 1
        this.ajax.showValidCoupons()  
      }else if(e.target.dataset.statusVal == '2'){

        config.showUseCoupons.data.pageIndex = 1
        this.ajax.showUseCoupons()
      }else if(e.target.dataset.statusVal == '3'){

        config.showInvalidCoupons.data.pageIndex = 1
        this.ajax.showInvalidCoupons()
      }
    }

    this.setData({status : this.data.status});
  },
  onChoose : function(e){
      console.log(this.data.couponsData)
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
      // 检测是否绑定手机
      if (app.data.userInfo.hasBinding == 0) {
          wx.navigateTo({ url: '../my/bindPhone' })
      } else {
          wx.navigateTo({ url: e.target.dataset.url })
      }
  },
  ajax : winAjax
})