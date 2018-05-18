// pages/message/messageList.js
const config = require('../../config')

var app = getApp()
var _this = null
var _load = false

var winAjax = {
    getMarketMsgListByType: function () {
        var option = config.getMarketMsgListByType;
        option.data.passportId = _this.data.urlPara.passportId
        option.data.typeId = _this.data.urlPara.typeId
        option.data.pageSize = 12
        option.success = function (data) {
            wx.hideLoading();
            if (data.data.code == 100) {
                _this.data.scrollUpStop = true; // 没有数据
                _this.setData({
                    scrollUpStop: _this.data.scrollUpStop
                });
                _load = false
                return false
            }

            data = data.data.response ? data.data.response.datas : {};
            console.log(_load)
            if (_load) {
                _load = false;
                data = _this.data.msgListData.concat(data);
            }
        
            _this.setData({
                msgListData: data || false
            });
        }
        app.ajax(_this, option)
    },
    // updateMarketMsgQueueStatus: function (e) {
    //     console.log(e)
    //     var option = config.updateMarketMsgQueueStatus;
    //     option.data.passportId = app.data.userInfo.passportId
    //     option.data.msgId = e.currentTarget.dataset.mid
    //     option.success = function (data) {
    //         if (data.data.code == 0) {
    //             data = data.data.response ? data.data.response.datas : {};
    //             _this.setData({
    //                 msgListData: data
    //             });
    //         }
    //     }
    //     app.ajax(_this, option)
    // }
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
      msgListData: [],
      urlPara: {},
      pageIndex: 1,
      scrollUpStop: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.log(options)
      wx.setNavigationBarTitle({ title: '消息列表' })
      _this = this
      _this.setData({ urlPara: options })
      // 加载消息列表
      config.getMarketMsgListByType.data.pageIndex = 1
      _this.ajax.getMarketMsgListByType()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
     
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
     
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2]; //上1个页面
      prevPage.onReload()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
      if (this.data.scrollUpStop) {
          return false;
      }
      wx.showLoading({
          title: '加载中',
          mask: true
      })
      _load = true;
      config.getMarketMsgListByType.data.pageIndex += 1
      _this.ajax.getMarketMsgListByType();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  onGoto: function (e) {
      var id = e.currentTarget.dataset.mid
    wx.navigateTo({
        // url: e.currentTarget.dataset.url,
        url: "messageDetail?contentId=" + id
    })
  },
//   onMsgQueue: function(e){
//       _this.ajax.updateMarketMsgQueueStatus(e)
//   },
  setDefaultImg: function (e) {
      console.log(e)
      this.data.msgListData[e.target.dataset.mid].listImgUrl = 'http://xmarket.oss-cn-shenzhen.aliyuncs.com/market/app/icon/defaultImg.png'
      this.setData({
          msgListData: this.data.msgListData
      })
  },
  ajax: winAjax
})