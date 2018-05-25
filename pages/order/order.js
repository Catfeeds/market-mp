const config = require('../../config')

var app = getApp()
var _this = null
var _load = false

var winAjax = {
  ordersData : function(){

      var option = config.showOrders;
      console.log(option.data)
      option.data.pageSize = 10
      option.data.marketId = 0
      option.data.statusEnter = _this.data.status.tabActive || 11;  // 11:全部

      option.success = function(data){
          wx.hideLoading();
          if(data.data.code == 100){
            _this.data.status.scrollUpStop = true; // 没有数据
            _this.setData({
              status : _this.data.status
            });
            _load = false
            return false
          }

          data = data.data.response ? data.data.response.datas : {};
          for(var i in data){
            data[i].itemsSize = data[i].items.length;
          }

          if(_load){
            _load = false;
            data = _this.data.ordersData.concat(data);
          }
        
          _this.setData({
              ordersData: data || false
          });
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
    ordersData : {},
    scrollTop : 0,
    status : {
      tabActive : 11,
      scrollUpStop : false
    }
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({title: '订单'})

    // 初始化信息
    _this = this

    if(option && option.tabActive){
      this.data.status.tabActive = option.tabActive
      this.setData({status: this.data.status});
    }

    // 获取订单数据
    this.ajax.ordersData()

  },
  onUnload : function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上1个页面
    prevPage.onReload()
  },
  onScrollTop: function (e) {
      wx.showNavigationBarLoading() //在标题栏中显示加载
      wx.setNavigationBarTitle({ title: '刷新中...' })
      config.showOrders.data.pageIndex = 1
      this.ajax.ordersData();
      setTimeout(function () {
          wx.hideNavigationBarLoading() //完成停止加载
          wx.setNavigationBarTitle({ title: '订单' })
          wx.stopPullDownRefresh() //停止下拉刷新
      }, 1500);
  },
  onScrollBottom: function(e){
    // if(this.data.status.tabActive == 11){
      if(this.data.status.scrollUpStop){
        return false;
      }
      wx.showLoading({
        title: '加载中',
        mask : true
      })
      _load = true;
      config.showOrders.data.pageIndex += 1
      
      this.ajax.ordersData();
    // }
  },
  onStatus: function(e){ 
    this.data.status[e.target.dataset.statusKey] = e.target.dataset.statusVal ? e.target.dataset.statusVal : (this.data.status[e.target.dataset.statusKey] ? false : true);

    // 特殊处理 订单状态数据
    if(e.target.dataset.statusKey == 'tabActive'){
      this.setData({ordersData: {}});
      this.data.status.scrollUpStop = false;  // 重置下拉
      config.showOrders.data.pageIndex = 1;    // 重置分页
      this.ajax.ordersData();                 // 拉取数据
    }

    this.setData({status : this.data.status});
  },
  onRefundOrder : function(e){
    wx.showModal({
      title: '提示',
      content: '确认退款',
      success: function(res) {
        if (res.confirm) {
          this.ajax.refundOrder(e.target.dataset.sequence)
        } else if (res.cancel) {
          
        }
      }
    })
  },
  onGo: function(e){
    wx.navigateTo({url: e.target.dataset.url})
  },
  onAgainBuy : function(e){
    for(var i in this.data.ordersData){
      if(this.data.ordersData[i].orderId == e.target.dataset.id){
        this.ajax.directPurchase(this.data.ordersData[i].items)
        break
      }
    }
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