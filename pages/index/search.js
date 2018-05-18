const config = require('../../config')
const icons = require('../../icons')

var app = getApp()
var market = null
var _this = null
var upShowSearch = 0 // 上一次显示搜索面板
var _scrollLoad = true

var winAjax = {
    loaderHotSearch: function () {
        var option = config.loaderHotSearch
        option.success = function (data) {
            _this.setData({
                searchHotData: data.data.response.datas
            })
        }
        app.ajax(_this, option);
    },
    goodData: function (searchKeyValue) {
        _this.setData({ searchKeyValue: searchKeyValue })

        var goodData = _scrollLoad ? {} : _this.data.goodData, cart = app.Cart.getCart();
        var option = config.pageItems;
        option.data.marketId = market.id
        option.data.searchKeyValue = searchKeyValue
        option.data.itemTypeId = 0
        console.log(option.data)
        option.success = function (data) {
            var goodSort = []
            if (data.data.code == 100) {
                if (config.pageItems.data.pageIndex == 1) {
                    _this.setData({ noData: true, goodData: {}, goodSort: [] })
                } else {
                    _this.setData({ isGoodData: true })
                }
                return true;
            }
            data = data.data.response.pageItemMsg;
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

            if (config.pageItems.data.pageIndex != 1) {
                goodSort = _this.data.goodSort.concat(goodSort)
            }
            _this.setData({
                noData: false,
                isGoodData: false,
                goodData: goodData,
                goodSort: goodSort
            })
            _scrollLoad = true
        }
        app.ajax(_this, option);
        option.data.searchKeyValue = ''
    },
    fuzzyMatchItemName: function (fuzzy) {
        var option = config.fuzzyMatchItemName
        option.data.fuzzyItemName = fuzzy
        option.data.marketId = market.id
        option.success = function (data) {
            data = data.data.response.datas
            _this.data.status.showSearch = 1
            _this.data.status.searchClose = true
            _this.data.status.fuzzyFocus = true
            _this.setData({
                status: _this.data.status,
                fuzzyData: data || {}
            })
        }
        app.ajax(_this, option)
    },
    filterValidItems: function (cb) {
        var option = config.filterValidItems;
        var cart = app.Cart.getCart();
        option.data.itemSet = []
        for (var i in cart) {
            option.data.itemSet.push(i)
        }
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
                app.Cart.saveCart(Cart, null);
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
        userInfo: { status: 4 },
        placeholder: "搜索商品",
        fuzzyMatchItemName: "",
        fuzzyData: {},
        searchKeyValue: '',
        searchHistoryData: [],
        searchHotData: [],
        goodSort: [],
        goodData: {},
        cartData: {},
        checkTotal: {
            totalNum: 0,
            totalMoney: 0.0,
            speciesNum: 0,
            thriftMoney: 0.0
        },
        status: {
            cartShow: false,
            checkAll: false,
            showSearch: 0,
            searchClose: false,
            fuzzyFocus: true
        },
        icons: icons()
    },
    onLoad: function () {
        wx.setNavigationBarTitle({ title: '商品搜索' })
        // 初始化信息
        _this = this
        market = app.Market.get();

        this.data.checkTotal = app.Cart.getCheckTotal(); // 加载选中商品total
        this.ajax.loaderHotSearch();

        this.setData({
            userInfo: app.data.userInfo,
            checkTotal: this.data.checkTotal,
            searchHistoryData: app.Search.getInfo()
        })
    },
    onReload: function () {
        this.data.status.checkAll = app.Cart.getCartIsCheckAll()
        this.setData({
            status: this.data.status,
            cartData: app.Cart.getCart(),
            checkTotal: app.Cart.getCheckTotal()
        })
    },
    onUnload: function () {
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; //上1个页面
        prevPage.onReload()
    },
    onScrollBottom: function (e) {
        if (!_scrollLoad) return
        _scrollLoad = false
        config.pageItems.data.pageIndex += 1
        this.ajax.goodData(this.data.searchKeyValue);
    },
    onStatus: function (e) {
        var data = {};
        this.data.status[e.target.dataset.statusKey] = e.target.dataset.statusVal ? e.target.dataset.statusVal : (this.data.status[e.target.dataset.statusKey] ? false : true);
        data.status = this.data.status;

        if (e.target.dataset.tempKey && e.target.dataset.tempVal) {
            this.data.temps[e.target.dataset.tempKey] = e.target.dataset.tempVal;
            data.temps = this.data.temps;
        }

        // 特殊处理 购物车 
        if (e.target.dataset.statusKey == 'cartShow' && this.data.status.cartShow) {
            data.cartData = app.Cart.getCart()         // 加载购物车数据
            data.checkTotal = app.Cart.getCheckTotal() // 加载购物车数据
            data.status.checkAll = app.Cart.getCartIsCheckAll() // 加载全选按钮
            getApp().statistical.notifyClickShoppingCart(); // 统计
        }

        _this.setData(data);
    },
    onCartCheckAll: function (e) {
        _this.setData(app.Cart.CHECKALL(this.data, e.target.dataset.check));
    },
    onCart: function (e) {
        var data = {};
        data.status = this.data.status;
        data.goodData = this.data.goodData;
        data.cartData = this.data.cartData;
        data.checkTotal = this.data.checkTotal;
        _this.setData(app.Cart[e.target.dataset.type](data, e.target.dataset.id));
    },
    onSearch: function (e) {
        var _e = e.detail.value.trim()
        if (_e == null || _e == "") {
            _this.data.status.searchClose = false
            _this.data.status.showSearch = upShowSearch == 1 ? 0 : upShowSearch;
            _this.setData({
                status: _this.data.status,
                fuzzyData: []
            })
        } else {
            upShowSearch = _this.data.status.showSearch
            this.ajax.fuzzyMatchItemName(e.detail.value)
        }
    },
    onSearchGood: function (e) {
        app.Search.saveSearchValue(e.target.dataset.value)
        upShowSearch = 2
        this.data.status.showSearch = 2
        this.data.status.fuzzyFocus = false
        this.setData({
            placeholder: e.target.dataset.value,
            searchHistoryData: app.Search.getInfo(),
            status: this.data.status
        })

        config.pageItems.data.pageIndex = 1 // 还原参数
        this.ajax.goodData(e.target.dataset.value)
    },
    onSearchClose: function () {
        _this.data.status.fuzzyFocus = true
        _this.setData({
            fuzzyMatchItemName: "",
            status: _this.data.status
        })
    },
    onBack: function () {
        wx.navigateBack({
            delta: 1
        })
    },
    onCancel: function () {
        // _this.data.status.showSearch = 0;
        // _this.setData({
        //     fuzzyMatchItemName : '',
        //     status : _this.data.status,
        //     fuzzyData: []
        // })
        wx.navigateBack()
    },
    onSearchRemoveAll: function () {
        app.Search.removeAll()
        this.setData({
            searchHistoryData: []
        })
    },
    onPay: function (e) {
        var mode = 2;
        var cartData = app.Cart.getCart();
        var keyArr = Object.keys(cartData);
        for (var i in keyArr) {
            if (cartData[keyArr[i]].pickUpMode == 1) {
                mode = 1;
                break;
            }
        }

        if (JSON.stringify(cartData) == "{}") {
            wx.showModal({
                title: '提示',
                showCancel: false,
                confirmText: '去选购',
                content: '您的购物车是空的哦~',
                success: function (res) { }
            })
            return
        }
        // 检测是否绑定手机
        if (app.data.userInfo.hasBinding == 0) {
            wx.navigateTo({ url: '../my/bindPhone' })
        } else {
            // 检测是否完善用户信息
            if (this.data.userInfo.auth) {
                // 检测是否有购买商品数量
                _this.ajax.filterValidItems(function (isPay) {
                    if (isPay && mode == 2) {
                        app.onGo('../pay/pay?mode=2')
                    } else if (isPay && mode == 1) {
                        app.onGo('../pay/pay?mode=1')
                    }
                })
            } else {
                wx.navigateTo({ url: '../index/authorization?userInfo=true' })
            }
        }
    },
    ajax: winAjax
})



