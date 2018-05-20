const config = require('../../config')
const icons = require('../../icons')

var app = getApp();
var _this = null

var winAjax = {
    findMarket: function () {
        var option = config.findMarket;
        option.data.marketId = _this.data.market.id
        option.success = function (data) {
            // app.Market.set(data.data.response);
            console.log("====> findMarket: ", data.data.response)
            if (_this.data.status.tabActive == 2) {
                _this.data.checkTotal.totalMoneyAndCost = _this.getTotalMoneyAndCost();
                if (parseFloat(_this.data.checkTotal.totalMoney) * 100 < _this.data.market.limitDeliveryFee) {
                    if (!_this.data.isHide) {
                        // _this.setData({ status: { isPay: false } });
                        wx.showModal({
                            title: '提示',
                            showCancel: false,
                            content: '购满' + (_this.data.market.limitDeliveryFee / 100).toFixed(2) + '元才起送哦~',
                            success: function (res) {
                                if (res.confirm) {
                                    // wx.redirectTo({ url: '../index/index' })
                                    wx.reLaunch({ url: '../index/home' })
                                } else if (!res.cancel) {
                                    wx.reLaunch({ url: '../index/home' })
                                }
                            }
                        })
                    } else {
                        _this.setData({ status: { isPay: false } });
                        wx.showModal({
                            title: '提示',
                            showCancel: false,
                            content: '购满' + (_this.data.market.limitDeliveryFee / 100).toFixed(2) + '元才起送哦~',
                            success: function (res) {
                                if (res.confirm) {
                                    _this.setData({ status: { tabActive: 1, isPay: true } });
                                } else if (!res.cancel) {
                                    _this.setData({ status: { tabActive: 1, isPay: true } });
                                }
                            }
                        })
                    }
                } else {
                    _this.getDefaultAddress()
                }
            }

            _this.setData({
                checkTotal: _this.data.checkTotal,
                market: data.data.response
            });
        }
        app.ajax(_this, option);
    },
    getDefaultAddress: function () {
        var option = config.getDefaultAddress;
        option.data.marketId = _this.data.market.id
        option.success = function (data) {
            _this.setData({ address: data.data.response });

            //修改地址返回验证配送地址是否符合配送
            if (_this.data.status.tabActive == 2) {
                var EARTH_RADIUS = 6371.393;//地球半径（单位：km || 公里)
                var lat1 = _this.data.market.latitude;//第一个位置纬度
                var lng1 = _this.data.market.longitude;//第一个位置经度
                var lat2 = _this.data.address.latitude;//第二个位置纬度
                var lng2 = _this.data.address.longitude;//第二个位置经度
                var radLat1 = lat1 * Math.PI / 180.0;
                var radLat2 = lat2 * Math.PI / 180.0;
                var a = radLat1 - radLat2;//两地纬度差
                var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;//两地经度差
                var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));//距离公式
                s = s * EARTH_RADIUS;
                s = Math.round(s * 1000);
                if (s > _this.data.market.coveringDistance) {//超出配送范围
                    if (!_this.data.isHide) {//仅配送
                        _this.setData({ status: { isPay: false } });
                        wx.showModal({
                            title: '提示',
                            showCancel: false,
                            confirmText: '换个地址',
                            content: '您的收货地址不在配送范围内!请重新换个地址~',
                            success: function (res) {
                                if (res.confirm) {
                                    wx.navigateTo({ url: '../address/address?type=choose' })
                                } else if (!res.cancel) {
                                    wx.navigateTo({ url: '../address/address?type=choose' })
                                }
                            }
                        })
                    } else {//自提或配送
                        _this.setData({ status: { isPay: false } })
                        wx.showModal({
                            title: '提示',
                            cancelText: '我要自提',
                            confirmText: '换个地址',
                            content: '您的收货地址不在配送范围内!您可以选择自提哦~',
                            success: function (res) {
                                if (res.confirm) {
                                    wx.navigateTo({ url: '../address/address?type=choose' })
                                } else if (!res.cancel) {
                                    _this.setData({ status: { tabActive: 1, isPay: true } })
                                } else if (res.cancel) {
                                    _this.setData({ status: { tabActive: 1, isPay: true } })
                                }
                            }
                        })
                    }
                } else {//在配送范围内
                    if (!_this.data.isHide) {//仅配送

                    } else {//自提或配送

                    }
                }
            }

        };
        app.ajax(_this, option);
    },
    cartData: function () {
        _this.setData(app.Cart.getCheckData());
    },
    prepareCreateOrder: function () {
        var option = config.prepareCreateOrder;
        option.success = function (data) {
            console.log("====> 预下单号：", data.data.response.sequenceNumber);
            _this.setData({ sequenceNumber: data.data.response.sequenceNumber });
        };
        app.ajax(_this, option);
    },
    modifyReceivingData: function () {
        if (_this.data.address.name == null || _this.data.address.name == "") {
            _this.data.status.isPay = true;
            _this.setData({ status: _this.data.status });
            wx.navigateTo({ url: '../address/address?type=choose' })
            return
        }

        var option = config.modifyReceivingData;
        option.data.orderSequenceNumber = _this.data.orderSequenceNumber
        option.data.currentLocation = _this.data.location.lat + "," + _this.data.location.lot
        option.data.receiptProvince = _this.data.address.province
        option.data.receiptCity = _this.data.address.city
        option.data.receiptDistrict = _this.data.address.district
        option.data.receiptAddress = _this.data.address.addressAlias + '  ' + _this.data.address.detailAddress
        option.data.receiptNickName = _this.data.address.name
        option.data.receiptPhone = _this.data.address.phoneNumber
        option.data.receiptLocation = _this.data.address.latitude + "," + _this.data.address.longitude;
        option.success = function (data) {
            winAjax.paymentOrder(this.data.orderSequenceNumber);
        }

        // 网络监听错误方法
        option.networkError = function () {
            _this.data.status.isPay = true;
            _this.setData({ status: _this.data.status });
        }
        app.ajax(_this, option);
    },
    generateOrder: function () {
        var option = config.generateOrder;
        if (_this.data.sequenceNumber != null) {
            option.data.sequenceNumber = _this.data.sequenceNumber;
        } else {
            wx.showToast({
                title: '正在创建订单..',
                icon: 'loading',
                duration: 2000
            })
            _this.data.status.isPay = true;
            _this.setData({ status: _this.data.status });
            return
        }
        // wx.showLoading({
        //   title: '加载中',
        // })
        option.data.marketId = _this.data.market.id;
        option.data.deliverType = _this.data.status.tabActive;
        option.data.currentLocation = _this.data.location.lat + "," + _this.data.location.lot;

        var itemSet = false, checkGood = app.Cart.getCheckData().cartData;

        for (var key in checkGood) {
            if (!itemSet) itemSet = {}
            if (itemSet[checkGood[key].itemId] == null) itemSet[checkGood[key].itemId] = {};
            itemSet[checkGood[key].itemId] = checkGood[key].num;
        }
        if (!itemSet) {
            wx.showModal({
                title: '提示',
                content: '请选择商品',
                showCancel: false,
                success: function (res) { }
            })
            _this.data.status.isPay = true;
            _this.setData({ status: _this.data.status });
            return
        }
        option.data.itemSet = itemSet;

        if (option.data.deliverType == 2) {
            if (_this.data.address.name == null || _this.data.address.name == "") {

                _this.data.status.isPay = true;
                _this.setData({ status: _this.data.status });
                wx.showModal({
                    title: '提示',
                    content: '前往选择地址?',
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateTo({ url: '../address/address?type=choose' })
                        }
                    }
                })
                return
            }

            // 配送
            option.data.receiptProvince = _this.data.address.province
            option.data.receiptCity = _this.data.address.city
            option.data.receiptDistrict = _this.data.address.district
            option.data.receiptAddress = _this.data.address.addressAlias + '  ' + _this.data.address.detailAddress
            option.data.receiptNickName = _this.data.address.name
            option.data.receiptPhone = _this.data.address.phoneNumber
            option.data.receiptLocation = _this.data.address.latitude + "," + _this.data.address.longitude;
        }

        console.log("====> generateOrder: ", option.data)
        option.success = function (data) {
            if (data.data.code == 0) {
                _this.setData({ orderSequenceNumber: data.data.response.orderSequenceNumber });
                //  清空购物车
                app.Cart.REMOVER_CHECK()
                winAjax.paymentOrder(data.data.response.orderSequenceNumber);
            } else if (data.data.code == 2004) {
                // 库存不够
                data = JSON.parse(data.data.msg);
                var msg = [], items = {}
                for (var i in data) {
                    msg.push(data[i].itemName + "   x" + data[i].currentStock);
                    items[data[i].itemId] = data[i]
                }
                wx.showModal({
                    title: '以下商品库存不足啦，先买其他商品或重新购买？',
                    content: msg.join(','),
                    cancelText: '重新购物',
                    confirmText: '先买其他',
                    success: function (res) {
                        if (res.confirm) {
                            console.log('用户点击先买其他')
                            var cart = app.Cart.getCheckData().cartData, totalNum = 0;

                            for (var i in items) {
                                if (items[i].currentStock == 0) {
                                    delete cart[i]
                                } else {
                                    cart[i].num = items[i].currentStock
                                }
                            }
                            //  如果 全部没货 直接清空购物车 回首页
                            for (var i in cart) {
                                totalNum = totalNum + cart.num
                            }
                            if (totalNum == 0) {
                                app.Cart.REMOVER(); // 删除购物车
                                wx.reLaunch({ 'url': '../index/index' });
                            } else {
                                app.Cart.saveCart(cart);
                                _this.ajax.generateOrder();
                            }
                        } else if (res.cancel) {
                            console.log('用户点击重新购物')
                            app.Cart.REMOVER(); // 删除购物车
                            wx.reLaunch({ 'url': '../index/index' });
                        }
                    }
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: data.data.msg,
                    success: function (res) {
                        app.Cart.REMOVER(); // 删除购物车
                        wx.reLaunch({ 'url': '../index/index' });
                    }
                })
            }
        };

        // 网络监听错误方法
        option.networkError = function () {
            _this.data.status.isPay = true;
            _this.setData({ status: _this.data.status });
        }
        app.ajax(_this, option);
    },
    paymentOrder: function (orderSequenceNumber) {
        var option = config.paymentOrder;

        if (_this.data.coupon.id) {
            option.data.couponId = _this.data.coupon.id
        }
        option.data.orderSequenceNumber = orderSequenceNumber
        option.data.partnerUserId = _this.data.userInfo.openId
        option.data.deliverType = _this.data.status.tabActive
        option.data.paymentType = 'WEIXIN_APPLET'; // BALANCE
        option.success = function (data) {
            if (data.data.code == 0) {
                winAjax[option.data.paymentType](data.data.response);
                wx.hideLoading();
            }
        };

        // 网络监听错误方法
        option.networkError = function () {
            _this.data.status.isPay = true;
            _this.setData({ status: _this.data.status });
        }
        app.ajax(_this, option);
    },
    // 余额支付
    BALANCE: function (successData) {
        var option = config.pay.BALANCE;
        option.data.paymentParameter = successData
        option.success = function (data) {
            if (data.data.code == 0) {
                wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.reLaunch({ 'url': '../index/index' });
                }, 1000)
            } else {
                wx.showToast({
                    title: data.data.msg,
                    icon: 'loading',
                    duration: 2000
                })
            }
        };
        app.ajax(_this, option);
    },
    // 微信支付
    WEIXIN_APPLET: function (successData) {
        wx.requestPayment({
            'timeStamp': successData.timeStamp,
            'nonceStr': successData.nonceStr,
            'package': successData.package,
            'signType': successData.signType,
            'paySign': successData.paySign,
            'success': function (res) {
                wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.reLaunch({ 'url': '../index/index' });
                }, 1000)
            },
            'fail': function (res) {
                _this.data.status.isPay = true;
                for (var key in _this.data.cartData) {
                    _this.data.cartData[key].isHide = true;
                    if (!_this.data.cartData[key].check) {
                        delete _this.data.cartData[key]
                    }
                }
                _this.setData({ cartData: _this.data.cartData, status: _this.data.status });
            },
            'complete': function (res) {
                console.error(res)
                if (res.errMsg = 'requestPayment:cancel') {
                    // 取消支付  跳转 订单待支付页面
                    wx.redirectTo({ url: '../order/order?tabActive=12' })
                    // _this.data.status.isPay = true;
                    // _this.setData({status : _this.data.status});
                }
            }
        })
    }
}



Page({
    data: {
        sequenceNumber: null,      //  预下单号
        orderSequenceNumber: null, //  订单号
        location: {},
        market: {},
        address: {},
        coupon: {},
        cartData: [],
        checkTotal: {
            totalNum: 0,
            totalMoney: 0.0,
            speciesNum: 0,
            thriftMoney: 0.0
        },
        status: { tabActive: 1, isPay: true },
        isHide: true,
        icons: icons()
    },
    onLoad: function (option) {
        console.log(option)
        wx.setNavigationBarTitle({ title: '支付' })
        // 初始化信息
        _this = this
        // 加载店铺信息
        this.setData({
            userInfo: getApp().data.userInfo,
            location: getApp().data.location,
            market: getApp().Market.get()
        });
        //预下单
        this.ajax.prepareCreateOrder()

        // 加载购物车数据
        this.ajax.cartData();

        // 默认地址
        // this.getDefaultAddress()

        if (option.mode == 1) {//配送
            this.setData({
                status: { tabActive: 2, isPay: true }
            });
            this.setData({
                isHide: false
            });
            // 加载门店信息
            this.ajax.findMarket()
        } else if (option.mode == 2) {//配送或自提
            this.setData({
                status: { tabActive: 1, isPay: true }
            });
        }
    },
    onReload: function () {
        // 加载店铺信息
        this.setData({
            userInfo: getApp().data.userInfo,
            location: getApp().data.location
        });
        this.setData({
            status: { tabActive: 2, isPay: true }
        });
        // 默认地址
        this.getDefaultAddress()
        // 加载门店信息
        this.ajax.findMarket()
        console.log(this.data.status)
    },
    onUnload: function () {
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; //上1个页面
        prevPage.onReload()
    },
    onCart: function (e) {
        var data = {};
        data.status = this.data.status;
        data.cartData = this.data.cartData;
        data.checkTotal = this.data.checkTotal;
        _this.setData(app.Cart[e.target.dataset.type](data, e.target.dataset.id));
    },
    onPay: function (e) {
        if (app.data.userInfo.hasBinding == 0) {
            wx.navigateTo({ url: '../my/bindPhone' })
        } else {
            if (e.target.dataset.ispay) {
                this.data.status.isPay = false;
                this.setData({ status: this.data.status });

                if (this.data.orderSequenceNumber) {
                    // 如果已经创建订单 直接支付 并且需要重新提交 提其方式 为配送 的订单信息
                    if (this.data.status.tabActive == 2) {
                        // 自提需要重置订单信息
                        this.ajax.modifyReceivingData()
                    } else {
                        this.ajax.paymentOrder(this.data.orderSequenceNumber);
                    }
                } else {
                    _this.ajax.generateOrder()
                }
            }
        }
    },
    onStatus: function (e) {
        var data = {};
        this.data.status[e.target.dataset.statusKey] = e.target.dataset.statusVal ? e.target.dataset.statusVal : (this.data.status[e.target.dataset.statusKey] ? false : true);
        data.status = this.data.status;
        this.setData(data);
        //   特殊处理 默认地址
        if (e.target.dataset.statusKey == 'tabActive' && e.target.dataset.statusVal == 2) {

            // 计算有运费的总金额
            this.data.checkTotal.totalMoneyAndCost = this.getTotalMoneyAndCost();
            this.setData({
                checkTotal: this.data.checkTotal
            })
            this.ajax.findMarket()
            console.log("====> couponData: ", this.data.coupon)
        }
    },
    getTotalMoneyAndCost: function () {
        // 商品金额 + 运费
        var totalMoneyAndCost = 0.0
        if (parseFloat(this.data.checkTotal.totalMoney) < (this.data.market.freeDeliveryFee / 100)) {
            totalMoneyAndCost = (parseFloat(this.data.checkTotal.totalMoney) + this.data.market.deliveryCost / 100).toFixed(2)
        } else {
            totalMoneyAndCost = this.data.checkTotal.totalMoney
        }
        return totalMoneyAndCost
    },
    getDefaultAddress: function () {
        this.ajax.getDefaultAddress()
    },
    onGo: function (e) {
        wx.navigateTo({ url: e.target.dataset.url })
    },
    onAlert: function () {
        wx.showModal({
            title: '提示',
            showCancel: false,
            content: '小批商品只能选择配送方式',
            success: function (res) {

            }
        })
    },
    ajax: winAjax
})