
$('.login').attr('disabled', false)//加载时登录按钮可点击
if (getParam("login") == "1") {
  judgeFz(getParam("UserToken"), getParam("balance"), getParam("phone"));
}
else if (getParam("Pop") == "1") {
  var urlls = window.location.search;
  var PromptCon = urlls.split("Pop=1&PromptCon=")[1]
  if (PromptCon != null) {
    // alert(decodeURI(PromptCon))
    // 弹窗
    $('.exit_mask').css('display', 'block');
    $('#loginFailed').text(decodeURI(getParam("PromptCon")));
  }
}

// 确定
$(".exit").click(function () {
  window.location.href = window.location.pathname;
});
//判断60s倒计时是否结束
var sendTime = localStorage.getItem(localCache + 'sendTime') //发送验证码时的时间戳
if (sendTime != null) {
  var time = 60 - (Date.parse(new Date()) / 1000 - sendTime)
  if (time < 60) {
    $('.phone').val(localStorage.getItem(localCache + 'phone'))
    $('.getVerCode').attr('disabled', true)
    $('.getVerCode').html('已发送(' + time + ')')
    countDown()
  }
}
// 按钮获取验证码
$('.getVerCode').click(function () {
  var phone = $('.phone').val()
  if (phone == '') {
    alert('请输入手机号')
  } else if (!(/^1[34578]\d{9}$/.test(phone))) {
    alert('请输入正确的手机号')
  } else {
    $('.getVerCode').attr('disabled', true)
    localStorage.setItem(localCache + 'phone', phone)
    sendVerCode(phone)
  }
})
//倒计时封装
var timeDown
function countDown() {
  if (time >= 0) {
    time--
    timeDown = setTimeout(() => {
      $('.getVerCode').attr('disabled', true)
      $('.getVerCode').html('已发送(' + time + ')')
      countDown()
    }, 1000);
  } else {
    clearTimeout(timeDown)
    $('.getVerCode').attr('disabled', false)
    $('.getVerCode').html('获取验证码')
    localStorage.removeItem(localCache + 'sendTime')
  }
}
//获取验证码接口请求封装
function sendVerCode(phone) {
  $.ajax({
    url: allAjaxUrl.sendMsg,
    type: 'POST',
    data: {
      phone: String(phone)
    },
    success: function (res) {
      var res = JSON.parse(res)
      if (res.dataCode == 1) {
        localStorage.setItem(localCache + 'sendTime', Date.parse(new Date()) / 1000)
        sendTime = localStorage.getItem(localCache + 'sendTime')
        time = 60 - (Date.parse(new Date()) / 1000 - sendTime)
        $('.getVerCode').html('已发送(' + time + ')')
        countDown()
        alert(res.mes)
      } else {
        alert(res.mes)
        $('.getVerCode').attr('disabled', false)
      }
    },
    error: function () {
      alert('网络超时，请稍后重试！')
      $('.getVerCode').attr('disabled', false)
    }
  })
}

//登录
$('.login').click(function () {
  $('.login').attr('disabled', true)
  var phone = $('.phone').val()
  var verCode = $('.verCode').val()
  if (phone == '') {
    alert('请输入手机号')
    $('.login').attr('disabled', false)
  } else if (!(/^1[34578]\d{9}$/.test(phone))) {
    alert('请输入正确的手机号')
    $('.login').attr('disabled', false)
  } else if (verCode == '') {
    alert('请输入验证码')
    $('.login').attr('disabled', false)
  } else {
    // 直接登录 登录中已经效验 重复
    verSms(verCode)
  }
})
//验证码校验
function verSms(sendCode) {
  $.ajax({
    url: allAjaxUrl.verSms,
    type: 'POST',
    data: {
      phone: String($('.phone').val()),
      sendCode: String(sendCode)
    },
    success: function (res) {
      var res = JSON.parse(res);
      if (res.dataCode == 1) {
        loginFz(sendCode);
      } else {
        alert(res.mes);
        $('.login').attr('disabled', false);
      }
    },
    error: function () {
      alert('网络超时，请稍后重试！');
      $('.login').attr('disabled', false);
    }
  })
}


//登录封装  
function loginFz(sendCode) {
  $.ajax({
    url: allAjaxUrl.loginSms,
    type: 'POST',
    data: {
      phone: String($('.phone').val()),
      sendCode: String(sendCode),
      //身份 传 0 号主 1 租客
      type: "1"
    },
    success: function (res) {
      var res = JSON.parse(res)
      if (res.dataCode == 1) {
          $.ajax({
              url:allAjaxUrl.getUserInfo,
              data:{
                  token:res.data[0].UserToken
              },
              type:'post',
              success:function (resdata) {
                  var resdata = JSON.parse(resdata);
                  if(resdata.dataCode == 1){
                      judgeFz(res.data[0].UserToken, res.data[0].balance, null,);
                      localStorage.setItem(localCache + 'UserRuID', resdata.data[0].ruId);
                      window.location.href = allAjaxUrl.H5_Search;
                  }else{
                      alert(resdata.mes);
                  }
              },
              error: function () {
                  alert('网络超时，请稍后重试！');
                  $('.login').attr('disabled', false);
              }
          })
      } else {
        alert(res.mes);
        $('.login').attr('disabled', false);
      }
    },
    error: function () {
      alert('网络超时，请稍后重试！');
      $('.login').attr('disabled', false);
    }
  })
}
// 423DC9647FFFE623BA947F748C829CE224130F16D379495A
// localStorage.setItem(localCache+'phone','18267006852')
// localStorage.setItem(localCache+'token','423DC9647FFFE623BA947F748C829CE224130F16D379495A')


function judgeFz(UserToken, balance, phone) {


  // 用户余额
  if (balance == null)
    balance = 0;
  localStorage.setItem(localCache + 'userBalance', balance);

  if (phone == null)
    phone = $('.phone').val()

  localStorage.setItem(localCache + 'token', UserToken);
  localStorage.setItem(localCache + 'phone', phone);
  localStorage.setItem(localCache + 'LoginTime', Date.parse(new Date()) / 1000);
  //我的页面显示用登录手机号
  localStorage.setItem(localCache + 'ShowPhone', phone);
  //清除账号订单列表缓存
  localStorage.removeItem(localCache + 'MyLeaseRentData-0');
  localStorage.removeItem(localCache + 'MyLeaseRentData-1');
  localStorage.removeItem(localCache + 'MyLeaseRentData-2');
  //租赁中的账号
  localStorage.removeItem(localCache + 'LeasingRentData');



}

