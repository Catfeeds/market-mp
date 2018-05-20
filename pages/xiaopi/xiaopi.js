const config = require('../../config')

var app = getApp()
var _this = null
var _scrollLoad = true

var winAjax = {
    getMarketItemClassifyVoList: function () {
        var option = config.getMarketItemClassifyVoList;
        // option.data.marketId = app.data.currMarket.id
        console.log("====> currMarket id: ", app.data.currMarket)

        option.success = function (data) {
            console.log("====> " + option.url, data)
            _this.setData({
                typeList: data.data.response ? data.data.response.datas : {}
            })
        };
        app.ajax(_this, option);
    },
    getItemByClassifyId: function () {
        var option = config.getItemByClassifyId;
        var goodData = _scrollLoad ? {} : _this.data.goodData, cart = app.Cart.getCart();
        // if (!_this.data.currMarket.id || _this.data.currMarket.id == null) {
        //     _this.data.status.canvasShow = true;
        //     _this.data.temps.temp_canvas = "temp_offcanvas_market";
        //     _this.setData({
        //         status: _this.data.status,
        //         temps: _this.data.temps
        //     })
        //     return false;
        // }

        // option.data.marketId = _this.data.currMarket.id
        // option.data.itemTypeId = _this.data.status.typeSubShow == 0 ? _this.data.status.typeShow : _this.data.status.typeSubShow
        option.success = function (data) {
            var goodSort = []
            // 没有更多数据
            if (data.data.code == 100) {
                if (config.getItemByClassifyId.data.pageIndex == 1) {
                    _this.setData({ isGoodData: true, goodData: {}, goodSort: [] })
                } else {
                    _this.setData({ isGoodData: true })
                }
                return true;
            }

            data = data.data.response.datas;
            for (var i in data) {
                if (cart[data[i].itemId]) {
                    data[i].num = cart[data[i].itemId].num;
                    data[i].check = cart[data[i].itemId].check;
                } else {
                    data[i].num = 0;
                    data[i].check = false;
                }
                goodSort.push(data[i].id)
                goodData[data[i].id] = data[i];
            }

            if (config.getItemByClassifyId.data.pageIndex != 1 && !_scrollLoad) {
                goodSort = _this.data.goodSort.concat(goodSort)
            }

            _this.setData({
                isGoodData: false,
                goodData: goodData,
                goodSort: goodSort
            })
            _scrollLoad = true
        }
        app.ajax(_this, option);
    }
}

Page({
    data: {
        typeList: [],
        goodData: {},
        goodSort: []
    },
    onLoad: function () {
        _this = this
        wx.setNavigationBarTitle({ title: '小批' })

        // 加载分类
        _this.ajax.getMarketItemClassifyVoList()

        // 加载商品
        _this.ajax.getItemByClassifyId();
    },
    ajax: winAjax
})