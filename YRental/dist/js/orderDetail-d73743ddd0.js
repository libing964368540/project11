$('.tabbar').load('tabbar.html');
$('.wrapper').css('height', "calc(100vh-1.2rem)")
// $('.wrapper').css('height', "calc(100vh)")
// $('.shade').height("calc("+window.innerHeight+"px )")

// 选择状态
$('.head_nav > div').click(function () {
    $(this).addClass('choosedNav').siblings().removeClass('choosedNav')
    switch ($(this)[0].id) {
        case "all":
            //全部
            window.location.href = allAjaxUrl.H5_order + "?type=0";
            break;
        case "unpaid":
            //待处理
            window.location.href = allAjaxUrl.H5_order + "?type=1";
            break;
        case "illegal":
            // 进行中
            window.location.href = allAjaxUrl.H5_orderDetail + "?isleased=1";
            break;
        default:
            break;
    }
})

//
function getAccount(data) {
    var rentRow = {}
    rentRow.data = data
    var html = template('rentTem', rentRow);
    document.getElementById('orderDetailDom').innerHTML = html;
}

//点击遮罩关闭
$('.shade').click(function () {
    $('.illegal').height(0)
    $('.order_pay').height(0)
    $('.shade').height(0)
})
//判断登录状态
var token = localStorage.getItem(localCache + 'token')
var LoginTime = localStorage.getItem(localCache + 'LoginTime')
// 租赁中账号拉取间隔1M
var LeasingRentTime = localStorage.getItem(localCache + 'LeasingRentTime')
var LeasingRentData = localStorage.getItem(localCache + 'LeasingRentData')
var starttimestamp = 0;
//数据原价
var hourPrice = 0;
//租赁订单id
var leasedID = null;
//当前环境
viType = 0;
wx.miniProgram.getEnv(function (res) {
    if (res.miniprogram) {
        //小程序
        viType = 1;
    } else {
        //其他浏览器包含微信浏览器
    }
})

if (token != null && token != '' && LoginTime != null && LoginTime != '') {
    //判断是过期 3天
    var time = 60 * 60 * 24 * 3 - (Date.parse(new Date()) / 1000 - LoginTime)
    if (time <= 0) {
        //过期 跳转登录
        window.location.href = allAjaxUrl.H5_login;
    } else {
        //已经登录
    }
} else {
    //未登录 跳转登录
    window.location.href = allAjaxUrl.H5_login;
}
// 1 租赁中 其他列表
var isleased = getParam("isleased");
// 判断是否租赁成功
var paySuccess = getParam("paySuccess");
if (paySuccess == 1) {
    //租赁成功显示页面成功跳转 租赁中订单 
    $('#m-toast-inner-text').text('租赁成功');
    $('#m-toast-pop').fadeIn();
    setTimeout(function () {
        $('#m-toast-pop').fadeOut();
        window.location.href = allAjaxUrl.H5_orderDetail + "?isleased=1";
    }, 3000);

} else {
    if (isleased == 1) {
        // 租赁中的订单
        if (LeasingRentData != null && LeasingRentData != "" && LeasingRentTime != null && LeasingRentTime != '') {
            var time = 60 - (Date.parse(new Date()) / 1000 - LeasingRentTime)
            if (time <= 0) {
                //拉取
                getLeasingRentData();
            } else {
                //使用本地缓存
                localLeasingRentData();
                $(".threeSBg").css("display", "none");
                $(".threeSFrame").css("display", "none");
                $("body").css("display", "");
            }
        } else {
            //拉取
            getLeasingRentData();
        }
    } else {
        //使用订单列表 的数据
        //列表数据类型
        var type = getParam("type");
        var leaseId = getParam("leaseId");
        var dataI = getParam("dataI");      // 缓存中的下标
        var MyLeaseRentData = localStorage.getItem(localCache + 'MyLeaseRentData-' + type)
        if (MyLeaseRentData == null || MyLeaseRentData == "") {
            window.location.href = allAjaxUrl.H5_order;   //无数据去列表
        } else {
            MyLeaseRentData = JSON.parse(MyLeaseRentData);
            //当前值 下标 ...
            var val = MyLeaseRentData[dataI];
            if (val != null && val != "" && MyLeaseRentData[dataI].id == leaseId) {
                // console.log(val);
                localLeasingRentData(val)
            } else {
                alert("数据异常");
                window.location.href = allAjaxUrl.H5_Search;
            }
        }
    }

}

// 拉取数据并保证本地已经操作时间
function getLeasingRentData() {
    $.ajax({
        url: allAjaxUrl.rentByLease,
        type: 'POST',
        data: {
            token: token
        },
        success: function (res) {
            //var res=JSON.parse(res)
            console.log(res)
            if (res == null || res == undefined) {
                //无数据
                console.log(" 无数据 ");
            } else {
                if (res.dataCode == 1) {
                    localStorage.setItem(localCache + 'LeasingRentData', JSON.stringify(res.data))
                    localStorage.setItem(localCache + 'LeasingRentTime', Date.parse(new Date()) / 1000)
                    localLeasingRentData();
                    console.log(res.data);
                } else if (res.dataCode == 1001) {
                    //过期 跳转登录
                    window.location.href = allAjaxUrl.H5_login;
                } else {
                    alert(res.message)
                }

            }
        },
        error: function () {
            alert('网络异常 请稍后重试！')
        }
    })
}

// 使用本地缓存
function localLeasingRentData(Ldata) {
    var DataType;//数据类型
    if (Ldata) {
        //列表进入
        DataType = 0;//列表
        var LeasingRentData = Ldata;
    } else {
        DataType = 1;//租赁中
        var LeasingRentData = localStorage.getItem(localCache + 'LeasingRentData');
        LeasingRentData = JSON.parse(LeasingRentData);
    }
    if (LeasingRentData.accountType == 0) {
        LeasingRentData.gameTypeStr = "王者荣耀";
        LeasingRentData.accountTypeStr = 'QQ账号';        //写死
        switch (LeasingRentData.gameArea) {
            case '0': LeasingRentData.gameSysStr = '苹果系统'; break;
            case '1': LeasingRentData.gameSysStr = '安卓系统'; break;
            default: LeasingRentData.gameSysStr = ''; break;
        }
        switch (LeasingRentData.isqualify) {
            case '0': LeasingRentData.qualifyStr = '可排位'; break;
            case '1': LeasingRentData.qualifyStr = '不可排位'; break;
            default: LeasingRentData.qualifyStr = ''; break;
        }
    } else if (accountType == 1) {
        LeasingRentData.gameTypeStr = "绝地求生";
    } else if (accountType == 2) {
        LeasingRentData.gameTypeStr = "网易UU加速器";
    } else if (accountType == 3) {
        LeasingRentData.gameTypeStr = "腾讯视频Vip";
    } else if (accountType == 4) {
        LeasingRentData.gameTypeStr = "腾讯NBA会员";
    } else if (accountType == 5) {
        LeasingRentData.gameTypeStr = "优酷会员";
    } else if (accountType == 6) {
        LeasingRentData.gameTypeStr = "英雄联盟";
    }

    leasedID = LeasingRentData.id;
    if (DataType == 1) {
        //租赁中
        starttimestamp = LeasingRentData.starttimestamp;
        var endTimestamp = LeasingRentData.endtimestamp;
    } else {
        //列表
        starttimestamp = LeasingRentData.starttime.time;
        var endTimestamp = 0;
        if (LeasingRentData.endtime) {
            endTimestamp = LeasingRentData.endtime.time
        }
    }
    if (LeasingRentData.ulStart == 1) {
        hourPrice = LeasingRentData.hourPrice;
        //已租时长
        //LeasingRentData.diffTime = timeFn(starttimestamp);
        // 租赁中价格
        LeasingRentData.ShowPrice = ((LeasingRentData.totalPrice - LeasingRentData.lDeposit) / 100).toFixed(2);
        // if (LeasingRentData.ShowPrice == 0) {
        //     LeasingRentData.ShowPrice = (hourPrice / 100).toFixed(2);
        // }
        //
        // if (LeasingRentData.ShowPrice < 5) {
        //     LeasingRentData.ShowPrice = 5;
        // }
    }else if(LeasingRentData.ulStart == 6){
        hourPrice = LeasingRentData.hourPrice;
        LeasingRentData.ShowPrice = ((LeasingRentData.totalPrice - LeasingRentData.lDeposit) / 100).toFixed(2);
    } else if (LeasingRentData.ulStart == 5) {
        //金额显示 0
        LeasingRentData.ShowPrice = 0;
    } else {
        //已租时长
        //LeasingRentData.diffTime = LeasingRentData.duration + "小时";
        LeasingRentData.ShowPrice = ((LeasingRentData.totalPrice - LeasingRentData.lDeposit) / 100).toFixed(2);
    }
    //开始时间
    LeasingRentData.showStartTime = P_formatDateTime(starttimestamp);
    //结束时间
    // console.log(endTimestamp)
    LeasingRentData.showEndTime = P_formatDateTime(endTimestamp);
    //违规金额
    LeasingRentData.penalty = (LeasingRentData.penalty / 100).toFixed(2);
    //小时单价显示 已经运算完 不担当运算参数
    LeasingRentData.hourPrice = (LeasingRentData.hourPrice / 100).toFixed(2);
    LeasingRentData.lDayPrice = (LeasingRentData.lDayPrice / 100).toFixed(2);
    LeasingRentData.lWeekPrice = (LeasingRentData.lWeekPrice / 100).toFixed(2);


    //游戏皮肤数据
    var heroidIndex, t_heroNumber = 0;
    var skinidIndex, t_skinNumber = 0;
    var AllHeroSkinData = localStorage.getItem(localCache + 'AllHeroSkinData');
    if (AllHeroSkinData == null) {
        console.log(" 缺少数据 英雄皮肤 取消渲染");
    } else {
        // console.log(JSON.parse(AllHeroSkinData))
        JSON.parse(AllHeroSkinData).forEach(function (val) {
            if (heroidIndex != val.heroId) {
                heroidIndex = val.heroId;
                ++t_heroNumber;
            }
            if (skinidIndex != val.skinId) {
                skinidIndex = val.skinId;
                ++t_skinNumber;
            }
        });
    }
    //英雄皮肤数量占比
    LeasingRentData.heronumberShow = Math.floor(LeasingRentData.heronumber / t_heroNumber * 100)
    if (LeasingRentData.heronumberShow > 100)
        LeasingRentData.heronumberShow = 100;
    LeasingRentData.skinnubmerShow = Math.floor(LeasingRentData.skinnubmer / t_skinNumber * 100)
    if (LeasingRentData.skinnubmerShow > 100)
        LeasingRentData.skinnubmerShow = 100;

    if (LeasingRentData.viImg && LeasingRentData.viImg != "") {
        LeasingRentData.viImg = LeasingRentData.viImg.split(',')
    }
    console.log(LeasingRentData);  
    console.log(" ", LeasingRentData);
    //加载内容
    getAccount(LeasingRentData);
    //订单状态租号中 显示账号详情
    if (LeasingRentData.ulStart == 1) {
        $('.account_detail').show()
    } else {
        $('.account_detail').hide()
    }
    //showType
    showType(LeasingRentData);

    //长按 显示密码
    $(".viewPassword").on({
        touchstart: function (e) {
            // $("#text").html( $("#text").html()+ " touchstart ")
            e.preventDefault();
            //
            $("#password1").css("display", "none")
            $("#password2").css("display", "")
        },
        touchmove: function () {
            // $("#text").html( $("#text").html()+ "touchmove")
        },
        touchend: function () {
            // $("#text").html( $("#text").html()+ " touchend ")
            $("#password1").css("display", "")
            $("#password2").css("display", "none")
        }
    })
    if (isleased == 1) {
        //拉取待处理数据 是否显示小红点
        OrderListisUseCahe();
    }
}

// 区分显示
function showType(LeasingRentData) {
    if (LeasingRentData.ulStart == 1) {
        $('.head_type').text('租赁中')
        // $('.head_tip').text('已用时：' + LeasingRentData.diffTime)
        // $('.wrapper').css('background', 'linear-gradient(to bottom, #20cfca,#20cfca)')
        // $('.gradualChange').css('background', 'linear-gradient(to right, #d0ebff, #ecfffd)')
        $('.head').css('color', '#8c8c8c')
        $('.problem').css('display', '')
        $('.service').attr('onclick', 'weiquan()')
        $('.service').text('售后维权')
        $('.orderTime').hide();
        $('.overTime').show()
        $('.orderDetail_btn').hide();
        // $('.ordetPrice').css('border', 'none')
        // $('.head_tip').css('color', '#8c8c8c')
        $('.orderDetail_btn').hide()
        // $('.orderDetail_btn').css('{background:#ff4538;color:#ffffff;border-color:#ff4538}')
        $('.orderDetail_btn_text').text('结束租赁')
        $('.row_rent').removeClass('state_gray')
        //按钮事件
        // $(".orderDetail_btn").attr("onclick", "showOrderPay()")
        //按钮点击显示
        $(".orderDetail_btn").click(function () {
            $('.exit_mask').height("calc(" + window.innerHeight + "px )")
            $('.exit_mask').show();
        })
        $('.exit').click(function () {
            $('.exit_mask').hide();
        })
        $('.goon').click(function () {
            $('.exit_mask').hide();
            // $('.shade').height("calc(" + window.innerHeight + "px )")
            // $('.order_pay').height('auto')
            // $('.order_pay').css('transition', 'all 0.1s linear')

        })

    } else if (LeasingRentData.ulStart == 2) {
        $('.head_type').text('待支付')
        $('#illegal').removeClass('choosedNav');
        $('#unpaid').addClass('choosedNav');
        $('.head_type').css('color', '#ff4538');
        $('.orderTime').hide();
        $('.overTime').show()
        $('.account_detail').show();
        $(".viewPassword").hide();
        // $('.head_tip').text('订单已完成，感谢您的使用')
        // $('.wrapper').css('background', 'linear-gradient(to bottom, #ffffff,#ffffff)')
        // $('.gradualChange').css('background', 'linear-gradient(to right, #d0ebff, #ecfffd)')
        $('.head').css('color', '#ff4538')
        $('.head_tip').css('color', '#999999')
        $('.orderDetail_btn').show()
        $('.service').attr('onclick', 'kefu()')
        $('.service').text('联系客服')
        // $('.orderDetail_btn').css('{background:#ff4538;color:#ffffff;border-color:#ff4538}')
        $('.orderDetail_btn_text').text('去支付')
        $('.row_rent').removeClass('state_gray')
        //按钮事件
        // $(".orderDetail_btn").attr("onclick", "showOrderPay()")
        // $(".orderDetail_btn").click(function () {
        $(".orderDetail_btn").attr("onclick", "endAndPay()")
        // $('.shade').height("calc(" + window.innerHeight + "px )")
        // $('.order_pay').height('auto')
        // $('.order_pay').css('transition', 'all 0.1s linear')
        // })
    } else if (LeasingRentData.ulStart == 3) {
        $('.head_type').text('已完成')
        // $('.head_tip').text('订单已完成，感谢您的使用')
        // $('.wrapper').css('background', 'linear-gradient(to bottom, #ffffff,#ffffff)')
        // $('.gradualChange').css('background', 'linear-gradient(to right, #d0ebff, #ecfffd)')
        $('.head').css('color', '#03bdb8')
        $('.head_tip').css('color', '#999999')
        $('.orderDetail_btn').hide()
        $('.overTime').show()
        $('.row_rent').removeClass('state_gray')
        $('.PayRentTradeNo').css('display', '')
    }
    else if (LeasingRentData.ulStart == 4) {
        $('.head_type').text('已退款')
        // $('.head_tip').text('订单已退款，感谢您的使用')
        // $('.wrapper').css('background', 'linear-gradient(to bottom, #ffffff,#ffffff)')
        // $('.gradualChange').css('background', 'linear-gradient(to right, #e6e6e6, #f5f5f5)')
        $('.head').css('color', '#666666')
        $('.head_tip').css('color', '#999999')
        $('.orderDetail_btn').hide()
        $('.overTime').show()
        $('.row_rent').addClass('state_gray')
    } else if (LeasingRentData.ulStart == 5) {
        $('.head_type').text('已取消')
        // $('.head_tip').text(LeasingRentData.cancelRemark)
        // $('.wrapper').css('background', 'linear-gradient(to bottom, #ffffff,#ffffff)')
        // $('.gradualChange').css('background', 'linear-gradient(to right, #e6e6e6, #f5f5f5)')
        $('.head').css('color', '#666666')
        $('.head_tip').css('color', '#999999')
        $('.orderDetail_btn').hide()
        $('.overTime').show()
        $('.row_rent').addClass('state_gray')
    } else if (LeasingRentData.ulStart == 6) {
        $('.head_type').text('违规待处理');
        $('#illegal').removeClass('choosedNav');
        $('#unpaid').addClass('choosedNav');
        $('.illegal').css('display', '')
        // $('.head_tip').text(LeasingRentData.viRemark)
        // $('.wrapper').css('background', 'linear-gradient(to bottom, #e6584e,#ffffff,#ffffff,#ffffff)')
        // $('.gradualChange').css('background', 'linear-gradient(to right, #e6e6e6, #f5f5f5)')
        $('.head_type').css('color', '#ff4538')
        $('.head').css('color', '#ffffff');
        $('.head_tip').css('color', '#ffffff');
        $('.orderDetail_btn').show();
        $('.orderTime').hide();
        $('#illegal').show();
        $('.penalty').css('border', 'none');
        // $('.orderDetail_btn').css({ 'background': '#ffffff', 'color': '#ff4538', 'border-color': '#ff4538' });
        $('.orderDetail_btn_text').text('立即付款');
        $('.overTime').show();
        $('.penalty').show();
        $('.service').attr('onclick', 'kefu()')
        $('.service').text('联系客服')
        // $('.row_rent').addClass('state_gray')
        //按钮事件
        // $(".orderDetail_btn").attr("onclick", "showIllegal()")
        // $(".orderDetail_btn").click(function () {
        $(".orderDetail_btn").attr("onclick", "ViPay()")
        // $('.shade').height("calc(" + window.innerHeight + "px )")
        // $('.order_pay').height('auto')
        // $('.order_pay').css('transition', 'all 0.1s linear')
        // })
    } else if (LeasingRentData.ulStart == 7) {
        $('.head_type').text('已罚款')
        // $('.head_tip').text(LeasingRentData.viRemark)
        // $('.wrapper').css('background', 'linear-gradient(to bottom, #e6584e,#ffffff,#ffffff,#ffffff)')
        // $('.gradualChange').css('background', 'linear-gradient(to right, #e6e6e6, #f5f5f5)')
        $('.head').css('color', '#ffffff')
        // $('.head_tip').css('color', '#ffffff')
        $('.orderDetail_btn').show()
        // $('.orderDetail_btn').css({ 'background': '#ffffff', 'color': '#999', 'border-color': '#999' })
        $('.orderDetail_btn_text').text('已处理')
        $('.overTime').show()
        $('.penalty').css('display', '')
        $('.rentTradeNo').css('display', '')
        $('.row_rent').addClass('state_gray')
    }
}

// 待处理显示小红点使用 拉取数据订单列表使用相同方法
//是否使用缓存
function OrderListisUseCahe() {
    //待处理
    var type = 1;
    var MyLeaseRentData = localStorage.getItem(localCache + 'MyLeaseRentData-' + type)
    var MyLeaseRentDataTime = localStorage.getItem(localCache + 'MyLeaseRentDataTime-' + type)
    //已经登录 稀有皮肤英雄列表 本地实际一天 默认推荐一天
    if (MyLeaseRentData != null && MyLeaseRentData != '' && MyLeaseRentDataTime != null && MyLeaseRentDataTime != '') {
        //判断是过期 1min
        var DSTime = 60 - (Date.parse(new Date()) / 1000 - MyLeaseRentDataTime)
        if (DSTime <= 0) {
            //过期 拉取默认推荐数据
            OrderListgetRentData();
        } else {
            //使用本地
            OrderRemind();
        }
    } else {
        //拉取默认推荐数据
        OrderListgetRentData();
    }
}

// 拉取随机账号数据并保证本地已经操作时间
function OrderListgetRentData() {
    //待处理
    var type = 1;
    $.ajax({
        url: allAjaxUrl.rentMyLease,
        type: 'POST',
        data: {
            token: token,
            type: type
        },
        success: function (res) {
            console.log(res)
            if (res == null || res == undefined) {
                //无数据
                console.log(" 无数据 ");
            } else {

                if (res.dataCode == 1) {
                    localStorage.setItem(localCache + 'MyLeaseRentData-' + type, res.data)
                    localStorage.setItem(localCache + 'MyLeaseRentDataTime-' + type, Date.parse(new Date()) / 1000);
                    OrderRemind();
                } else {
                    alert(res.message)
                }

            }
        },
        error: function () {
        }
    })
}

function OrderRemind() {
    //待处理
    var type = 1;
    var MyLeaseRentData = localStorage.getItem(localCache + 'MyLeaseRentData-' + type);
    if (MyLeaseRentData == null || MyLeaseRentData == "null" || MyLeaseRentData == "undefined" || MyLeaseRentData == "") {

        return;
    }
    RentList = JSON.parse(MyLeaseRentData);
    RentList.some(function (v) {
        if (v.id > 0) {
            //显示小红点
            $('.unpaid_dot').css('display', 'block');
            return true;
        }
    });
}

//按钮点击显示
// function showIllegal() {
//     $('.shade').height("calc(" + window.innerHeight + "px )")
//     $('.illegal').height('auto')
//     $('.illegal').css('transition', 'all 0.1s linear')
// }

function timeFn(d1) {
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
    if (dayDiff >= 1) {
        return dayDiff + "天" + hours + "小时" + minutes + "分钟";
    }
    //console.log(" 相差 "+dayDiff+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒")
    return hours + "小时" + minutes + "分钟";
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
    return ' ' + d + '/' + m + '  ' + h + ':' + minute;
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

    // console.log(hours)
    if (dayDiff >= 1) {
        hours += dayDiff * 24;
    }
    return hours;
}

//结束并支付
var endpayable = true;
function endAndPay() {
    if (endpayable) {
        endpayable = false;
        //清除缓存
        RemoveCache();
        $.ajax({
            url: allAjaxUrl.payRentAli,
            type: 'POST',
            data: {
                leasedID: leasedID
            },
            success: function (res) {
                console.log(res)
                $(document.body).html(res);
                endpayable = true;
            },
            error: function () {
                alert('网络异常 请稍后重试！')
                endpayable = true;
            }
        })
    } else {
        console.log("重复点击")
    }
}

//违规罚款
var vipayable = true;
function ViPay() {
    //清除缓存
    RemoveCache();
    if (viType == 1) {
        // 微信小程序
        wx.miniProgram.navigateTo({ url: '../pay/pay?token='+ token +'&accountID=' + leasedID + '&duration=1&LType=1&isVi=1' })
    } else {
        // 默认支付宝
        ViPayGo()
    }
}
// 默认支付宝
function ViPayGo() {
    if (vipayable) {
        vipayable = false;
        //清除缓存
        RemoveCache();
        $.ajax({
            url: allAjaxUrl.aliViPay,
            type: 'POST',
            data: {
                leasedID: leasedID,
                viType: 0
            },
            success: function (res) {
                console.log(res)
                if (res == null || res == undefined) {
                    //无数据
                    alert(" 请求失败 ");
                } else {
                    if (res.dataCode == 1) {
                        alert(res.message)
                    } else if (res.dataCode == 2) {
                        //准备支付
                        console.log(res.data)
                        $(document.body).html(res.data);
                    } else if (res.dataCode == 1001) {
                        //过期 跳转登录
                        window.location.href = allAjaxUrl.H5_login;
                    } else {
                        alert(res.message)
                    }
                }
                vipayable = true;
            },
            error: function () {
                alert('网络异常 请稍后重试！')
                vipayable = true;
            }
        })
    } else {
        console.log("重复点击")
    }
}

//清除账号列表 租赁中账号缓存
function RemoveCache() {
    //清除账号订单列表缓存
    localStorage.removeItem(localCache + 'MyLeaseRentData-0')
    localStorage.removeItem(localCache + 'MyLeaseRentData-1')
    localStorage.removeItem(localCache + 'MyLeaseRentData-2')
    //租赁中的账号
    localStorage.removeItem(localCache + 'LeasingRentData')
}


//维权
function weiquan() {
    console.log("维权");
    window.location.href = allAjaxUrl.H5_rightsProtection + '?lId=' + leasedID;
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

//显示违规大图
function showImg(imgUrl) {
    $('.vlImg > img').attr("src", imgUrl)
    $('.vlImg').show()
}

$('.vlImg').click(function () {
    $('.vlImg').hide()
})



// $(function () {
//     var u = navigator.userAgent, app = navigator.appVersion;
//     var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
//     var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
//     if (isAndroid) {
//         //安卓
//     }
//     if (isIOS) {
//         //这个是ios操作系统
//         // 隐藏复制
//         $("#copy-btn").css("display", "none");
//     }
// });

// var clipboard = new ClipboardJS('#copy-btn')
// // 显示用户反馈/捕获复制/剪切操作后选择的内容
// clipboard.on('success', function (e) {
//     console.info('Action:', e.action)//触发的动作/如：copy,cut等
//     console.info('Text:', e.text);//触发的文本
//     console.info('Trigger:', e.trigger);//触发的DOm元素
//     e.clearSelection();//清除选中样式（蓝色）
//     alert("复制成功")
// })
// clipboard.on('error', function (e) {
//     console.error('Action:', e.action);
//     console.error('Trigger:', e.trigger);
// });