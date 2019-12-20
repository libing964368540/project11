//$.ajaxSetup ({ 
//  cache: false //关闭AJAX相应的缓存 
//});
$('.tabbar').load('tabbar.html');
$('#orderList').height("calc(" + window.innerHeight + "px - 3.1rem)")

// 选择状态
var type = 1
$('.head_nav > div').click(function () {
  $(this).addClass('choosedNav').siblings().removeClass('choosedNav')
  switch ($(this)[0].id) {
    case "all":
      //全部
      type = 0
      isUseCahe();
      break;
    case "unpaid":
      //待处理
      type = 1
      isUseCahe();
      break;
    case "illegal":
      // 进行中
      window.location.href = allAjaxUrl.H5_orderDetail+"?isleased=1";
      break;
    default:
      break;
  }
})

function getRentList(data) {
  var orderRow = {}
  orderRow.data = data
  var html = template('orderList_at', orderRow);
  document.getElementById('orderList').innerHTML = html;
}

//  数据
// $('.spinner').css('display', 'none')
$('.mask_spinner').css('display', 'none')
//登录
//判断登录状态
var token = localStorage.getItem(localCache + 'token')
var LoginTime = localStorage.getItem(localCache + 'LoginTime')
if (token != null && token != '' && LoginTime != null && LoginTime != '') {
  //判断是过期 3天
  var time = 60 * 60 * 24 * 3 - (Date.parse(new Date()) / 1000 - LoginTime)
  if (time <= 0) {
    //过期 跳转登录
    window.location.href = allAjaxUrl.H5_login;
  } else {
    if(getParam("type") == "0"){
      // 全部
      $("#illegal").removeClass("choosedNav");
      $("#unpaid").removeClass("choosedNav");
      $("#all").addClass("choosedNav");
      type = 0;
    }else if(getParam("type") == "1"){
      $("#illegal").removeClass("choosedNav");
      $("#all").removeClass("choosedNav");
      $("#unpaid").addClass("choosedNav");
      type = 1;
    }
    isUseCahe();
  }
} else {
  //未登录 跳转登录
  window.location.href = allAjaxUrl.H5_login;
}

//是否使用缓存
function isUseCahe() {
  var MyLeaseRentData = localStorage.getItem(localCache + 'MyLeaseRentData-' + type)
  var MyLeaseRentDataTime = localStorage.getItem(localCache + 'MyLeaseRentDataTime-' + type)
  //已经登录 稀有皮肤英雄列表 本地实际一天 默认推荐一天
  if (MyLeaseRentData != null && MyLeaseRentData != '' && MyLeaseRentDataTime != null && MyLeaseRentDataTime != '') {
    //判断是过期 1min
    var DSTime = 60 - (Date.parse(new Date()) / 1000 - MyLeaseRentDataTime)
    if (DSTime <= 0) {
      //过期 拉取默认推荐数据
      getRentData();
    } else {
      //使用本地
      DataHandle();
    }
  } else {
    //拉取默认推荐数据
    getRentData();
  }
}

// 拉取随机账号数据并保证本地已经操作时间
function getRentData() {
  // $('.spinner').css('display', '')
  $('.mask_spinner').css('display', '')
  $.ajax({
    url: allAjaxUrl.rentMyLease,
    type: 'POST',
    data: {
      token: token,
      type: type
    },
    success: function (res) {
      // $('.spinner').css('display', 'none')
      $('.mask_spinner').css('display', 'none')
      //var res=JSON.parse(res)
      console.log(res)
      if (res == null || res == undefined) {
        //无数据
        console.log(" 无数据 ");
      } else {

        if (res.dataCode == 1) {
          localStorage.setItem(localCache + 'MyLeaseRentData-' + type, res.data)
          localStorage.setItem(localCache + 'MyLeaseRentDataTime-' + type, Date.parse(new Date()) / 1000);
          DataHandle();
          // console.log(res.data);
        } else {
          alert(res.message)
        }

      }
    },
    error: function () {
      // $('.spinner').css('display', 'none')
      $('.mask_spinner').css('display', 'none')
      alert('网络异常 请稍后重试！')
    }
  })
}

//数据处理
function DataHandle() {
  var MyLeaseRentData = localStorage.getItem(localCache + 'MyLeaseRentData-' + type);
  if (MyLeaseRentData == null || MyLeaseRentData == "null" || MyLeaseRentData == "undefined" || MyLeaseRentData == "") {
    alert("暂无订单");
    return;
  }
  RentList = JSON.parse(MyLeaseRentData);
  // console.log("使用本地缓存 ",MyLeaseRentData);
  //当前值 下标 ...
  RentList.forEach(function (val, index, arr) {
    //价格
    if (val.hourPrice % 1 === 0) {
      val.hourPrice = val.hourPrice / 100;
    } else {
      val.hourPrice = ""
    }
    //段位
    var isdan;
    switch (val.dan) {
      case 1: isdan = '倔强青铜'; break;
      case 2: isdan = '秩序白银'; break;
      case 3: isdan = '荣耀黄金'; break;
      case 4: isdan = '尊贵铂金'; break;
      case 5: isdan = '永恒钻石'; break;
      case 6: isdan = '至尊星耀'; break;
      case 7: isdan = '最强王者'; break;
      case 8: isdan = '荣耀王者'; break;
      default: break;
    }
    val.dan = isdan;
    //等级
    if (val.gameGrade % 1 === 0) {
    } else {
      val.gameGrade = "暂无"
    }
    //起始时间
    if (val.starttime) {
      val.starttimeStr = P_formatDateTime(val.starttime.time);
    } else {
      val.starttimeStr = ' ';
    }
    //结束时间
    if (val.endtime) {
      val.endtimeStr = P_formatDateTime(val.endtime.time);
    } else {
      val.endtimeStr = ' ';
    }
    val.totalPrice = (val.totalPrice / 100).toFixed(2)
    val.penalty = (val.penalty / 100).toFixed(2)
    //时长
    if (val.ulStart == 1) {
      val.ulStartStr = "租赁中";
      if (val.starttime) {
        val.duration = timeFn(val.starttime.time, new Date().getTime());
      }
      //总价
      val.totalPrice = timeHoursFn(val.starttime.time) * val.hourPrice * 100;
    } else if (val.ulStart == 2) {
      val.ulStartStr = "待支付";
      // if (val.starttime && val.endtime) {}
      val.duration = val.duration+"小时";
    } else if (val.ulStart == 3) {
      val.ulStartStr = "已完成";
      val.duration = val.duration+"小时";
    } else if (val.ulStart == 4) {
      val.ulStartStr = "已退款";
      val.duration = val.duration+"小时";
    } else if (val.ulStart == 5) {
      val.ulStartStr = "已取消";
      val.duration = val.duration+"小时";
      val.totalPrice = 0;
    } else if (val.ulStart == 6) {
      val.ulStartStr = "已违规";
      val.duration = val.duration+"小时";
    } else if (val.ulStart == 7) {
      val.ulStartStr = "已罚款";
      val.duration = val.duration+"小时";
    } else {
      val.ulStartStr = "未知状态";
      if (val.starttime) {
        val.duration = timeFn(val.starttime.time, new Date().getTime());
      }
    }
    //列表分类
    val.type = type;
    // console.log(val);
  });
  //页面渲染
  getRentList(RentList);
  console.log(RentList);
}

function timeFn(d1, d2) {
  var dateDiff = d2 - d1;//时间差的毫秒数
  var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
  var leave1 = dateDiff % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
  var hours = Math.floor(leave1 / (3600 * 1000))//计算出小时数
  //计算相差分钟数
  var leave2 = leave1 % (3600 * 1000)    //计算小时数后剩余的毫秒数
  var minutes = Math.floor(leave2 / (60 * 1000))//计算相差分钟数
  //计算相差秒数
  var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
  var seconds = Math.round(leave3 / 1000)
  // if (hours>99) {
  //   console.log(" 99:59:59")
  //   return "99:59:59";
  // }
  if (hours < 10)
    hours = "0" + hours;
  if (minutes < 10)
    minutes = "0" + minutes;
  if (seconds < 10)
    seconds = "0" + seconds;
  // console.log(" 相差 "+dayDiff+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒")
  if (dayDiff >= 1) {
    return dayDiff + "天" + hours + "时" + minutes + "分";
  }
  return hours + "时" + minutes + "分";
}

function P_formatDateTime(inputTime) {
  var date = new Date(inputTime);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return ' ' + d + '/' + m +'  ' + h + ':' + minute;
  // y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
};

function timeHoursFn(d1) {
  var dateEnd = new Date();//获取当前时间
  var dateDiff = dateEnd.getTime() - d1;//时间差的毫秒数
  var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
  var leave1 = dateDiff % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
  var hours = Math.floor(leave1 / (3600 * 1000))//计算出小时数
  //计算相差分钟数
  var leave2 = leave1 % (3600 * 1000)    //计算小时数后剩余的毫秒数
  var minutes = Math.floor(leave2 / (60 * 1000))//计算相差分钟数
  //计算相差秒数
  var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
  if (minutes > 1)
    hours++;

  console.log(hours)
  if (dayDiff >= 1) {
    hours += dayDiff * 24;
  }
  return hours;
}

//账号详情点击 使用本地存储 ep_h5_MyLeaseRentData
function rentDetails(leaseId, dataI, type, ulStart) {
  if (ulStart == 1) {
    //租赁中
  window.location.href = allAjaxUrl.H5_orderDetail + "?leaseId=" + leaseId + "&dataI=" + dataI + "&type=" + type + "&isleased=1";
  } else if(ulStart == 2){
    window.location.href = allAjaxUrl.H5_orderDetail + "?leaseId=" + leaseId + "&dataI=" + dataI + "&type=" + type;
  }else if(ulStart == 6){
    window.location.href = allAjaxUrl.H5_orderDetail + "?leaseId=" + leaseId + "&dataI=" + dataI + "&type=" + type;
  }else{

  }
}