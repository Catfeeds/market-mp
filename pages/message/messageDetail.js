const config = require('../../config')

var app = getApp()
var _this = null

var winAjax = {
    getMarketInformationEntityById: function (options) {
        var option = config.getMarketInformationEntityById;
        option.data.id = options.contentId
        option.success = function (data) {
            wx.hideLoading();
            data = data.data.response ? data.data.response.datas[0] : {}
            _this.setData({
                msgContentData: data || false
            })
        };
        app.ajax(_this, option)
    }
}
Page({
  data: {
      msgContentData: false
  },
  onLoad: function (options) {
      _this = this
      wx.setNavigationBarTitle({ title: '内容详情' })
      wx.showLoading({
          title: '加载中',
          mask: true
      })
      this.ajax.getMarketInformationEntityById(options)

    //   wx.request({
    //       url: 'https://market.xiaohuistore.com/market/openapi/getMarketInformationEntityById?id=' + options.contentId, 
    //       header: {
    //           'content-type': 'application/json' // 默认值
    //       },
    //       success: function (res) {
    //           console.log(res.data.response.datas)
    //             console.log(_this)
    //           _this.setData({
    //               msgContentData: res.data.response.datas
    //           })
    //       }
    //   })

  },
  ajax: winAjax
})