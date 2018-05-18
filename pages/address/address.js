const config = require('../../config')

var app = getApp()
var _this = null

var winAjax = {
	getAddresses : function(){
		var option = config.getAddresses;
		option.success = function(data){
			var addressData = false, addressSort = []
			data = data.data.response ? data.data.response.datas : {};
			for(var i in data){
				if(!addressData) addressData = {}
				addressSort.push(data[i].id)
				addressData[data[i].id] = data[i]
			}
			_this.setData({
				addressSort : addressSort,
				addressData: addressData
			});
		}
      app.ajax(_this,option);
	},
	removeAddress : function(addressId){
		var option = config.removeAddress;
		option.data.addressId = addressId
		option.success = function(data){

			// 删了默认地址，下一个地址为默认地址
			if(_this.data.addressData[addressId].status == 2){
				for(var id in _this.data.addressData){
					console.log(addressId ,id)

					if(addressId == id){
						addressId = null
						continue
					}
					addressId = id;
					break
				}
			}
			if(addressId != null){
				_this.ajax.setDefaultAddress(addressId);
			}
			_this.ajax.getAddresses()
		}
      	app.ajax(_this,option);
	},
	setDefaultAddress : function(addressId){
		var option = config.setDefaultAddress;
		option.data.addressId = addressId
		option.success = function(data){
			_this.ajax.getAddresses()
		}
      	app.ajax(_this,option);
        // if(_this.data.choose){
        //     var pages = getCurrentPages();
        //     var prevPage = pages[pages.length - 2]; //上一个页面
        //     prevPage.setData({
        //         status: { tabActive: 2,isPay:true },
        //     })
        //     // prevPage.ajax.findMarket();
        //     wx.navigateBack();
        // }
	}

}

Page({
  data: {
  	addressData : {},
  	check : true,
  	choose : false
  },
  onLoad: function (option) {
  	wx.setNavigationBarTitle({title: '地址管理'})
	_this = this
	if(option.type != null && option.type == 'choose'){
		this.setData({choose : true})
	}

	this.ajax.getAddresses()
  },
  onReload : function(){
      this.ajax.getAddresses()
  },
  onUnload : function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上1个页面
    prevPage.onReload()
  },
  onGo: function(e){
      // 检测是否绑定手机
      if (app.data.userInfo.hasBinding == 0) {
          wx.navigateTo({ url: '../my/bindPhone' })
      } else {
        wx.navigateTo({url: e.target.dataset.url})
      }
  },
  setDefaultAddress : function(e){
  	this.ajax.setDefaultAddress(e.detail.value);
  },
  removeAddress : function(e){
  	this.ajax.removeAddress(e.target.dataset.id);
  },
  onChoose : function(e){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上1个页面
    console.log(prevPage)
    prevPage.setData({
    	address : this.data.addressData[e.target.dataset.id],
        status: { tabActive: 2, isAbled: true, isPay: true },
    })
    // prevPage.ajax.findMarket();
    this.ajax.setDefaultAddress(e.target.dataset.id);
    wx.navigateBack();
  },
  ajax : winAjax
})