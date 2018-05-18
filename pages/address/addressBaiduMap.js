const config = require('../../config')
const icons = require('../../icons')
var bmap = require('../../utils/bmap-wx.min.js')

var app = getApp()
var _this = null

// 引用百度地图微信小程序JSAPI模块 
Page({ 
    data: { 
        sugData: '' ,
        icons : icons()
    }, 
    // 绑定input输入 
    onSearch: function(e) { 
        var _this = this; 
        // 新建百度地图对象 
        var BMap = new bmap.BMapWX({ 
            ak: 'I79iaFRR6vLjGaPdo5TMSSTPFU9Wsgsn' 
        }); 
        var fail = function(data) { 
            console.log('fail: '+data) 
        }; 
        var success = function(data) { 
          console.log(data)
            _this.setData({ 
                sugData: data.result
            }); 
        }

       // 发起suggestion检索请求 
        BMap.suggestion({ 
            query: e.detail.value, 
            region: '广州', 
            city_limit: true, 
            fail: fail, 
            success: success 
        }); 
    },
    onSearchResult : function(e){

      var data = this.data.sugData[e.target.dataset.key]
      console.log(data)
      var address = {
        latitude : data.location.lat,
        longitude : data.location.lng,
        address : data.city + data.district + data.name,
        name : data.district + data.name
      }

      console.log(address)

      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2]; //上一个页面
      prevPage.setLocation(address)
      wx.navigateBack();
    },
    onCancel : function(){
      wx.navigateBack();
    }
})