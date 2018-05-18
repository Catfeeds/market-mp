const config = require('../../config')
var app = getApp()
var _this = null
var winAjax = {
	newOrModifyAddress : function(fn, success){
		var option = config[fn] // modifyAddress / newAddress
		for (var obj in _this.data.address) {
            option.data[obj] = _this.data.address[obj];
        }

		option.success = function(data){
			success()
		}
		app.ajax(_this, option)
	},
	getAddress : function(addressId){
		var option = config.getAddress
		option.data.addressId = addressId
		option.success = function(data){
			_this.setData({
				addressStatus : data.data.response.status,
				address : data.data.response
			})
		}
		app.ajax(_this, option)
	}
}

Page({
  data: {
  	area : {
        province : '',  //String 所在省份，非必填参数；直辖市时填充为直辖市名称，如：北京市、重庆市等。
        city : '',  	//String 所在城市，非必填参数。
        district : '',  //String 所在行政区域，非必填参数。
        street : '',  	//String 街道，非必填参数。
        streetNum : '', //String 街道号，非必填参数。
        adcode : '',  	//String 归属城市编码，非必填参数。
        longitude : '', //double 经度，必填参数；主要用于导航、距离计算等。
        latitude : ''  //double 纬度，必填参数；主要用于导航、距离计算等。
  	},
  	location : {},
  	addressChooseName : '请选择',
  	addressStatus : 2,
  	address : {},
  	check : true
  },
  onLoad: function (option) {
  	_this = this

  	if(option.type == 'edit'){

  		wx.setNavigationBarTitle({title: '地址编辑'})
  		this.ajax.getAddress(option.id)
  	}else{
  		wx.setNavigationBarTitle({title: '新增地址'})
		this.setData({
			address : {status : 2}
		})
  	}
  },
  onGo: function(e){
    wx.navigateTo({url: e.target.dataset.url})
  },
  onSubmit : function(e){
  	var fn = 'newAddress'
  	if(this.data.address.id && this.data.address.id != null && this.data.address.id != ''){
  		this.data.address.addressId = this.data.address.id
  		fn = 'modifyAddress' 
  	} 

  	var values = e.detail.value
	if(values.name == ''){
        wx.showModal({
          title: '提示',
          content: '收货人不能为空',
          showCancel : false
        })
        return 
    }
	if(!(/^1[34578]\d{9}$/.test(values.phoneNumber))){
        wx.showModal({
          title: '提示',
          content: '请输入正确的手机号码',
          showCancel : false
        })
        return 
    }
    var alias = this.data.address.alias || this.data.address.addressAlias || this.data.location.name
	if(alias == null  || alias == ""){
        wx.showModal({
          title: '提示',
          content: '所在区域不能为空',
          showCancel : false
        })
        return 
    }
	if(values.detailAddress == ''){
        wx.showModal({
          title: '提示',
          content: '详细地址不能为空',
          showCancel : false
        })
        return 
    }

	this.data.address.name  		= values.name 			|| ""
	this.data.address.detailAddress = values.detailAddress 	|| ""
	this.data.address.phoneNumber 	= values.phoneNumber 	|| ""

	this.data.address.alias 		= this.data.location.name || this.data.address.addressAlias
	this.data.address.longitude 	= this.data.location.longitude || this.data.address.longitude
	this.data.address.latitude 		= this.data.location.latitude || this.data.address.latitude

	// this.data.address.province 		= values.province 		|| "" 
	// this.data.address.city 			= values.city 			|| ""
	// this.data.address.district 		= values.district 		|| ""
	// this.data.address.street 		= values.street 		|| ""
	// this.data.address.streetNum 		= values.streetNum 		|| ""
	// this.data.address.adcode 		= values.adcode 		|| ""
	// this.data.address.longitude 		= values.longitude 		|| ""
	// this.data.address.latitude 		= values.latitude 		|| ""
	this.data.address.detailAddress = values.detailAddress 	|| ""
	this.data.address.status = this.data.addressStatus
	_this.setData({
		address : this.data.address
	})
  	this.ajax.newOrModifyAddress(fn, function(){
		var pages = getCurrentPages();
		var prevPage = pages[pages.length - 2]; //上一个页面
		prevPage.onReload();
		wx.navigateBack();
  	});
  },
  onSwitchChange : function(e){
  	_this.setData({
  		addressStatus : e.detail.value ? 2 : 0
  	})
  },
  onChooseLocation : function(){
    this.checkGPS(function(){
      wx.chooseLocation({
        success : function(res){
          if(res.name == null || res.name == ""){
                wx.showToast({
                  title: '请选择地址',
                  icon: 'loading',
                  duration: 2000
                })
                _this.onChooseLocation()
          }else{
            _this.setLocation(res);
          }
        }
      })
    })
  },
  checkGPS : function(cb){
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        cb()
      },
      fail: function({errMsg}) {
          app.data.GPS = true
          // 产品需求 关闭 GPS 可继续访问  、 or 开启GPS未给定位权限 走授权页
          if(errMsg == 'getLocation:fail 1'){
            app.onGo('../address/addressBaiduMap');
          }else{
            cb()
          }
      }
    })
  },
  setLocation : function(data){
      _this.data.location = data
      if(_this.data.address.addressAlias != null){
        _this.data.address.addressAlias = data.name
        _this.setData({
          address : _this.data.address
        })
      }
      console.log(_this.data.location);
      _this.setData({
        location : _this.data.location
      })
  },
  ajax : winAjax
})