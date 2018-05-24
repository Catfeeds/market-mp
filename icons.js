

var icons = {
  toUrl : function(icon){
    return this.host + this[icon].u + this[icon] + this.size + this.format;
  },
  host : "https://xmarket.oss-cn-shenzhen.aliyuncs.com/market/app/icon/",
  size : "@3x",
  format : ".png",
  account:{
    "w" : "9.5px",
    "h" : "14px",
    "u" : "accountIcon"
  },
  B_location:{
    "w" : "9.5px",
    "h" : "14px",
    "u" : "B-location"
  },
  O_location:{
    "w" : "9.5px",
    "h" : "14px",
    "u" : "O-location"
  },
  W_location:{
    "w" : "11px",
    "h" : "14px",
    "u" : "W-locationIcon"
  },
  cart:{
    "w" : "",
    "h" : "",
    "u" : "CarIcon"
  },
  check:{
    "w" : "13px",
    "h" : "9px",
    "u" : "checkIcon"
  },
  close:{
    "w" : "15px",
    "h" : "15px",
    "u" : "closeIcon"
  },
  focus:{
    "w" : "",
    "h" : "",
    "u" : "FocusIcon"
  },
  loading:{
    "w" : "",
    "h" : "",
    "u" : "loading"
  },
  minus:{
    "w" : "",
    "h" : "",
    "u" : "minusIcon"
  },
  navigate:{
    "w" : "15px",
    "h" : "16px",
    "u" : "navigateiconicon"
  },
  order:{
    "w" : "36px",
    "h" : "40px",
    "u" : "OrderIcon"
  },
  payment:{
    "w" : "36px",
    "h" : "40px",
    "u" : "paymentIcon"
  },
  receipt:{
    "w" : "36px",
    "h" : "40px",
    "u" : "ReceiptIcon"
  },
  refunds:{
    "w" : "36px",
    "h" : "40px",
    "u" : "RefundsIcon"
  },
  search:{
    "w" : "13px",
    "h" : "13px",
    "u" : "SearchIcon"
  },
  search2:{
    "w" : "16px",
    "h" : "16px",
    "u" : "SearchIcon2"
  },
  selected:{
    "w" : "",
    "h" : "",
    "u" : "SelectedIcon"
  },
  success:{
    "w" : "93px",
    "h" : "93px",
    "u" : "successIcon"
  },
  trash:{
    "w" : "10px",
    "h" : "12px",
    "u" : "trashIcon"
  },
  minus:{
    "w" : "25px",
    "h" : "25px",
    "u" : "minusIcon"
  },
  add:{
    "w" : "25px",
    "h" : "25px",
    "u" : "Addicon"
  },
  add_dis:{
    "w" : "25px",
    "h" : "25px",
    "u" : "Addicon_dis"
  },
  checkbok:{
    "w" : "25px",
    "h" : "25px",
    "u" : "Addicon_dis"
  },
  checkbok_check:{
    "w" : "25px",
    "h" : "25px",
    "u" : "checkbok_check"
  },
  soldOut:{
    "w" : "63px",
    "h" : "auto",
    "u" : "soldOut"
  }
}

module.exports = function(){
    var imgs = {};
    for(var key in icons){
        if(key == "host" || key == "size" || key == "format") continue;
        imgs[key] = {};
        imgs[key].url = icons.host + icons[key].u + icons.size + icons.format;
        imgs[key].w = icons[key].w;
        imgs[key].h = icons[key].h;
    }
    return imgs;
}