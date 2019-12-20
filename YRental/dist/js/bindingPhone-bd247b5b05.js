
$('.confirm').attr('disabled', false)//加载时登录按钮可点击
if(getParam("Pop") == "1"){
  // 弹窗
  // 等待修改 ========================
  var urlls = window.location.search;
  var PromptCon = urlls.split("Pop=1&PromptCon=")[1]
  if (PromptCon != null) {
    // alert(decodeURI(PromptCon))
    // 弹窗
  $('.exit_mask').css('display','block');
  $('#loginFailed').text(decodeURI(PromptCon));
  } 
}
// 弹窗确定
$(".exit").click(function(){
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

//确定绑定
$('.confirm').click(function () {
  $('.confirm').attr('disabled', true)
  var phone = $('.phone').val()
  var verCode = $('.verCode').val()
  if (phone == '') {
    alert('请输入手机号')
    $('.confirm').attr('disabled', false)
  } else if (!(/^1[34578]\d{9}$/.test(phone))) {
    alert('请输入正确的手机号')
    $('.confirm').attr('disabled', false)
  } else if (verCode == '') {
    alert('请输入验证码')
    $('.confirm').attr('disabled', false)
  } else {
    // 直接登录 登录中已经效验 重复
    verSms(phone,verCode)
    // loginFz(phone,verCode)
  }
})
//验证码校验
function verSms(phone,sendCode) {
  $.ajax({
    url: allAjaxUrl.verSms,
    type: 'POST',
    data: {
      phone: String(phone),
      sendCode: String(sendCode)
    },
    success: function (res) {
      var res = JSON.parse(res)
      if (res.dataCode == 1) {
        loginFz(phone,sendCode)
      } else {
        alert(res.mes)
        $('.confirm').attr('disabled', false)
      }
    },
    error: function () {
      alert('网络超时，请稍后重试！')
      $('.confirm').attr('disabled', false)
    }
  })
}

//登录封装  
var aliLoginStop=true;
function loginFz(phone,sendCode) {
  if(!aliLoginStop)
    return
    aliLoginStop=false
  window.location.href = "https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2019070265733439&scope=auth_user&redirect_uri=https%3A%2F%2Fmulti.1daichong.com%2Feva%2FTP%2FaliAuth&state=" + sendCode + "@"+ phone;
}
// 423DC9647FFFE623BA947F748C829CE224130F16D379495A
// localStorage.setItem(localCache+'phone','18267006852')
// localStorage.setItem(localCache+'token','423DC9647FFFE623BA947F748C829CE224130F16D379495A')
