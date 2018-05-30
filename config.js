/**
 * 小程序配置文件
 */

// huangxc 
// #### 通行证中心域名地址 ####
// passportRemoteURL=http://huangxc:8080/passport/
// #### 支付中心域名地址 ####
// paymentRemoteURL=http://huangxc:8080/payment/
// #### 订单中心域名地址 ####
// orderRemoteURL=http://huangxc:8080/order/
// #### 商品中心域名地址 ####
// itemRemoteURL=http://huangxc:8080/item/
// #### 物流域名地址 ####
// logisticsRemoteURL=http://huangxc:8080/logistics/
// #### 无人超市域名地址 ####
// marketRemoteURL=http://huangxc:8080/market/
// #### 商店服务端 ####
// marketShopRemoteURL=http://huangxc:8080/marketshop/

// 服务器
// #### 通行证中心域名地址 ####
// passportRemoteURL=http://112.74.185.56:8080/
// #### 支付中心域名地址 ####
// paymentRemoteURL=http://119.23.104.118:8082/
// #### 无人超市域名地址 ####
// marketRemoteURL=http://119.23.104.118:8083/

var host = {
    market: "https://m.xiaohuistore.com",
    passport: "https://m.xiaohuistore.com",
    payment: "https://m.xiaohuistore.com",
    socket: "wss://m.xiaohuistore.com"
}

var ServerHost = {
    market: host.market + "/market",
    coupon: host.market + "/market/coupon",
    marketItem: host.market + "/market/item",
    marketOrder: host.market + "/market/order",
    marketQuest: host.market + "/market/question",
    passport: host.passport + "/passport",
    passportListener: host.market + "/market/passport/listener",
    payment: host.payment + "",
    socketUrl: host.socket + "/market/webSocket/dashboard"
}

var ServerHostOpenApi = {
    market: ServerHost.market + '/openapi',
    coupon: ServerHost.coupon + "/openapi",
    marketItem: ServerHost.marketItem + '/openapi',
    marketOrder: ServerHost.marketOrder + '/openapi',
    marketQuest: ServerHost.marketQuest + "/openapi",
    passport: ServerHost.passport + "",
    passportListener: ServerHost.passportListener,//+ "/openapi"
}

var config = {
    // 绑定手机号码
    weixinBindingCellNumber: {
        host: "passport",
        islogin: false,
        url: "/channel/weixinBindingCellNumber",
        data: { openId: 2, phoneNumber: '', smsCode: '' }
    },
    // 验证手机号是否使用
    phoneBeUsed: {
        host: "passport",
        islogin: false,
        url: "/phoneBeUsed",
        data: { phoneNumber: '' }
    },
    // 验证码
    requestVerificationCode: {
        host: "passport",
        islogin: false,
        url: "/sms/requestVerificationCode",
        data: { type: 7, phoneNumber: '' }
    },
    // 登录授权
    weixinAuthorization: {
        host: "passport",
        islogin: false,
        url: "/channel/weixinAuthorization",
        data: { weixinAuthorType: 2, code: '', fromPartnerId: 'xlb908100000' }
    },
    // 完善用户资料
    // passportId - long 通行证ID，必填参数。
    // nickName - String 昵称，用于显示，必填参数。
    // headImageUrl - String 头像，用于显示，非必填参数。
    // sex - byte 用户性别 0:女、1:男
    perfectWeixinInformation: {
        host: "passport",
        islogin: false,
        url: "/channel/perfectWeixinInformation",
        data: { passportId: 2, nickName: '', headImageUrl: '', sex: 0, openId: '' }
    },
    //  商品类型接口
    itemTypes: {
        host: "marketItem",
        islogin: true,
        url: "/itemTypes",
        data: { requestSourse: 3, marketId: 100000 }
    },
    // 小批商品分类接口
    getMarketItemClassifyVoList: {
        host: "market",
        islogin: true,
        url: "/getMarketItemClassifyVoList",
        data: { marketId: 100001, itemClassifyVisible: 1 }
    },
    //小批商品接口
    getItemByClassifyIds: {
        host: "market",
        islogin: true,
        url: "/getItemByClassifyIds",
        data: { passportId: 8888, marketId: 100001, classifyId: 1, pageSize: 12, pageIndex: 0, itemClassifyVisible: 3 }
    },
    // 找到商店
    findMarket: {
        host: "market",
        server: "",
        islogin: true,
        url: "/findMarket",
        data: { passportId: 100000, marketId: 0 }
    },
    // 找到可用的商店
    showMarkets: {
        host: "market",
        islogin: true,
        url: "/showMarkets",
        data: { passportId: 100000, longitude: 0, latitude: 0 }
    },
    // 过滤出有效的商品
    filterValidItems: {
        host: "marketItem",
        islogin: true,
        url: "/filterValidItems",
        data: { itemSet: '' }
    },
    // 找商品
    pageItems: {
        host: "marketItem",
        islogin: true,
        url: "/pageItems",
        data: { requestSourse: 3, passportId: 100000, marketId: 0, itemTypeId: 0, sortType: 0, sortValue: 0, searchKeyValue: '', pageSize: 20, pageIndex: 1 }
    },
    fuzzyMatchItemName: {
        host: "marketItem",
        islogin: true,
        url: "/fuzzyMatchItemName",
        data: { requestSourse: 3, fuzzyItemName: '', marketId: 100000 }
    },
    loaderHotSearch: {
        host: "marketItem",
        islogin: true,
        url: "/loaderHotSearch",
        data: { marketId: 100000, pageIndex: 1, pageSize: 10 }
    },

    //  订单数据
    showOrders: {
        host: "marketOrder",
        islogin: true, // false
        url: "/showOrders",
        // passportId  - long 通行证ID，必填参数。
        // roleType    - int 角色类型，必填参数；具体参考：{@linkplain com.xlibao.common.constant.order.OrderRoleTypeEnum}。
        // orderType   - int 订单类型，必填参数；具体参考：{@linkplain com.xlibao.common.constant.order.OrderTypeEnum}。
        // statusEnter - int 状态入口，必填参数；具体参考：{@linkplain com.xlibao.saas.market.service.order.StatusEnterEnum}。 11:全部  12:待付款  13:待收货 14:退款
        // pageIndex    - int 页码，非必填参数；默认为：{@linkplain com.xlibao.common.GlobalConstantConfig#DEFAULT_PAGE_INDEX}。
        // pageSize     - int 显示数量，非必填参数；默认为：{@linkplain com.xlibao.common.GlobalConstantConfig#DEFAULT_PAGE_SIZE}。
        data: { passportId: 100281, marketId: 0, roleType: 1, orderType: 1, statusEnter: 11, pageIndex: 1, pageSize: 10 }
    },
    orderDetail: {
        host: "marketOrder",
        islogin: true, // false
        url: "/orderDetail",
        // passportId  - long 通行证ID，必填参数。
        // roleType    - int 角色类型，必填参数；具体参考：{@linkplain com.xlibao.common.constant.order.OrderRoleTypeEnum}。
        // orderType   - int 订单类型，必填参数；具体参考：{@linkplain com.xlibao.common.constant.order.OrderTypeEnum}。
        // orderId     - long 订单ID，必填参数。
        data: { passportId: 100281, roleType: 1, orderId: 0 }
    },
    //  预下单
    prepareCreateOrder: {
        host: "marketOrder",
        islogin: true, // false
        url: "/prepareCreateOrder",
        // passportId - long 下单通行证ID，必填参数；未登录时，提示用户登录。
        // orderType - int 订单类型，必填参数；具体参考：{@linkplain com.xlibao.common.constant.order.OrderTypeEnum}。 销售订单：1
        data: { passportId: 100000, orderType: 1 }
    },
    //  生成订单
    generateOrder: {
        host: "marketOrder",
        islogin: true, // false
        url: "/generateOrder",
        //  passportId - long 下单通行证ID，必填参数。
        //  marketId - long 商店ID，必填参数。
        //  deviceType - int 设备类型，非必填参数；默认为{@linkplain com.xlibao.common.constant.device.DeviceTypeEnum#DEVICE_TYPE_ANDROID}， 具体参考：{@linkplain com.xlibao.common.constant.device.DeviceTypeEnum}。
        //  deliverType - int 配送类型，非必填参数；参看：{@link com.xlibao.saas.market.service.order.DeliverTypeEnum} 1: 自提 2:配送
        //  sequenceNumber - String 预下单序号，必填参数。
        //  currentLocation - String 当前位置信息，非必填参数；尽量提供，方便后期跟踪；格式为：latitude,longitude。
        //  collectingFees - byte 代收费用，非必填参数；默认为{@linkplain com.xlibao.common.constant.order.CollectingFeesEnum#UN_COLLECTION} 不代收。
        //  receiptProvince - String 收货省份，必填参数。
        //  receiptCity - String 收货城市，必填参数。
        //  receiptDistrict - String 收货区域，必填参数
        //  receiptAddress - String 具体收货地址，必填参数。
        //  receiptNickName - String 收货人昵称，必填参数。
        //  receiptPhone - String 收货人联系号码，必填参数。
        //  receiptLocation - String 收货地址经纬度，非必填参数；请尽量提供，方便距离跟踪；格式为：latitude,longitude。
        //  remark - String 描述内容(备注)。
        //  itemSet - String 商品集合，格式为：JSONObject -- {"10000":"2"} ID:数量。
        data: { passportId: 100000, marketId: 0, deviceType: 5, deliverType: 1, sequenceNumber: 0, currentLocation: "0,0", collectingFees: 0, receiptProvince: "", receiptCity: "", receiptDistrict: "", receiptAddress: "", receiptNickName: "", receiptPhone: "", receiptLocation: "", remark: "", itemSet: "" }
    },
    //  创建支付订单
    paymentOrder: {
        host: "marketOrder",
        islogin: true, // false
        url: "/paymentOrder",
        // passportId - long 通行证ID，必填参数。
        // partnerUserId - long openId
        // orderSequenceNumber - String 订单序列号, 创建订单返回。
        // deliverType - int 配送类型，非必填参数；参看：{@link com.xlibao.saas.market.service.order.DeliverTypeEnum} 1: 自提 2:配送
        // paymentType - String 支付类型，必填参数；参考：{@linkplain com.xlibao.common.constant.payment.PaymentTypeEnum} 31000:WEIXIN_JS/ ,  30000:WEIXIN_NATIVE/微信 ,  10000:BALANCE/余额支付
        data: { passportId: 100000, orderSequenceNumber: 0, partnerUserId: 'oK0EP0QOOr266C3oDDyMf6Tq7uzw', deliverType: 1, paymentType: 'WEIXIN_JS' }
    },
    //  取消订单
    cancelOrder: {
        host: "marketOrder",
        islogin: true, // false
        url: "/cancelOrder",
        data: { passportId: 100000, orderSequenceNumber: 0 }
    },
    //  修改收货数据
    modifyReceivingData: {
        host: "marketOrder",
        islogin: true, // false
        url: "/modifyReceivingData",
        //  orderSequenceNumber - String 订单序号
        //  currentLocation - String 当前位置信息，非必填参数；尽量提供，方便后期跟踪；格式为：latitude,longitude。
        //  collectingFees - byte 代收费用，非必填参数；默认为{@linkplain com.xlibao.common.constant.order.CollectingFeesEnum#UN_COLLECTION} 不代收。
        //  receiptProvince - String 收货省份，必填参数。
        //  receiptCity - String 收货城市，必填参数。
        //  receiptDistrict - String 收货区域，必填参数
        //  receiptAddress - String 具体收货地址，必填参数。
        //  receiptNickName - String 收货人昵称，必填参数。
        //  receiptPhone - String 收货人联系号码，必填参数。
        //  receiptLocation - String 收货地址经纬度，非必填参数；请尽量提供，方便距离跟踪；格式为：latitude,longitude。
        //  remark - String 描述内容(备注)。
        data: { collectingFees: 0, orderSequenceNumber: "", currentLocation: "", receiptProvince: "", receiptCity: "", receiptDistrict: "", receiptAddress: "", receiptNickName: "", receiptPhone: "", receiptLocation: "", remark: "" }
    },
    //  支付
    pay: {
        BALANCE: {
            host: "payment",
            islogin: false,
            url: "/payment/balancePayment",
            data: { passportId: 100001, paymentPassword: '123456' }
        }
    },
    //  退款
    refundOrder: {
        host: "marketOrder",
        islogin: false,
        url: "/refundOrder",
        data: { passportId: 100001, orderSequenceNumber: '', title: '', content: '' }
    },
    findContainerData: {
        host: "marketOrder",
        islogin: false,
        url: "/findContainerData",
        data: { passportId: 100001, orderSequenceNumber: '' }
    },
    directPurchase: {
        host: "marketItem",
        islogin: false,
        url: "/directPurchase",
        data: { passportId: 100001, itemSet: '' }
    },


    //  获取省/城/区
    getArea: {
        host: "market",
        islogin: true,
        url: "/filterMarket",
        //  type 1:省/2:市/3:区/4:街道
        //  parentId 对于ID
        data: { passportId: 100000, type: 1, parentId: 0 }
    },
    //  获取全部地址
    getAddresses: {
        host: "passport",
        islogin: false,
        url: "/address/getAddresses",
        data: { passportId: 100000 }
    },
    //  获取默认地址
    getDefaultAddress: {
        host: "passport",
        islogin: false,
        url: "/address/getDefaultAddress",
        data: { passportId: 100000, marketId: 0 }
    },
    //  获取地址
    getAddress: {
        host: "passport",
        islogin: false,
        url: "/address/getAddress",
        data: { passportId: 100000, addressId: 0 }
    },
    //  修改地址
    modifyAddress: {
        host: "passport",
        islogin: false,
        url: "/address/modifyAddress",
        // passportId - long 通行证ID，必填参数。
        // addressId - long 需修改信息的地址ID，必填参数。
        // name - String 收货人姓名，必填参数。
        // alias - String 地址别名，必填参数。
        // phoneNumber - String 联系人号码，必填参数。
        // country - String 归属国家，非必填参数；默认为：中华人民共和国。
        // province - String 所在省份，非必填参数；直辖市时填充为直辖市名称，如：北京市、重庆市等。
        // city - String 所在城市，非必填参数。
        // district - String 所在行政区域，非必填参数。
        // street - String 街道，非必填参数。
        // streetNum - String 街道号，非必填参数。
        // adcode - String 归属城市编码，非必填参数。
        // detailAddress - String 具体地址，必填参数。
        // longitude - double 经度，必填参数；主要用于导航、距离计算等。
        // latitude - double 纬度，必填参数；主要用于导航、距离计算等。
        // type - int 地址类型，非必填参数；暂时为0，表示通用，以后可扩展为仅对某个应用有效。
        // status - byte 地址状态，非必填参数；具体参考：{@linkplain com.xlibao.common.constant.passport.AddressStatusEnum}；默认为{@linkplain com.xlibao.common.constant.passport.AddressStatusEnum#DEFAULT}。
        data: { passportId: 0, addressId: 0, name: '', alias: '', phoneNumber: '', country: '中华人民共和国', province: '', city: '', district: '', street: '', streetNum: '', adcode: '', detailAddress: '', longitude: 0.0, latitude: 0.0, type: 0, status: 0 }
    },
    //  新增地址
    newAddress: {
        host: "passport",
        islogin: false,
        url: "/address/newAddress",
        // 同 modifyAddress
        data: { passportId: 0, addressId: 0, name: '', alias: '', phoneNumber: '', country: '中华人民共和国', province: '', city: '', district: '', street: '', streetNum: '', adcode: '', detailAddress: '', longitude: 0.0, latitude: 0.0, type: 0, status: 0 }
    },
    //  设置默认地址
    setDefaultAddress: {
        host: "passport",
        islogin: false,
        url: "/address/setDefaultAddress",
        data: { passportId: 100000, addressId: 0 }
    },
    //  移除地址
    removeAddress: {
        host: "passport",
        islogin: false,
        url: "/address/removeAddress",
        data: { passportId: 100000, addressId: 0 }
    },
    //  加载问题类目
    loaderProblemTypes: {
        host: "marketQuest",
        islogin: false,
        url: "/loaderProblemTypes",
        data: { passportId: 100000 }
    },
    //  找到类目下问题
    findProblems: {
        host: "marketQuest",
        islogin: false,
        url: "/findProblems",
        data: { passportId: 100000, problemTypeId: 0 }
    },
    //  加载退款标签
    loaderRefundLabel: {
        host: "marketQuest",
        islogin: false,
        url: "/loaderRefundLabel",
        data: { passportId: 100000 }
    },
    //  有效优惠券列表
    showValidCoupons: {
        host: "coupon",
        islogin: false,
        url: "/showValidCoupons",
        data: { passportId: 100363, pageSize: 10, pageIndex: 1 }
    },
    //  无效优惠券列表
    showInvalidCoupons: {
        host: "coupon",
        islogin: false,
        url: "/showInvalidCoupons",
        data: { passportId: 100363, pageSize: 10, pageIndex: 1 }
    },
    //  已使用惠券列表
    showUseCoupons: {
        host: "coupon",
        islogin: false,
        url: "/showUseCoupons",
        data: { passportId: 100363, pageSize: 10, pageIndex: 1 }
    },
    //  选择可使用的优惠券
    filterCoupons: {
        host: "coupon",
        islogin: false,
        url: "/filterCoupons",
        data: { passportId: 100363, marketId: 0, itemSet: "" }
    },
    //  可领取的优惠券列表
    waitForReceiveCoupons: {
        host: "coupon",
        islogin: false,
        url: "/waitForReceiveCoupons",
        data: { passportId: 100363, pageIndex: 1, pageSize: 10 }
    },
    //  领取优惠券
    receiveCoupons: {
        host: "coupon",
        islogin: false,
        url: "/receiveCoupons",
        data: { passportId: 100363, couponTemplateId: 0 }
    },

    // 统计 - 添加商品到购物车 
    notifyJoinShoppingCart: {
        host: "passportListener",
        islogin: false,
        url: "/notifyJoinShoppingCart",
        data: { passportId: 100000 }
    },
    // 统计 - 点击购物车 
    notifyClickShoppingCart: {
        host: "passportListener",
        islogin: false,
        url: "/notifyClickShoppingCart",
        data: { passportId: 100000 }

    },
    // 统计 - 通知选择商店 
    notifyAccessMarket: {
        host: "market",
        islogin: false,
        url: "/notifyAccessMarket",
        data: { passportId: 100000, marketId: 0, longitude: 0.0, latitude: 0.0 }
    },
    // 根据用户ID获取消息数量
    getMarketInformationCount: {
        host: "market",
        islogin: false,
        url: "/getMarketInformationCount",
        data: { passportId: 100000 }
    },
    // 根据类型获取消息列表
    getMarketMsgListByType: {
        host: "market",
        islogin: false,
        url: "/getMarketMsgListByType",
        data: { passportId: 8888, typeId: 1, pageIndex: 1, pageSize: 12 }
    },
    // 根据id获取文章内容
    getMarketInformationEntityById: {
        host: "market",
        islogin: false,
        url: "/getMarketInformationEntityById",
        data: { passportId: 8888, id: 0 }
    },
    // 更新消息数量
    updateMarketMsgQueueStatus: {
        host: "market",
        islogin: false,
        url: "/updateMarketMsgQueueStatus",
        data: { passportId: 8888, msgId: 1 }
    }
};

module.exports = function () {
    config.host = ServerHost;
    config.hostOpenApi = ServerHostOpenApi;
    return config;
}();

