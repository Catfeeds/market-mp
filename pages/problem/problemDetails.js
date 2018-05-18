const config = require('../../config')

var app = getApp();
var _this = null;

var winAjax = {
	findProblems : function(id){
		var option = config.findProblems
		option.data.problemTypeId = id
		option.success = function(data){
			if(data.data.code == 100){
				
				return 
			}

			_this.setData({
				problemsData : data.data.response.datas
			})
		}
		app.ajax(_this, option)
	}
}


Page({
  data: {
  	problemsData : []
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({title: option.title})
    // 初始化信息
    _this = this

    this.ajax.findProblems(option.problemTypeId)
  },
  ajax : winAjax
})