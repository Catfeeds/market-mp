const config = require('../../config')
const icons = require('../../icons')

var app = getApp()
var market = null
var user = null
var location = null
var _this = null

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
}

Page({
    data: {
        location: { hasLocation: false },
        locationMsg: '暂时无法获取位置',
        auth: false,
        currMarket: false,
        marketData: false,
        marketSort: [],
    },
    onLoad: function (option) {
        wx.setNavigationBarTitle({ title: '选择门店' })
        _this = this
        _this.setData({ auth: false }) // 预防退出立刻进入 赋值
        app.getUserInfo(function (data) {
            _this.data.userInfo = data
            market = app.Market.get()

            console.log('====> userInfo', _this.data.userInfo)
            // 获取位置
            _this.getLocation(function (location) {
                console.log("====> market : ", market)
                console.log("====> currentLocation : ", location)
                if (market) {
                    getApp().statistical.notifyAccessMarket(market.id, location.lot, location.lat)
                }
            })

            // 检测店铺
            if (!market.id) {
                _this.ajax.marketData()
            } else {
                _this.data.currMarket = market
            }
            console.log(_this.data)
            _this.setData(_this.data);

        })
    },
    onReload: function () {
        _this.onLoad()
    },
    onGohome: function (e) {
        wx.reLaunch({ url: 'home' })
    },
    getLocation: function (cb) {
        _this.setData({ marketSort: [] })
        wx.showLoading({
            title: '正在获取定位'
        })
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
    onMarket: function (e) {
        market = this.data.marketData[e.currentTarget.dataset.id];
        delete this.data.marketData[e.currentTarget.dataset.id];
        app.Market.set(market);

        //  统计
        getApp().statistical.notifyAccessMarket(market.id, _this.data.location.lot, _this.data.location.lat);

        this.setData({
            marketData: this.data.marketData,
            currMarket: market
        })
        this.onReload()
        wx.reLaunch({ url: 'home' })
    },
    ajax: winAjax
})