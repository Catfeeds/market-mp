const icons = require('../../icons')
const config = require('../../config')

var app = getApp()
var _this = null

var winAjax = {
    cartData: function () {
        var cart = app.Cart.getCart(), data = {};
        for (var key in cart) {
            if (key == 'cartTotal') continue;
            data[key] = cart[key];
        }

        _this.setData({
            cartData: data,
            // cartTotal: cart.cartTotal
        })
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
        cartData: [],
        cartTotal: {
            totalNum: 0,
            totalMoney: 0.0
        },
        checkTotal: {
            totalNum: 0,
            totalMoney: 0.0
        },
        status: { checkAll: false },
        icons: icons()
    },
    onLoad: function () {
        wx.setNavigationBarTitle({ title: '购物车' })
        // 初始化信息
        _this = this

        // 加载购物车数据
        this.ajax.cartData();
        getApp().statistical.notifyClickShoppingCart(); // 统计

        // 加载选中商品total
        _this.data.status.checkAll = app.Cart.getCartIsCheckAll()
        _this.setData({
            userInfo: app.data.userInfo,
            checkTotal: app.Cart.getCheckTotal(),
            status: _this.data.status
        });
    },
    onReload: function (option) {
        // 加载购物车数据
        this.ajax.cartData();
        // 加载选中商品total
        _this.data.status.checkAll = app.Cart.getCartIsCheckAll()
        _this.setData({
            checkTotal: app.Cart.getCheckTotal(),
            status: _this.data.status
        });
    },
    onUnload: function () {
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; //上1个页面
        prevPage.onReload()
    },
    onCartCheckAll: function (e) {
        _this.setData(app.Cart.CHECKALL(this.data, e.target.dataset.check));
    },
    onCart: function (e) {
        var data = {};
        data.status = this.data.status;
        data.cartData = this.data.cartData;
        data.cartTotal = this.data.cartTotal;
        data.checkTotal = this.data.checkTotal;
        _this.setData(app.Cart[e.target.dataset.type](data, e.target.dataset.id));
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
                success: function (res) {
                    if (res.confirm) {
                        wx.navigateBack()
                    } else if (!res.cancel) {
                        wx.navigateBack()
                    }
                }
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