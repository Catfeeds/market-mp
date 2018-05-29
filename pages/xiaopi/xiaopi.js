const config = require('../../config')

var app = getApp()
var _this = null
var _scrollLoad = true

var winAjax = {
    getMarketItemClassifyVoList: function () {
        var option = config.getMarketItemClassifyVoList;
            option.data.marketId = _this.data.currMarket.id
            option.data.itemClassifyVisible = 3
            console.log("====> currMarket id: ", _this.data.currMarket.id)

        option.success = function (data) {
            console.log("====> " + option.url, data)
            _this.setData({
                curTab: data.data.response.datas[0].id,
                typeList: data.data.response ? data.data.response.datas : {}
            })

            // 加载商品列表
            config.getItemByClassifyIds.data.classifyId = data.data.response.datas[0].id
            _this.ajax.goodData()
        };
        app.ajax(_this, option);
    },
    goodData: function () {
        var option = config.getItemByClassifyIds;
        console.log(_this.data)
        // option.data.classifyId = _this.data.curTab
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

        option.data.marketId = _this.data.currMarket.id
        option.data.passportId = _this.data.userInfo.passportId

        option.success = function (data) {
            var goodSort = []

            // 没有更多数据
            if (data.data.code == 100) {
                if (config.getItemByClassifyId.data.pageIndex == 0) {
                    _this.setData({ isGoodData: true, goodData: {}, goodSort: [] })
                } else {
                    _this.setData({ isGoodData: true })
                }
                return true;
            }

            data = data.data.response.pageItemMsg

            for (var i in data) {
                if (cart[data[i].itemId]) {
                    data[i].num = cart[data[i].itemId].num;
                    data[i].check = cart[data[i].itemId].check;
                } else {
                    data[i].num = 0;
                    data[i].check = false;
                }
                goodSort.push(data[i].itemId)
                goodData[data[i].itemId] = data[i];
            }

            if (config.getItemByClassifyIds.data.pageIndex != 0 && !_scrollLoad) {
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
    },
    filterValidItems: function (cb) {
        var option = config.filterValidItems;
        var cart = app.Cart.getCart();
        option.data.itemSet = []
        for (var i in cart) {
            option.data.itemSet.push(i)
        }
        if (option.data.itemSet.join(',') == "") return false

        option.data.itemSet = option.data.itemSet.join(',');
        option.success = function (data) {
            if (data.data.code == 0) {
                data = data.data.response.datas
                var Cart = {} //新的购物车
                for (var i in data) {
                    if (cart[data[i]]) {
                        Cart[data[i]] = cart[data[i]]
                    }
                }
                // app.Cart.saveCart(Cart, null);
                _this.data.checkTotal = app.Cart.getCheckTotal(); // 加载选中商品total
                _this.setData(_this.data);
                typeof cb == "function" && cb(_this.data.checkTotal.totalNum > 0 ? true : false)
            }
        }
        app.ajax(_this, option);
    }
}

Page({
    data: {
        userInfo: {},
        typeList: [],
        cartData: [],
        goodData: [],
        goodSort: [],
        currMarket: false,
        checkTotal: {
            speciesNum: 0,
            totalNum: 0,
            totalMoney: 0.00,
            thriftMoney: 0.00
        },
        curTab: null,
        curTabIndex: 0,
        curTag: 0,
        curTagIndex: 0,
        scrollTop: 0,
        isTotal: true
    },
    onLoad: function () {
        _this = this
        wx.setNavigationBarTitle({ title: '值得囤' })
        var userInfo = getApp().data.userInfo
        _this.setData({
            currMarket: app.Market.get(),
            userInfo: userInfo
        })

        // 加载分类
        _this.ajax.getMarketItemClassifyVoList()

        // 检查购物车
        _this.ajax.filterValidItems()
      
    },
    onReload: function () {
        this.setData({
            cartData: app.Cart.getCart(),
            checkTotal: app.Cart.getCheckTotal()
        })
        
        // 加载分类
        _this.ajax.getMarketItemClassifyVoList()

        // 检查购物车
        _this.ajax.filterValidItems()
    },
    setDefaultImg: function (e) {
        this.data.goodData[e.target.dataset.id].imageUrl = 'http://xmarket.oss-cn-shenzhen.aliyuncs.com/market/app/icon/defaultImg.png'
        this.setData({
            goodData: this.data.goodData
        })
    },
    onItemTab: function (e) {
        let id = e.currentTarget.dataset.id,
            index = parseInt(e.currentTarget.dataset.index);
        this.setData({
            curTab: id,
            curTabIndex: index,
            isTotal: true
        });
        config.getItemByClassifyIds.data.pageIndex = 0
        config.getItemByClassifyIds.data.classifyId = id
        _this.ajax.goodData()
    },
    onItemTag: function (e) {
        let id = e.currentTarget.dataset.id,
            index = parseInt(e.currentTarget.dataset.index);
        if (id > 0) {
            this.setData({
                isTotal: false,
                curTag: id
            })
            config.getItemByClassifyIds.data.pageIndex = 0
            config.getItemByClassifyIds.data.classifyId = id
            _this.ajax.goodData()
        }
        if (id == -1) {
            id = this.data.curTab
            this.setData({
                isTotal: true,
                curTag: id
            })
            config.getItemByClassifyIds.data.pageIndex = 0
            config.getItemByClassifyIds.data.classifyId = id
            _this.ajax.goodData()
        }
    },
    onShow: function () {
        console.log("小批onShow")
        this.setData({
            checkTotal: app.Cart.getCheckTotal()
        })
        // 加载分类
        _this.ajax.getMarketItemClassifyVoList()
        // 检查购物车
        _this.ajax.filterValidItems()
    },
    onCart: function (e) {
        var data = {};
        // data.status = this.data.status;
        data.goodData = this.data.goodData;
        data.cartData = this.data.cartData;
        data.checkTotal = this.data.checkTotal;
        console.log(data.checkTotal)
        _this.setData(app.Cart[e.target.dataset.type](data, e.target.dataset.id));
    },
    onGoCart: function () {
        wx.navigateTo({ url: '../cart/cart' })
    },
    onScrollTop: function (e) {
        wx.showNavigationBarLoading() //在标题栏中显示加载
        wx.setNavigationBarTitle({ title: '刷新中...' })
        config.getItemByClassifyIds.data.pageIndex = 0
        _this.ajax.goodData();
        setTimeout(function () {
            wx.hideNavigationBarLoading() //完成停止加载
            wx.setNavigationBarTitle({ title: '值得囤' })
            wx.stopPullDownRefresh() //停止下拉刷新
        }, 2000);
    },
    onScrollBottom: function (e) {
        if (!_scrollLoad) return
        _scrollLoad = false
        config.getItemByClassifyIds.data.pageIndex += 1
        _this.ajax.goodData();
    },
    onGoIndex: function () {
        wx.navigateTo({ url: '../index/index' })
    },
    ajax: winAjax
})