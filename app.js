console.log('====> app.js')
const config = require('./config');
const qrcode = require('./utils/qrcode');

var CACHE = {
    cart: "CACHE_BUYCAR",
    user: "CACHE_USER",
    market: "CACHE_MARKET",
    search: "CACHE_SEARCH",
    statistical: "CACHE_STATISTICAL"
}, _this = null

var proCheck = true, proCheckAll = true

//app.js 
App({
    data: {
        isConnected: true,
        accessToken: '',
        userInfo: { islogin: false, auth: false, passportId: false, status: 4 },
        systemInfo: {},
        location: {}
    },
    onNetworkError: false,
    getUserInfo: function (cb) {
        console.log('====> getUserInfo function');
        _this = this
        if (_this.data.userInfo.islogin && _this.data.userInfo.status != 4) {
            typeof cb == "function" && cb(_this.data.userInfo)
        } else if (_this.User.getUserInfo().islogin && _this.data.userInfo.status != 4) {
            _this.data.userInfo = _this.User.getUserInfo()
            typeof cb == "function" && cb(_this.data.userInfo)
        } else {
            // 微信登录
            wx.login({
                success: function (res) {
                    console.log(res)
                    if (res.code) {
                        var option = config.weixinAuthorization
                        option.data.code = res.code
                        option.success = function (data) {
                            console.log('====> ' + option.url, data)
                            if (data.data.code == 0) {
                                _this.data.userInfo = data = data.data.response;

                                // wx.authorize({
                                //     scope: 'scope.userInfo',
                                //     success: function (res) {

                                        // wx.getUserInfo({
                                        //     withCredentials: false,
                                        //     success: function (res) {
                                                _this.data.userInfo.auth = true // 授权
                                                _this.data.userInfo.islogin = true // 登录
                                                // _this.data.userInfo.headImageUrl = res.userInfo.avatarUrl
                                                // _this.data.userInfo.nickName = res.userInfo.nickName
                                                // _this.data.userInfo.sex = res.userInfo.gender == 1 ? 1 : 0; // 后台 0:女、1:男 //微信获取 性别 0：未知、1：男、2：女
                                                // if (data.status == 4) { //  完善用户资料
                                                //   console.log(_this.data.userInfo.passportId)
                                                //     var perfect = config.perfectWeixinInformation
                                                //     perfect.data.passportId = _this.data.userInfo.passportId
                                                //     perfect.data.headImageUrl = _this.data.userInfo.headImageUrl
                                                //     perfect.data.nickName = _this.data.userInfo.nickName
                                                //     perfect.data.openId = _this.data.userInfo.openId
                                                //     perfect.data.sex = _this.data.userInfo.sex
                                                //     perfect.success = function (data) {
                                                //         if (data.data.code != 0) {
                                                //             console.log('====> 完善用户资料失败 :' + data.msg);
                                                //         }
                                                //     }
                                                //     _this.ajax(_this, perfect)
                                                // }
                                                console.log(_this.data.userInfo)
                                                _this.User.saveUserInfo(_this.data.userInfo)
                                                typeof cb == "function" && cb(_this.data.userInfo)
                                        //     },
                                        //     fail: function (res) {
                                        //         console.error("未授权获取用户信息")

                                        //         typeof cb == "function" && cb(_this.data.userInfo)
                                        //     }
                                        // })

                                //     }
                                // })

                                

                            } else {
                                wx.showModal({
                                    title: '提示',
                                    showCancel: false,
                                    content: data.data.msg
                                })
                                console.log('====> weixinAuthorization: ' + data.data.msg)
                            }
                        }
                        _this.ajax(_this, option)
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: res.msg,
                            showCancel: false
                        })
                        console.log(res.msg)
                        wx.navigateBack();
                    }
                },
                fail: function (res) {
                    console.log(res)
                    wx.showModal({
                        title: '提示',
                        content: res.errMsg,
                        showCancel: false
                    })

                }
            })
        }
    },
    onLaunch: function () {
        _this = this

        if (!wx.openBluetoothAdapter) {
            // 如果希望用户在最新版本的客户端上体验您的小程序
            _this.data.isConnected = false
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
                success: function (res) {
                    wx.navigateBack()
                }
            })
        }

        //  获取手机配置信息
        wx.getSystemInfo({
            success: function (res) {
                _this.data.systemInfo = res;
            }
        })

        // 开启网络监听
        wx.onNetworkStatusChange(function (res) {

            console.log(res.isConnected)
            console.log(res.networkType)
            if (!res.isConnected) {
                _this.data.isConnected = false
                typeof _this.onNetworkError == "function" && _this.onNetworkError()
            } else {
                _this.data.isConnected = true
            }
        })

    },
    /** 全局跳转 **/
    onGo: function (url) {
      console.log(url)
        // 网络监听错误方法
        if (_this.data.isConnected) {
            wx.navigateTo({ url: url })
        } else {
            wx.showModal({
                title: '网络提示',
                content: '网络链接中断、请检查网络',
                showCancel: false
            })
        }
    },
    /** 全局请求 **/
    ajax: function (t, option) {
        console.log("====> Request Para: ", option.url, option.data)
        // wx.showLoading()
        if (option.data.passportId != null && _this.data.userInfo.passportId != null && _this.data.userInfo.passportId) {
            option.data.passportId = _this.data.userInfo.passportId
            option.data.accessToken = _this.data.accessToken
        }

        if (option.data.marketId) {
            option.data.marketId = parseInt(option.data.marketId) || 0
        }

        var url = "";
        url = config.hostOpenApi[option.host] + option.url
        // if(option.islogin){
        //   url = _this.data.userInfo.islogin ? config.host[option.host] : config.hostOpenApi[option.host];
        //   url += option.url
        // }else{
        //   url = config.host[option.host] + option.url;
        // }
        // console.log("请求的地址：" + url);

        // 检查网络
        if (!_this.data.isConnected) {
            wx.showModal({
                title: '网络提示',
                content: '网络链接中断、请检查网络',
                showCancel: false
            })
            if (option.networkError) option.networkError()
            return
        }
        wx.request({
            url: url,
            data: option.data,
            success: function (result) {
                if (result.data.accessToken != '') {
                    _this.data.accessToken = result.data.accessToken
                }

                // code 1000  /showMarkets.do :您所在区域暂时未找到合适的商店
                if (result.data.code == 0 ||
                    result.data.code == 100 ||    // 100 没有更多数据
                    result.data.code == 2004 ||   // 2004  购买的商品 库存不足
                    // result.data.code == 1 ||
                    result.data.code == 10004 ||  // 特殊地址标记 没有默认地址
                    result.data.code == 3005 ||   // 特殊扫码标记 已经扫码
                    result.data.code == 3006      // 特殊扫码标记 未扫码
                ) {
                    option.success(result);
                } else if (result.data.code == 500 || result.data.code == 10005) { // 绑定手机
                    wx.navigateTo({ url: '../my/bindPhone' })
                } else {
                    wx.showModal({
                        title: '提示',
                        content: result.data.msg,
                        showCancel: false,
                        success: function (res) { }
                    })
                    console.error("<code> " + result.data.code + ' <url> ' + option.url + ' <msg> ' + result.data.msg);
                }
                // wx.hideLoading()
            },
            fail: function ({ errMsg }) {
                console.error('request fail: ' + option.url, errMsg)
            }
        })
    },
    /* 搜索历史记录 */
    Search: {
        CACHE_OPTION: {
            validTime: 0,
            intervalTime: 30 * 60 * 1000,
            data: []
        },
        getInfo: function () {
            var search = wx.getStorageSync(CACHE.search);
            if (search && search.validTime > new Date().getTime()) {
                return wx.getStorageSync(CACHE.search).data
            } else {
                return this.CACHE_OPTION.data;
            }
        },
        saveSearchValue: function (value) {
            if (value == null || value == "") return
            var search = this.getInfo()
            if (search.indexOf(value) == -1) {
                search.splice(0, 0, value)
                this.saveInfo(search)
            }
        },
        saveInfo: function (data) {
            var search = this.CACHE_OPTION
            search.validTime = new Date().getTime() + search.intervalTime
            search.data = data.slice(0, 20)  // 最多保存 20个
            wx.setStorage({
                key: CACHE.search,
                data: search,
                success: function () {
                },
                fail: function () {
                    console.error('获取搜索缓存信息失败');
                }
            });
        },
        removeAll: function () {
            wx.setStorage({
                key: CACHE.search,
                data: this.CACHE_OPTION
            });
        }
    },
    /** 用户缓存 **/
    User: {
        CACHE_OPTION: {
            islogin: false,
            validTime: 0,
            intervalTime: 30 * 60 * 1000
        },
        getUserInfo: function () {
            var user = wx.getStorageSync(CACHE.user);
            if (user && user.validTime > new Date().getTime()) {
                return wx.getStorageSync(CACHE.user)
            } else {
                return this.CACHE_OPTION;
            }
        },
        saveUserInfo: function (data) {
            data.validTime = new Date().getTime() + this.CACHE_OPTION.intervalTime
            wx.setStorage({
                key: CACHE.user,
                data: data,
                success: function () {
                },
                fail: function () {
                    console.error('获取用户缓存信息失败');
                }
            });
        }
    },
    /** 店铺 **/
    Market: {
        CACHE_OPTION: { id: false },
        getMarket: function () {
            var market = wx.getStorageSync(CACHE.market).market || false;
            if (!market) {
                // wx.showToast({
                //   title: '请选择店铺',
                //   icon: 'success',
                //   duration: 2000
                // })
                return false;
            }
            return market;
        },
        get: function () {
            return wx.getStorageSync(CACHE.market) || this.CACHE_OPTION;
        },
        set: function (data) {
            wx.setStorage({
                key: CACHE.market,
                data: data,
                success: function () {
                },
                fail: function () {
                    console.error('获取店铺缓存信息失败');
                }
            });
        },
        islogin: false
    },
    /** 购物车事件 **/
    Cart: {
        CACHE_NAME: "CACHE_CART",
        CACHE_OPTION: {
            "CarUpTime": 0,         // 上次修改时间:记录上次更新的时间
            "CarUpLoadTime": 0,     // 更新时间:点击事件的时的时间 
            "CarSuccessTime": 0,    // 完成时间:请求服务器完成的时间
            "Market": {
            }
        },
        CACHE_OPTION_MARKET: {
            checkTotal: {
                totalNum: 0,
                totalMoney: 0.0,
                speciesNum: 0,
                thriftMoney: 0.0,
                marketMoney: 0.0
            }
        },
        ADD_All: function (datas) {
            var Cart = this.getCart();
            // 之前选择置为不选中状态
            for (var i in Cart) {
                Cart[i].check = false
            }

            //
            for (var i in datas) {
                if (Cart[datas[i].itemId]) {
                    Cart[datas[i].itemId].check = true;
                } else {
                    datas[i].check = true;
                    Cart[datas[i].itemId] = datas[i]
                }
            }

            this.saveCart(Cart, null);
        },
        ADD: function (data, id) {
            var Cart = this.getCart(), item = data.goodData || data.cartData;
            if (!Cart) return false;
            var unitMoney = 0.0;
            var that = this;
            item = item[id] || data.cartData[id];
            item.check = true;
            //   item.num += 1;
            if (item.num > item.stock) {
                item.num == item.stock;
                return item.num
            }

            if (item.beyondControl == 0 && item.restrictionQuantity > 0) {
                if (item.hasBuy < item.restrictionQuantity) {
                    item.num += 1;
                    var s = item.restrictionQuantity - item.hasBuy
                    if (item.num <= s) {
                        this.saveCart(Cart, item);
                    } else {
                        item.num = s;
                        // item.stock = s;//不可添加商品
                        wx.showModal({
                            title: '提示',
                            showCancel: false,
                            content: '主人，您购买' + item.restrictionQuantity + '件该商品的特权已用完，欢迎明天再来~~',
                            success: function (res) {
                                item.num = s;
                                that.saveCart(Cart, item);

                            }
                        })
                    }

                } else if (item.hasBuy = item.restrictionQuantity) {
                    wx.showModal({
                        title: '提示',
                        showCancel: false,
                        content: '主人，您购买' + item.restrictionQuantity + '件该商品的特权已用完，欢迎明天再来~~',
                        success: function (res) {

                        }
                    })
                }
                else {
                    wx.showModal({
                        title: '提示',
                        showCancel: false,
                        content: '主人，您购买' + item.restrictionQuantity + '件该商品的特权已用完，欢迎明天再来~~',
                        success: function (res) {

                        }
                    })
                }

            } else {
                item.num += 1;
                this.saveCart(Cart, item);
            }

            if (data.goodData && data.goodData[id]) data.goodData[id] = item;
            if (data.cartData) data.cartData[id] = item;
            if (data.checkTotal) {
                data.checkTotal = this.getCheckTotal(Cart);
            }

            // 统计
            _this.statistical.notifyJoinShoppingCart()
            return data;
        },
        MINUS: function (data, id) {
            var item = data.goodData || data.cartData;
            item = item[id] || data.cartData[id];

            if (item.num == 0) return data;

            var Cart = this.getCart();
            if (!Cart) return false;

            item.num -= 1;

            if (item.num == 0) {
                //  清除购物车数据
                if (data.cartData && data.cartData[id]) {
                    delete data.cartData[id];
                }
                data.checkTotal.speciesNum -= 1;
            } else {
                if (data.cartData) data.cartData[id] = item;
            }
            if (data.goodData && data.goodData[id]) data.goodData[id] = item;


            this.saveCart(Cart, item);

            if (data.checkTotal) {
                data.checkTotal = this.getCheckTotal(Cart);
            }

            return data;
        },
        CHECK: function (data, id) {
            if (!proCheck) return data
            try {
                proCheck = false
                var Cart = this.getCart();
                if (!Cart) return false;

                data.cartData[id].check = !data.cartData[id].check;
                Cart[id].check = data.cartData[id].check;

                this.saveCart(Cart, data.cartData[id]);
                data.checkTotal = this.getCheckTotal(Cart);

                // 设置全选状态
                var checkAll = true
                for (var key in data.cartData) {
                    if (!Cart[key].check) {
                        checkAll = false
                        continue
                    }
                }
                data.status.checkAll = checkAll
                proCheck = true
                return data;
            } catch (e) {
                console.error('cart function CHECK error');
            }
        },
        CHECKALL: function (data, check) {
            if (!proCheckAll) {
                return {
                    cartData: data.cartData,
                    checkTotal: data.checkTotal,
                    status: data.status
                }
            }

            var Cart = this.getCart(), cartData = {};
            if (!Cart) return false;
            data.status.checkAll = !check;
            for (var key in Cart) {
                Cart[key].check = !check;
                cartData[key] = Cart[key];
            }

            this.saveCart(Cart, null);
            proCheckAll = true
            return {
                cartData: cartData,
                checkTotal: this.getCheckTotal(Cart),
                status: data.status
            };
        },
        REMOVER: function (data) {
            this.saveCart({}, null);

            if (!data) {
                return {}
            }
            data.status.checkAll = false;
            for (var key in data.cartData) {
                data.cartData[key].num = 0;
            }
            if (data.goodData) {
                for (var key in data.goodData) {
                    data.goodData[key].num = 0;
                }
            }
            return {
                goodData: data.goodData || {},
                cartData: {},
                checkTotal: this.CACHE_OPTION_MARKET.checkTotal,
                status: data.status
            };
        },
        REMOVER_CHECK: function () {
            var Cart = this.getCart(), cartData = {};
            if (!Cart) return false;

            for (var key in Cart) {
                if (Cart[key].check) delete Cart[key]
            }
            this.saveCart(Cart, null);
        },
        getCheckTotal: function (cart) {
            var Cart = cart || this.getCart(), checkTotal = { speciesNum: 0, totalNum: 0, totalMoney: 0.0, thriftMoney: 0.0, marketMoney: 0.0 };
            if (!Cart) return false;
            var totalMoney = 0.0;//所有商品总价

            for (var key in Cart) {
                if (Cart[key].check) {

                    checkTotal.speciesNum += 1;
                    checkTotal.totalNum += Cart[key].num;

                    if (Cart[key].discountType == 1) { //走折扣
                        totalMoney = Cart[key].num * Cart[key].sellPrice;

                        //   if (Cart[key].beyondControl == 0) {//0不可超出折扣数
                        //       if (Cart[key].num <= Cart[key].restrictionQuantity) {//如果购物车数量比折扣数量少，全部商品按折扣价
                        //           singlePrice =  Cart[key].num * Cart[key].discountPrice;
                        //       }
                        //   }
                        //   if (Cart[key].num <= Cart[key].restrictionQuantity) {//如果购物车数量比折扣数量少，全部商品按折扣价
                        //       discountSinglePrice = Cart[key].num * Cart[key].discountPrice;//商品折扣价
                        //   } else {//如果购物车数量比折扣数量多，限购数量按折扣价，剩下商品按销售价
                        //       discountSinglePrice = Cart[key].discountPrice * Cart[key].restrictionQuantity;//商品折扣价
                        //       var noDiscountNum = Cart[key].num - Cart[key].restrictionQuantity;//不参与折扣商品数量
                        //     //   nodiscountSinglePrice = getaDouble(nodiscountSinglePrice, goodsItemInfo, noDiscountNum);//不参与折扣的去判断是否参与满减
                        //       if (Cart[key].itemLadderPrices != '' && Cart[key].itemLadderPrices.length > 0) {
                        //           for (var i in Cart[key].itemLadderPrices) {
                        //             if (noDiscountNum >= Cart[key].itemLadderPrices[i].minQuantity) {//大于满减最小数量
                        //                 if (noDiscountNum <= Cart[key].itemLadderPrices[i].maxQuantity) {//小于满减最大限购数
                        //                     var exprectPrice = Cart[key].itemLadderPrices[i].expectPrice * noDiscountNum;//商品满减价格总价
                        //                         nodiscountSinglePrice = Cart[key].sellPrice * noDiscountNum;//商品销售价格总价
                        //                     if (exprectPrice <= nodiscountSinglePrice) {//如果满减价格小于销售价格，使用满减价格，否则使用销售价格
                        //                         nodiscountSinglePrice = Cart[key].itemLadderPrices[i].expectPrice * noDiscountNum;
                        //                     } else {
                        //                         nodiscountSinglePrice = Cart[key].sellPrice * noDiscountNum;
                        //                     }
                        //                 } else {//大于满减最大限购数
                        //                     var fullReductionNum = noDiscountNum - Cart[key].itemLadderPrices[i].maxQuantity;//参与满减价格之后剩余的商品数量
                        //                     var d1ExpectPrice = Cart[key].itemLadderPrices[i].expectPrice * Cart[key].itemLadderPrices[i].maxQuantity;//商品满减价格总价
                        //                     nodiscountSinglePrice = Cart[key].sellPrice * Cart[key].itemLadderPrices[i].maxQuantity;//商品销售价格总价
                        //                     if (d1ExpectPrice <= nodiscountSinglePrice) {//如果满减价格小于销售价格，使用满减价格，否则使用销售价格
                        //                         nodiscountSinglePrice = Cart[key].itemLadderPrices[i].expectPrice * Cart[key].itemLadderPrices[i].maxQuantity;
                        //                     }
                        //                     var d2 = Cart[key].sellPrice * fullReductionNum;//参与满减价格之后剩余的商品数量的价格
                        //                     nodiscountSinglePrice = nodiscountSinglePrice + d2;//总价 = 参与满减价格+参与满减价格之后剩余的商品数量的价格
                        //                 }
                        //             } else {
                        //                 nodiscountSinglePrice = Cart[key].sellPrice * noDiscountNum;//不参与折扣部分总价
                        //             }
                        //           }
                        //       }
                        //   }
                        //   singlePrice = discountSinglePrice + nodiscountSinglePrice;//总价 = 折扣价+不参与的折扣价

                    } else {//不走折扣

                        // 现售价格
                        totalMoney = Cart[key].num * Cart[key].sellPrice;

                        //   var noDiscountNum = Cart[key].num - Cart[key].restrictionQuantity;//不参与折扣商品数量
                        //   singlePrice = Cart[key].num * Cart[key].sellPrice;//商品销售价格
                        // //   singlePrice = getaDouble(singlePrice, goodsItemInfo, goodsSelectedNum);//如果购物车商品数量大于满减数量，走满减逻辑
                        //   if (Cart[key].itemLadderPrices !='' && Cart[key].itemLadderPrices.length > 0) {
                        //       for (var i in Cart[key].itemLadderPrices) {
                        //         if (noDiscountNum >= Cart[key].itemLadderPrices[i].minQuantity) {//大于满减最小数量
                        //             if (noDiscountNum <= Cart[key].itemLadderPrices[i].maxQuantity) {//小于满减最大限购数
                        //                 var exprectPrice = Cart[key].itemLadderPrices[i].expectPrice * noDiscountNum;//商品满减价格总价
                        //                 singlePrice = Cart[key].sellPrice * noDiscountNum;//商品销售价格总价
                        //                 if (exprectPrice <= singlePrice) {//如果满减价格小于销售价格，使用满减价格，否则使用销售价格
                        //                     singlePrice = Cart[key].itemLadderPrices[i].expectPrice * noDiscountNum;
                        //                 } else {
                        //                     singlePrice = Cart[key].sellPrice * noDiscountNum;
                        //                 }
                        //             } else {//大于满减最大限购数
                        //                 var fullReductionNum = noDiscountNum - Cart[key].itemLadderPrices[i].maxQuantity;//参与满减价格之后剩余的商品数量
                        //                 var d1ExpectPrice = Cart[key].itemLadderPrices[i].expectPrice * Cart[key].itemLadderPrices[i].maxQuantity;//商品满减价格总价
                        //                 singlePrice = Cart[key].sellPrice * Cart[key].itemLadderPrices[i].maxQuantity;//商品销售价格总价
                        //                 if (d1ExpectPrice <= singlePrice) {//如果满减价格小于销售价格，使用满减价格，否则使用销售价格
                        //                     singlePrice = Cart[key].itemLadderPrices[i].expectPrice * Cart[key].itemLadderPrices[i].maxQuantity;
                        //                 }
                        //                 var d2 = Cart[key].sellPrice * fullReductionNum;//参与满减价格之后剩余的商品数量的价格
                        //                 singlePrice = singlePrice + d2;//总价 = 参与满减价格+参与满减价格之后剩余的商品数量的价格
                        //             }
                        //         } else {
                        //             singlePrice = Cart[key].sellPrice * noDiscountNum;//不参与折扣部分总价
                        //         }
                        //     }
                        //   }

                    }

                    // 计算优惠价格
                    if (Cart[key].itemLadderPrices.length > 0) {
                        for (var i in Cart[key].itemLadderPrices) {
                            if (Cart[key].num >= Cart[key].itemLadderPrices[i].minQuantity) {
                                // 活动价格 比 之前的价格便宜 才使用活动价格
                                if (Cart[key].num * Cart[key].itemLadderPrices[i].expectPrice <= totalMoney) {
                                    totalMoney = Cart[key].num * Cart[key].itemLadderPrices[i].expectPrice
                                }
                                break
                            }
                        }
                    }
                    // 市场价格
                    checkTotal.marketMoney += Cart[key].maxPrice * Cart[key].num
                    // 节约价格
                    checkTotal.thriftMoney += (Cart[key].maxPrice * Cart[key].num) - totalMoney
                    //整个购物车商品总价
                    checkTotal.totalMoney += totalMoney

                    //   // 市场价格
                    //   checkTotal.marketMoney = Cart[key].maxPrice * Cart[key].num;
                    //   // 节约价格
                    //   checkTotal.thriftMoney = checkTotal.thriftMoney + (checkTotal.marketMoney - singlePrice);
                    //   //整个购物车商品总价
                    //   checkTotal.totalMoney = checkTotal.totalMoney + singlePrice;
                }
            }
            checkTotal.discountPrice = checkTotal.discountPrice || 0;
            checkTotal.sellPrice = checkTotal.sellPrice || 0;
            checkTotal.thriftMoney = checkTotal.thriftMoney || 0;
            checkTotal.marketMoney = checkTotal.marketMoney || 0;
            checkTotal.totalMoney = checkTotal.totalMoney || 0;

            checkTotal.discountPrice = (checkTotal.discountPrice / 100).toFixed(2)
            checkTotal.sellPrice = (checkTotal.sellPrice / 100).toFixed(2)
            checkTotal.thriftMoney = (checkTotal.thriftMoney / 100).toFixed(2)
            checkTotal.marketMoney = (checkTotal.marketMoney / 100).toFixed(2)
            checkTotal.totalMoney = (checkTotal.totalMoney / 100).toFixed(2)

            console.log("====> cart checkTotal: ", checkTotal)

            return checkTotal;
        },
        getCheckData: function (cart) {
            var Cart = cart || this.getCart(), checkTotal = this.CACHE_OPTION_MARKET.checkTotal, data = {};
            if (!Cart) return false;

            for (var key in Cart) {
                if (Cart[key].check) {
                    data[key] = Cart[key];
                }
            }

            return {
                goodData: data,
                cartData: data,
                checkTotal: this.getCheckTotal(Cart)
            };
        },
        getCartIsCheckAll: function () {
            var cart = this.getCart(), ischeckAll = true
            for (var id in cart) {
                if (!cart[id].check) {
                    ischeckAll = false
                    break
                }
            }
            return ischeckAll
        },
        getCart: function () {
            var MarketId = _this.Market.get().id;
            if (!MarketId) return {};

            try {
                return wx.getStorageSync(CACHE.cart) == "" ? {} : wx.getStorageSync(CACHE.cart).Market[MarketId] || {};
            } catch (e) {
                return {};
            }
        },
        saveCart: function (carts, data) {
            console.log("====> cartData: ", carts)
            var cart = this.CACHE_OPTION;
            var MarketId = _this.Market.get().id;

            if (data != null) {
                if (data.num == 0) {
                    delete carts[data.itemId];
                } else {
                    carts[data.itemId] = data;
                }
            }

            cart.CarUpLoadTime = new Date().getTime();
            cart.Market[MarketId] = carts;
            try {
                wx.setStorageSync(CACHE.cart, cart)
            } catch (e) {
                console.error('cache  cart save error');
            }
        }
    },
    statistical: {
        setStorage: function (data) {
            wx.setStorage({
                key: CACHE.statistical,
                data: data,
                success: function () {
                },
                fail: function () {
                    console.error('获取统计缓存信息失败');
                }
            });
        },
        getStorage: function () {
            return wx.getStorageSync(CACHE.statistical) || {
                "notifyJoinShoppingCart": { nextTime: 0 },
                "notifyClickShoppingCart": { nextTime: 0 }
            }
        },

        // 统计 - 将商品加入购物车时使用(返回成功后 当天就不需要再通知)
        notifyJoinShoppingCart: function () {
            var statistical = this.getStorage();

            var nextTime = statistical.notifyJoinShoppingCart.nextTime;
            var time = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1).getTime();
            console.log("====> Join cart time:" + nextTime, time)
            if (nextTime != 0 && nextTime <= time) {
                return false
            }

            var option = config.notifyJoinShoppingCart
            option.success = function (data) {
                statistical.notifyJoinShoppingCart.nextTime = time;
                _this.statistical.setStorage(statistical);
            }
            _this.ajax(_this, option)
        },

        // 统计 - 点击购物车按钮时使用(不存在商品或返回成功后 当天就不需要再通知)
        notifyClickShoppingCart: function () {
            var statistical = this.getStorage();
            var nextTime = statistical.notifyClickShoppingCart.nextTime;
            var time = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1).getTime();

            console.log("====> Click cart time: " + nextTime, time)
            if ((nextTime != 0 && nextTime <= time) || _this.Cart.getCheckTotal().totalNum == 0) {
                return false
            }
            var option = config.notifyClickShoppingCart
            option.success = function (data) {
                statistical.notifyClickShoppingCart.nextTime = time;
                _this.statistical.setStorage(statistical);
            }
            _this.ajax(_this, option)

        },

        // 统计 - 选择商店时使用 没选择一次 通知一次 第一次默认商店时也需要通知
        notifyAccessMarket: function (marketId, lot, lat) {
            console.log("====> notifyAccessMarket : " + marketId);
            if (!marketId) return false
            var option = config.notifyAccessMarket
            option.data.marketId = marketId
            option.data.longitude = lot
            option.data.latitude = lat
            console.log("====> " + option.url, option.data)
            option.success = function (data) {

            }
            _this.ajax(_this, option)
        }
    }
})
























