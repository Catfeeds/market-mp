const config = require('../../config')
const icons = require('../../icons')

var QR = require("../../utils/qrcode.js");

var app = getApp();
var _this = null;
var time = null;
var s = 500;  // 未扫码前 500毫秒一次请求, 扫码之后 3秒一次请求
var isQR = false;
var winAjax = {
  findContainerData : function(orderSequenceNumber,orderId){
    var option = config.findContainerData
    option.data.orderSequenceNumber = orderSequenceNumber
    option.success = function(data){
      // {"msg":"请求成功","code":0,"response":{"mark":"请从恒大山水城店以下出货口取走商品","containerData":["A106","A108","A206"]},"accessToken":""}
      if(data.data.code == 0){
        data = data.data.response
        wx.navigateTo({url : 'scanSuccess?orderId='+orderId+'&mark='+data.mark+'&pickupTipMsg='+data.pickupTipMsg+'&containerData='+data.containerData.join(',')})
      }else{
        // 已扫码
        if(data.data.code == 3005){
          s = 3000
          _this.setData({
            scanShow : true,
            scanMsg : data.data.msg
          })
        }

        // data.data.code == 3006  未扫码
        if(data.data.code == 3006 && !isQR){
          isQR = true
          QR.qrApi.draw(orderSequenceNumber,"mycanvas",_this.data.size.w,_this.data.size.h);
        }

        time = setTimeout(function(){
            _this.ajax.findContainerData(orderSequenceNumber,orderId)
        },s)

      }
    }
    app.ajax(_this, option)
  }
}


Page({
  data: {
  	option :{},
    size : false,
    scanShow : false,
    status : {tabActive : 0},
    timeStart : true,
    scanMsg : "扫码成功、正在拣货中...",//出货口(01)已经打开，您可以现在取货(如已经取货请忽略)；订单未完成，请不要走开喔！
    icons : icons()
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({title: '扫码取货'})
    clearTimeout(time)
    isQR = false
    // 初始化信息
    _this = this
    this.setData({
      option:option
    });
    this.setCanvasSize();
    _this.ajax.findContainerData(option.url,option.orderId)
  },
  onUnload : function(){
    console.log('...onUnload..')

     clearTimeout(time)
     isQR = false
  },
  //适配不同屏幕大小的canvas
  setCanvasSize:function(){
    var size={};
    try {
        var res = wx.getSystemInfoSync();
        var scale = 410/320;//不同屏幕下canvas的适配比例；设计稿是750宽
        var width = res.windowWidth/scale;
        var height = width;//canvas画布为正方形
        size.w = width;
        size.h = height;
  	    _this.setData({
  	      size:size
  	    });
      } catch (e) {
        // Do something when catch error
        console.log("获取设备信息失败"+e);
      } 
    return size;
  },
  ajax : winAjax
})