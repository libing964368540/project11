var pageNum = 1;
var pageSize = 10;
var token = localStorage.getItem(localCache + 'token');
var LoginTime = localStorage.getItem(localCache + 'LoginTime');
// 余额
var UserBan = localStorage.getItem(localCache + 'UserBan');
// =========
$('#rentDom').height("calc(" + window.innerHeight + "px - 6rem)");

if (token != null && token != '' && LoginTime != null && LoginTime != '') {
  //判断是过期 3天
  var time = 60 * 60 * 24 * 3 - (Date.parse(new Date()) / 1000 - LoginTime)
  if (time <= 0) {
      //过期 跳转登录
      isLogin = false
      flag_updateHeroSkin = false; //全局 更新标记修改
      window.location.href = allAjaxUrl.H5_login;
  } else {
    getRentData(1);
    // 余额更新
    $.ajax({
      url: allAjaxUrl.getUserBan,
      type: 'POST',
      data: {
          token: token,
      },
      success:function(UserDeRes){
          if(UserDeRes.dataCode == 1){
              if(UserDeRes.data == null){
                  localStorage.setItem(localCache + 'UserBan', 0);
                  UserBan = 0;
              }else{
                  localStorage.setItem(localCache + 'UserBan', UserDeRes.data);
                  UserBan = UserDeRes.data;
              }
              // 余额
              $('.sum_all').text((UserBan / 100 * 1).toFixed(2))
          }
      },error:function () {
      }
  })
  }
} else {
  //未登录 跳转登录
  isLogin = false
  flag_updateHeroSkin = false; //全局 更新标记修改
  window.location.href = allAjaxUrl.H5_login;
}


function getRentData(curPageNum){
  pageNum = curPageNum;
  $.ajax({
    url: allAjaxUrl.BalanceListToUser,
    type: 'POST',
    data: {
      token: token,
      pageNum: pageNum,
      pageSize: pageSize
    },
    success: function (res) {
      if (res == null || res == undefined) {
        //无数据
        console.log(" 无数据 ");
      } else {
        if (res.dataCode == 1) {
          var Temp = JSON.parse(res.data)[0].value
          //分页总条数
          var Count = JSON.parse(res.data)[1].value
          if (pageNum != 1) {
            //下拉加载
            var BalanceData = localStorage.getItem(localCache + 'BalanceData');
            SearchRentList = JSON.parse(BalanceData);
            Temp.forEach(function (i) {
              SearchRentList.push(i)
            })
            Temp = SearchRentList;
          } else {
            //第一次提示 段位不限也不提示
            // 返回顶部
            $("#rentDom").scrollTop(0);
          }
          localStorage.setItem(localCache + 'BalanceData', JSON.stringify(Temp));
          localStorage.setItem(localCache + 'BalanceCount', Count);
  
          console.log(Temp);
          DataHandle();
        } else {
          alert(res.message);
        }
      }
    },
    error: function () {
      // $('.spinner').css('display', 'none')
      // $('.mask_spinner').css('display', 'none')
      alert('网络异常 请稍后重试！');
    }
  })
}


//本地数据渲染
function DataHandle() {
  BalanceData = localStorage.getItem(localCache + 'BalanceData');
  if (BalanceData == null) {
    console.log(" == BalanceData 无数据 异常 ")
    return;
  }
 // console.log(HsHeroSkinJSON)
  //当前值 下标 ...
  BalanceData = JSON.parse(BalanceData);
  BalanceData.forEach(function (val, index, arr) {
    val.balancetime = P_formatDateTime(val.SLEDate.time);
  });
  console.log(BalanceData)
  var balanceHtml = {};
  balanceHtml.data = BalanceData;
  var html = template('rent_at', balanceHtml);
  document.getElementById('rentDom').innerHTML = html;
  // 余额
  $('.sum_all').text((UserBan / 100 * 1).toFixed(2))
}

//下拉加载 翻页
function rentScroll(e) {
  //单条高度
  var rowheight = $("#rentDom").children(".rowList:first").height()
  //显示内容高度
  var showHeight = $("#rentDom").height();
  //元素滚动条内的内容高度 e.scrollHeight
  //元素滚动条内的顶部隐藏部分的高度  e.scrollTop
  // console.log((e.scrollHeight - showHeight - e.scrollTop))
  if (rowheight >= e.scrollHeight - showHeight - e.scrollTop) {
    var Count = localStorage.getItem(localCache + 'BalanceCount')
    console.log(pageNum * pageSize <= Count, pageNum, pageSize, Count)
    pageNum++;
    if ((pageNum - 1) * pageSize <= Count && pageNum < Count) {
      getRentData(pageNum);
    }
  }
}

//时间格式
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
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
};