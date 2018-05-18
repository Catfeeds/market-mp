const config = require('../../../config')
const icons = require('../../../icons')

var app = getApp();
var _this = null;

var winAjax = {
  loaderRefundLabel : function(){
    var option = config.loaderRefundLabel
    option.success = function(data){
      data = data.data.response.datas
      for(var i in data){
        _this.data.refundData[data[i].id] = data[i]
      }
      _this.setData({
        refundData : _this.data.refundData
      })
    }
    app.ajax(_this, option)
  }
}


Page({
  data: {
    refundData : {},
    status : {check : 0},
    icons : icons()
  },
  onLoad: function () {
    wx.setNavigationBarTitle({title: '退款原因'})
    // 初始化信息
    _this = this
 
    this.ajax.loaderRefundLabel()

  },
  onSubmit: function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setData({
      title : this.data.refundData[this.data.status.check].title
    })
    wx.navigateBack();
  },
  onStatus: function(e){
    this.data.status[e.target.dataset.statusKey] = e.target.dataset.statusVal ? e.target.dataset.statusVal : (this.data.status[e.target.dataset.statusKey] ? false : true);
 
    this.setData({
      status : this.data.status
    });
  },
  ajax : winAjax
})

