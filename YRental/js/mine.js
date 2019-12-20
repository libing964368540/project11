$('.tabbar').load('tabbar.html');

//我的页面显示用登录手机号
var loginPhone = localStorage.getItem(localCache+'ShowPhone');
console.log(loginPhone);
$("#showPhone").html(loginPhone)

// 账户余额
function sum(){
    console.log("余额");
    window.location.href = allAjaxUrl.H5_balance;
}
//租号
function ePublish(){
    console.log("租号");
    window.location.href = "https://multi.1daichong.com/e_publish/html/";
}

//客服
function kefu() {
    console.log("客服");
    window.location.href = "http://m.tb.cn/x.eOGaPF";
}

//处罚标准
function viUrl() {
    console.log("处罚标准");
    window.location.href = "https://t.alipayobjects.com/images/partner/TB1wmB.a3OJDuNjme6jO06elpXa.html";
}

// 退出登录
function exitLogin(){
    console.log("退出登录");
    localStorage.removeItem(localCache+'token');
    window.location.href = allAjaxUrl.H5_login;
}