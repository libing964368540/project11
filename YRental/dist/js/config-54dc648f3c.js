var requstUrl2 = "https://multi.1daichong.com/popularizeservice/popularizeservice/";

var allAjaxUrl = (function () {
  //请求地址

    //var ip = 'http://192.168.0.101:1151';
    //var ip = 'http://192.168.0.101:1000/eva';
    var ip = 'https://multi.1daichong.com/eva';
  //考虑兼容性
  //var ip = location.origin;

  var rooturl = ip;
  var objurl = {}, urlpath = rooturl;

  objurl.urlpath = urlpath;
  objurl.AllHeroSkin = urlpath + '/HSC/AllHeroSkin?useCache=true';// 英雄皮肤列表
  objurl.sendMsg = urlpath + '/TP/sendMsg';// 发送验证码
  objurl.loginSms = urlpath + '/TP/loginSms';// 手机号登录
  objurl.verSms = urlpath + '/TP/verSms';// 验证验证码
  objurl.leaseRand = urlpath + '/lea/leaseRand';// 随机账号 少于等于2条
  //objurl.version = urlpath + '/rt/version';// 获取版本信息
  objurl.SkinHeroList = urlpath + '/rt/SkinHeroList';//获取稀有英雄 获取稀有皮肤
  objurl.leaseSearch = urlpath + '/lea/leaseSearch';// 账号搜索
  objurl.defaultSearch = urlpath + '/lea/defaultSearch';// 账号搜索 默认搜索内容
  // objurl.userLease = urlpath + '/lea/userLease';// 租号动作
  objurl.rentByLease = urlpath + '/lea/rentByLease';// 租赁中账号查询ID 包含密码
  objurl.rentByID = urlpath + '/lea/rentByID';// 账号查询ID 比管理页面去掉 用户信息 价格上浮30%页面处理
  objurl.payRentAli = urlpath + '/AliP/payRentAli';// 支付宝付款
  objurl.aliViPay = urlpath + '/AliP/aliViPay';// 支付宝付款  违规支付
  objurl.userLease = urlpath + '/AliP/userLease';// 支付宝付款  用户租号动作
  objurl.rentMyLease = urlpath + '/lea/rentMyLease';// 租赁账号记录 订单列表 价格上浮0%页面处理 1001 重新登录
  objurl.getUserBan = urlpath + '/lea/getUserBan';// 租客是否已交已经显示用 和列表一起请求 列表请求后再请求 缓存时间按列表缓存
  objurl.addRProtection = urlpath + '/lRP/addRProtection';        // 维权添加
  objurl.BalanceListToUser = urlpath + '/bal/BalanceListToUser';//余额明细

  //页面地址
  objurl.H5_login = '../html/login.html';       //登录
  objurl.H5_Index = '../html/index.html';       //首页
  objurl.H5_Search = '../html/search.html';     //查询账号列表
  objurl.H5_AccountDetail = '../html/accountDetail.html';     //账号详情
  objurl.H5_order = '../html/order.html';       //租号中页面
  objurl.H5_orderDetail = '../html/orderDetail.html';       //租赁账号记录
  objurl.H5_rightsProtection = '../html/rightsProtection.html';       //租赁维权
  objurl.H5_balance = '../html/balance.html';       //账户余额

  //图片
  objurl.imgSrc = 'https://xcx-evaluation.oss-cn-hangzhou.aliyuncs.com/yHSimg/'
  // objurl.CsRent = 'https://xcx-evaluation.oss-cn-hangzhou.aliyuncs.com/CsRent/';//上传图片预览测试18267939253
  // objurl.Rent = 'https://xcx-evaluation.oss-cn-hangzhou.aliyuncs.com/Rent/';//上传图片预览正式
  // objurl.allGameTypeImgsrc= 'https://xcx-evaluation.oss-cn-hangzhou.aliyuncs.com/gameType/' //游戏类型图片

  //订单分页数量
  objurl.orderPageSize = 10;


  objurl.getUserInfo =urlpath+ "/user/UserInfo";

  return objurl;
})();
var localCache = 'ep_h5_'

//皮肤英雄
//首页调用方法后 修改该标记 数据返回后更新
var flag_updateHeroSkin = false;

//稀有处理 英雄 第一次无数据返回 开始登录时候执行一次
function PublicHeroSkin() {

  var AllHeroSkinData = localStorage.getItem(localCache + 'AllHeroSkinData');
  var AllHeroSkinTime = localStorage.getItem(localCache + 'AllHeroSkinTime');
  if (AllHeroSkinData == null || AllHeroSkinData == "undefined" || AllHeroSkinData == "" || AllHeroSkinTime == null || AllHeroSkinTime == "undefined" || AllHeroSkinTime == "") {
    //继续
  } else {
    //判断是过期 1天
    var time = 60 * 60 * 24 * 1 - (Date.parse(new Date()) / 1000 - AllHeroSkinTime)
    if (time <= 0) {
      //继续
    } else {
      console.log("== 未过期")
      return JSON.parse(AllHeroSkinData);
    }
  }

  console.log(" == 拉取");

  $.ajax({
    url: allAjaxUrl.AllHeroSkin,
    type: 'POST',
    // data:{},
    success: function (res) {
      console.log(res);
      if (res.dataCode == 1) {
        console.log("PublicHsHero == res ", res);
        localStorage.setItem(localCache + 'AllHeroSkinData', JSON.stringify(res.data));
        localStorage.setItem(localCache + 'AllHeroSkinTime', Date.parse(new Date()) / 1000);
        if (flag_updateHeroSkin) {
          //
          updateHeroSkin();
        }
      } else {
        alert(JSON.parse(res).mes)
      }
    },
    error: function () {
      alert('网络超时，请稍后重试！')
    }
  })
}

//url参数
function getParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

//视口
(function flexible(window, document) {
  var docEl = document.documentElement
  var dpr = window.devicePixelRatio || 1
  // adjust body font size
  function setBodyFontSize() {
    if (document.body) {
      document.body.style.fontSize = (12 * dpr) + 'px'
    }
    else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize)
    }
  }
  setBodyFontSize();

  // set 1rem = viewWidth / 10
  function setRemUnit() {
    var rem = docEl.clientWidth / 10.8
    docEl.style.fontSize = rem + 'px'
  }

  setRemUnit()

  // reset rem unit on page resize
  window.addEventListener('resize', setRemUnit)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setRemUnit()
    }
  })

  // detect 0.5px supports
  if (dpr >= 2) {
    var fakeBody = document.createElement('body')
    var testElement = document.createElement('div')
    testElement.style.border = '.5px solid transparent'
    fakeBody.appendChild(testElement)
    docEl.appendChild(fakeBody)
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines')
    }
    docEl.removeChild(fakeBody)
  }
}(window, document))

/***
 * 租赁随机次数管理
 * renId 账号ID
 */
function rentRandom(renId) {
  // 对应id的随机数
  randomVal = localStorage.getItem(localCache + 'randomVal_'+renId);
  if (randomVal != null) {
    return randomVal;
  }
  // console.log("不存在 随机一个 1~1000")
  // 不存在 随机一个 1~1000
  newRanVal = random(1,1000);
  var RanList = localStorage.getItem(localCache + 'RanList');
  // 
  if (RanList == null) {
    // console.log("RanList 不存在新建")
    localStorage.setItem(localCache + 'RanList',renId);
  }else{
    // console.log("RanList存添加")
    RanList = RanList.split(",");
    // 设置最大储存200
    if (RanList.length >=200) {
      // console.log("RanList 超长 处理")
      //移除第一个随机数 和本地储存
      var removeId = RanList.shift();
      localStorage.removeItem(localCache + 'randomVal_'+removeId);
    }
    RanList.push(String(renId))
    localStorage.setItem(localCache + 'RanList',RanList);
  }
  localStorage.setItem(localCache + 'randomVal_'+renId,newRanVal);
  return newRanVal;
}

/**
 * 产生随机整数，包含下限值，但不包括上限值
 * @param {Number} lower 下限
 * @param {Number} upper 上限
 * @return {Number} 返回在下限到上限之间的一个随机整数
 */
function random(lower, upper) {
	return Math.floor(Math.random() * (upper - lower)) + lower;
}

console.log(document.referrer)

//截取带参URL的参数
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    };
    return (false);
};

var qCode = getQueryVariable("pCode");

if(qCode){
    localStorage.setItem('pCode',qCode)
}else{
    localStorage.setItem('pCode','')

};

var showShareList = [
  "accountDetail",
    'search',
    // 'login'
];
var href = window.location.href;
var htmlname = href.substring(href.lastIndexOf('\/')+1,href.lastIndexOf('.'));

showShareList.find(function (obj) {
    if(obj == htmlname){
        share();
    }
})

function share() {
    var share = document.createElement("div");
    var ptext = document.createElement("div");
    // var txt = document.createElement("input");

    share.setAttribute('class','share');
    // txt.setAttribute('class','share2');
    ptext.setAttribute('class','copyBox');
    share.innerText = '推广';

    function loadXMLDoc()
    {
        var xmlhttp;
        if (window.XMLHttpRequest)
        {
            //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
            xmlhttp=new XMLHttpRequest();
        }
        else
        {
            // IE6, IE5 浏览器执行代码
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange=function()
        {
            if (xmlhttp.readyState==4 && xmlhttp.status==200)
            {
                var data = JSON.parse(xmlhttp.responseText);
                if(data.error == undefined){
                    // txt.innerText = data.data;
                    ptext.innerText = data.data;
                    // txt.select();

                    const range = document.createRange();
                    range.selectNode(ptext);

                    const selection = window.getSelection();
                    if(selection.rangeCount > 0) selection.removeAllRanges();
                    selection.addRange(range);


                    document.execCommand("copy");
                    alert("推广链接已复制成功,快粘贴分享给好友！");
                }else{
                  alert(data.error.message)
                }
                // txt.innerText = window.location.href;
                // txt.select();
                // document.execCommand("copy");
                // alert("复制成功");
            }
        }
        xmlhttp.open("post",requstUrl2+"promoter/getPromoterUrl.do",true);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send("relevanceId="+localStorage.getItem('ep_h5_UserRuID')+'&baseUrl='+window.location.href);
    }


    share.addEventListener('click',function () {
        loadXMLDoc()
        // txt.innerText = window.location.href;
        // txt.select();
        // document.execCommand("copy");
        // alert("复制成功");
        // ptestCopy();
    });

    // function ptestCopy() {
    //     ptext.innerText = window.location.href
    //     alert(ptext.innerText)
    //     const range = document.createRange();
    //     range.selectNode(ptext);
    //
    //     const selection = window.getSelection();
    //     if(selection.rangeCount > 0) selection.removeAllRanges();
    //     selection.addRange(range);
    //
    //
    //     document.execCommand("copy");
    //     alert("推广链接已复制成功,快粘贴分享给好友！");
    //
    // }


    document.getElementsByTagName('body');
    document.body.appendChild(share);
    // document.body.appendChild(txt);
    document.body.appendChild(ptext);
}


console.log(document.getElementsByTagName("script"))
var jss = document.getElementsByTagName("script");

jss.forEach(function (obj) {
    console.log(obj.getAttribute("src"))
})
