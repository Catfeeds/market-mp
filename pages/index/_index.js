const config = require('../../config')

var app = getApp()
var _this = null

var winAjax = {
    getMarketInformationCount: function () {
        var option = config.getMarketInformationCount;
        option.data.passportId = app.data.userInfo.passportId
        option.success = function (data) {
            if (data.data.code == 0) {
                data = data.data.response ? data.data.response : {};
                _this.setData({
                    msgCount: data
                });
            }
        }
        app.ajax(_this, option)
    }
}

Page({
    data: {
        msgCount: {},
        passportId: false
    },
    onLoad: function (option) {
        wx.setNavigationBarTitle({ title: '选择门店' })
        _this = this
        _this.setData({ passportId: app.data.userInfo.passportId })

        // 加载未读消息数量
        // _this.ajax.getMarketInformationCount()
    },
    onReload: function () {
        _this.onLoad()
    },
    ajax: winAjax
})