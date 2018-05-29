const config = require('../../config')
const icons = require('../../icons')

var app = getApp()
var market = null
var user = null
var location = null
var _this = null
var _scrollLoad = true
var socketOpen = false
var socketMsgQueue = []

var winAjax = {
    marketData: function () {
        var option = config.showMarkets;
        option.data.longitude = _this.data.location.lot
        option.data.latitude = _this.data.location.lat

        option.success = function (data) {
            var marketData = {}, marketSort = []
            data = data.data.response ? data.data.response.datas : {};
            for (var i in data) {
                if (market != null && market.id == data[i].id) {
                    _this.setData({ currMarket: data[i] })
                    app.Market.set(data[i]);
                } else {
                    if (i == 0) data[i].show = true
                    marketSort.push(data[i].id)
                    marketData[data[i].id] = data[i];
                }
            }
            _this.setData({
                marketSort: marketSort,
                marketData: marketData,
                currMarket: market
            });
        };
        app.ajax(_this, option);
    },
    waitForReceiveCoupons: function () {
        var option = config.waitForReceiveCoupons;
        option.success = function (data) {
            if (data.data.code == 100) {
                _this.setData({
                    couponsData: false,
                    showModalStatus: false
                });
            } else {
                data = data.data.response ? data.data.response.datas : {};
                if (data.length == 0) {
                    _this.setData({
                        couponsData: false,
                        showModalStatus: false
                    });
                } else {
                    _this.setData({
                        couponsData: data,
                        showModalStatus: true
                    });
                }
            }

        }
        app.ajax(_this, option)
    },
    receiveCoupons: function (couponTemplateId) {
        var option = config.receiveCoupons
        option.data.couponTemplateId = couponTemplateId
        option.success = function (data) {
            wx.showToast({
                title: '领取成功',
                icon: 'success',
                duration: 2000
            })
            _this.ajax.waitForReceiveCoupons()
        }
        app.ajax(_this, option)
    },
    itemTypes: function () {
        var option = config.itemTypes;
        option.data.marketId = _this.data.currMarket.id
        console.log("====> currMarket id: " + _this.data.currMarket.id)
        option.success = function (data) {
            console.log("====> " + option.url, data)
            _this.setData({
                typeList: data.data.response ? data.data.response.datas : {}
            })
        };
        app.ajax(_this, option);
    },
    goodData: function () {
        var option = config.pageItems;
        var goodData = _scrollLoad ? {} : _this.data.goodData, cart = app.Cart.getCart();
        if (!_this.data.currMarket.id || _this.data.currMarket.id == null) {
            _this.data.status.canvasShow = true;
            _this.data.temps.temp_canvas = "temp_offcanvas_market";
            _this.setData({
                status: _this.data.status,
                temps: _this.data.temps
            })
            return false;
        }

        option.data.marketId = _this.data.currMarket.id
        option.data.itemTypeId = _this.data.status.typeSubShow == 0 ? _this.data.status.typeShow : _this.data.status.typeSubShow
        option.success = function (data) {
            var goodSort = []
            // 没有更多数据
            if (data.data.code == 100) {
                if (config.pageItems.data.pageIndex == 1) {
                    _this.setData({ isGoodData: true, goodData: {}, goodSort: [] })
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

            if (config.pageItems.data.pageIndex != 1 && !_scrollLoad) {
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
    orderData: function () {
        var option = config.showOrders;
        option.data.statusEnter = 15;  // 首页专用类型
        option.data.pageIndex = 1;
        option.data.pageSize = 2;
        option.data.marketId = _this.data.currMarket.id

        option.success = function (data) {
            if (data.data.code == 100) {
                _this.data.status.isHotShow = false
                _this.setData({
                    status: _this.data.status,
                });
                return
            }

            data = data.data.response.datas ? data.data.response.datas : {};
            for (var i in data) {
                data[i].itemsSize = data[i].items.length;
            }

            // close 控制
            if (data[0]) {
                var cacheClose = wx.getStorageSync('CACHE_CLOSE'), thisClose = data[0].paymentTime
                if (cacheClose != thisClose) {
                    _this.data.status.isHotShow = true
                }
            }
            _this.setData({
                status: _this.data.status,
                orderData: data,
                orderDataSize: data.length
            });
        };
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
                console.log(Cart)
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
        location: { hasLocation: false },
        locationMsg: '暂时无法获取位置',
        userInfo: {},
        marketSort: [],
        marketData: [],
        currMarket: false,
        couponsData: false,
        showModalStatus: false,
        typeList: [],
        goodSort: [],
        goodData: {},
        orderData: [],
        cartData: {},
        isGoodData: false,
        socketCount: false,
        checkTotal: {
            speciesNum: 0,
            totalNum: 0,
            totalMoney: 0.00,
            thriftMoney: 0.00
        },
        status: {
            cartShow: false,
            typeShow: 0,
            typeSubShow: 0,
            checkAll: false,
            canvasShow: false,
            isHotShow: false
        },
        temps: {
            temp_main: "temp_hot",
            temp_canvas: ""
        },
        scrollTop: 0,
        auth: false,
        icons: icons()
    },
    onLoad: function () {
        // 初始化信息
        _this = this
        _this.setData({ auth: false }) // 预防退出立刻进入 赋值
        app.getUserInfo(function (data) {
            _this.data.userInfo = data
            market = app.Market.get();

            console.log('====> userInfo', _this.data.userInfo)
            // 获取位置
            _this.getLocation(function (location) {
                console.log("====> market : ", market);
                console.log("====> currentLocation : ", location);
                if (market) {
                    getApp().statistical.notifyAccessMarket(market.id, location.lot, location.lat);
                }
            })

            // 检测店铺
            if (!market.id) {
                _this.ajax.marketData();
                _this.data.temps.temp_canvas = 'temp_offcanvas_market';
                _this.data.status.canvasShow = true;
            } else {
                _this.data.currMarket = market;
            }
            console.log(_this.data)
            _this.setData(_this.data);

            //加载可领取优惠券
            _this.ajax.waitForReceiveCoupons();

            // 加载分类
            _this.ajax.itemTypes();

            // 加载 热卖
            _this.getHot();

            // 检查购物车
            _this.ajax.filterValidItems();

            //websocket
            if (!socketOpen) {
                wx.connectSocket({
                    url: config.host.socketUrl
                });
                wx.onSocketError(function (res) {
                    console.log('====> error socket ：', res.data)
                    socketOpen = false
                    wx.connectSocket({
                        url: config.host.socketUrl
                    });
                });
                wx.onSocketOpen(function (res) {
                    console.log('====> success socket', res.data)
                    socketOpen = true
                    sendSocketMessage(_this.data.userInfo.passportId)
                });
                function sendSocketMessage(msg) {
                    if (socketOpen) {
                        wx.sendSocketMessage({
                            data: JSON.stringify(msg)
                        })
                    } else {
                        socketMsgQueue.push(msg)
                    }
                };
                wx.onSocketMessage(function (res) {
                    var str = res.data;
                    var obj = JSON.parse(str);
                    console.log('====> receive server msg ：', obj.response.datas)
                    var arr = obj.response.datas;
                    var val = 1;
                    var num = getArrSameCount(val, arr);
                    console.log('====> msgCount：', num)
                    _this.setData({
                        socketCount: num
                    })
                });
                function getArrSameCount(val, arr) {
                    var count = 0;
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i].type == val) count++;
                    }
                    return count;
                }
                wx.onSocketClose(function (res) {
                    console.log('WebSocket closed！')
                    socketOpen = false
                    wx.connectSocket({
                        url: config.host.socketUrl
                    });
                })
            }
        })
    },
    onReload: function (option) {
        if (option != null && !option.userLocation && _this.data.auth) {
            wx.navigateBack()
        }

        _this.data.status = {
            cartShow: false,
            typeShow: 0,
            typeSubShow: 0,
            checkAll: app.Cart.getCartIsCheckAll(),
            canvasShow: false,
            isHotShow: false
        }
        _this.data.temps.temp_main = 'temp_hot'

        _this.data.cartData = app.Cart.getCart()
        _this.data.checkTotal = app.Cart.getCheckTotal()
        _this.setData(_this.data);

        // 加载店铺信息
        this.setData({
            userInfo: getApp().data.userInfo,
            location: getApp().data.location
        });

        // 加载分类
        _this.ajax.itemTypes()

        // 加载 热卖
        _this.getHot()
    },
    onGoCart: function () {
        wx.navigateTo({ url: '../cart/cart' })
    },
    onShow: function () {
        console.log("首页onShow")
        this.setData({
            checkTotal: app.Cart.getCheckTotal()
        })
        // 加载 热卖
        _this.getHot()
        // 加载分类
        _this.ajax.itemTypes()
        // 检查购物车
        _this.ajax.filterValidItems()
    },
    onScrollHotTop: function (e) {
        wx.showNavigationBarLoading() //在标题栏中显示加载
        wx.setNavigationBarTitle({ title: '刷新中...' })
        config.pageItems.data.pageIndex = 1
        this.ajax.orderData();
        this.ajax.goodData();
        setTimeout(function () {
            wx.hideNavigationBarLoading() //完成停止加载
            wx.setNavigationBarTitle({ title: '小惠便利仓' })
            wx.stopPullDownRefresh() //停止下拉刷新
        }, 2000);
    },
    onScrollBottom: function (e) {
        if (!_scrollLoad) return
        _scrollLoad = false
        config.pageItems.data.pageIndex += 1
        this.ajax.goodData();
    },
    getHot: function () {
        // 记载 待取货订单
        this.ajax.orderData()
        // 热销
        config.pageItems.data.sortType = 2 // 销量排序
        config.pageItems.data.sortValue = 1 // 降序
        config.pageItems.data.pageIndex = 1
        this.ajax.goodData();
    },
    getLocation: function (cb) {
        // wx.showLoading({
        //   title: '定位中'
        // })
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                location = {
                    hasLocation: true,
                    lot: res.longitude,
                    lat: res.latitude
                };
                wx.request({  //百度地图经纬度反查路径   ak=btsVVWf0TM1zUBEbzFz6QqWF
                    url: 'https://api.map.baidu.com/geocoder/v2/?ak=926joUfDFejSEZYXlH1atEFiGSaGiDkm&location=' + res.latitude + ',' + res.longitude + '&output=json&pois=0',
                    success: function (ops) {
                        location.country = ops.data.result.addressComponent.country
                        location.formatted_address = ops.data.result.formatted_address
                        app.data.location = location
                        _this.setData({ location: location })
                        typeof cb == "function" && cb(location)
                        wx.hideLoading()
                        _this.ajax.marketData()
                    }
                })
                setTimeout(function () {
                    wx.hideLoading();
                }, 3000)
            },
            fail: function ({ errMsg }) {
                app.data.GPS = true
                // 产品需求 关闭 GPS 可继续访问  、 or 开启GPS未给定位权限 走授权页
                if (errMsg == 'getLocation:fail 1') {
                    console.error('请开启GPS定位功能')
                    _this.setData({
                        locationMsg: '请开启GPS定位功能、获取更好体验..'
                    })
                    _this.ajax.marketData();
                } else {
                    wx.navigateTo({ url: 'authorization' })
                }
            }
        })
    },
    onStatus: function (e) {

        wx.hideLoading()
        var data = {};
        this.data.status[e.target.dataset.statusKey] = e.target.dataset.statusVal ? e.target.dataset.statusVal : (this.data.status[e.target.dataset.statusKey] ? false : true);

        data.status = this.data.status;
        // 特殊 close 处理
        if (e.target.dataset.statusKey == 'isHotShow') {
            wx.setStorage({ key: 'CACHE_CLOSE', data: this.data.orderData[0].paymentTime })
            this.data.status.isHotShow = false
        }

        // 特殊 temp 处理
        if (e.target.dataset.tempKey && e.target.dataset.tempVal) {
            this.data.temps[e.target.dataset.tempKey] = e.target.dataset.tempVal;
            data.temps = this.data.temps;
        }

        // 特殊处理 分类
        if (e.target.dataset.statusKey == 'typeShow') {
            console.log("....", e.target.dataset.statusAct)
            this.data.status.typeSubShow = 0;
        }

        // 特殊处理 购物车 
        if (e.target.dataset.statusKey == 'cartShow' && this.data.status.cartShow) {
            data.cartData = app.Cart.getCart()  // 加载购物车数据
            data.checkTotal = app.Cart.getCheckTotal() // 加载购物车数据
            data.status.checkAll = app.Cart.getCartIsCheckAll() // 加载全选按钮
            getApp().statistical.notifyClickShoppingCart(); // 统计
        }

        // 特殊处理 选择店铺
        if (e.target.dataset.tempVal == 'temp_offcanvas_market') {
            // this.ajax.marketData(); // 加载店铺数据
            this.getLocation(); // 加载定位及店铺数据
        }

        // 特殊处理 选择分类 data-temp-val
        if (e.target.dataset.tempVal == 'temp_hot') {
            this.getHot()
        } else if (e.target.dataset.tempVal == 'temp_goods') {
            //处理 收缩
            if (e.target.dataset.statusAct) {
                this.data.status.typeShow = -1
            } else {
                _scrollLoad = true
                data.scrollTop = 0
                config.pageItems.data.sortType = 0
                config.pageItems.data.pageIndex = 1
                this.ajax.goodData();
            }
        } else if (e.target.dataset.tempVal == 'temp_offcanvas_coupon') {
            _this.ajax.waitForReceiveCoupons();//加载可领取优惠券
            var cd = this.data.couponsData;
            if (typeof cd == "undefined") {
                _this.setData({
                    showModalStatus: false
                })
            } else {
                _this.setData({
                    showModalStatus: true
                })
            }
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
    onMarket: function (e) {
        market = this.data.marketData[e.target.dataset.id];
        delete this.data.marketData[e.target.dataset.id];
        app.Market.set(market);

        //  统计
        getApp().statistical.notifyAccessMarket(market.id, _this.data.location.lot, _this.data.location.lat);

        this.data.status.canvasShow = false;
        this.setData({
            marketData: this.data.marketData,
            currMarket: market,
            status: this.data.status
        })
        this.onReload()
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
                console.log(app.Cart.getCart())
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
    onGo: function (e) {
        if (app.data.userInfo.hasBinding == 0) {
            wx.navigateTo({ url: '../my/bindPhone' })
        } else {
            app.onGo(e.target.dataset.url)
        }
    },
    onCall: function (e) {
        wx.makePhoneCall({
            phoneNumber: '4008090696' //客服电话
        })
    },
    setDefaultImg: function (e) {
        this.data.goodData[e.target.dataset.id].imageUrl = 'http://xmarket.oss-cn-shenzhen.aliyuncs.com/market/app/icon/defaultImg.png'
        this.setData({
            goodData: this.data.goodData
        })
    },
    onChoose: function (e) {
        if (app.data.userInfo.hasBinding == 0) {
            wx.navigateTo({ url: '../my/bindPhone' })
        } else {
            this.ajax.receiveCoupons(e.target.dataset.id)
        }
    },
    onLookRule: function (e) {
        console.log("====> couponsData: ", this.data.couponsData)
        var couponsData = this.data.couponsData
        for (var i in couponsData) {
            if (couponsData[i].couponTemplateId == e.target.dataset.id) {
                couponsData[i].show = !couponsData[i].show
                break;
            }
        }
        this.setData({ couponsData: couponsData });
    },
    closeCoupon: function () {
        _this.setData({
            showModalStatus: false
        })
    },
    onGoIndex: function () {
        wx.navigateTo({ url: 'index' })
    },
    ajax: winAjax
})



