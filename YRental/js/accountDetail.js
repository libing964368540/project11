$('body').height(window.innerHeight + 'px')
$('.spinner').css('display', 'none')

// 文明租号约定  ========== SATRT
$('.rentAppoint').css("top", "calc((" + window.innerHeight + "px - 12.6rem)/2)")
// $('.rentAppoint').hide()

function rentAppoint(type) {
    if (type == 'show') {
        $('.rentAppoint').show()
    } else {
        $('.rentAppoint').hide()
    }

    $('.agree').click(function () {
        localStorage.setItem(localCache + 'rentAppoint', 'true')
        rentAppoint('hide')
        $('.shadow').hide()
        allowScroll()
    })

    $('.unAgree').click(function () {
        rentAppoint('hide')
        $('.shadow').hide()
        allowScroll()
    })

}
// 文明租号约定  ========== END

//英雄皮肤详情
function toHeroList() {
    window.location.href = './heroList.html'
}

//英雄皮肤
var HsHeroSkinJSON = {};        //皮肤英雄数据
var heroidIndex, t_heroNumber = 0;
var skinidIndex, t_skinNumber = 0;

//登录
//判断登录状态 待租状态才可以点击租号
var isRent = false;
var token = localStorage.getItem(localCache + 'token');
var LoginTime = localStorage.getItem(localCache + 'LoginTime');
var userBalance = localStorage.getItem(localCache + 'UserBan');
// 余额
var UserBan = localStorage.getItem(localCache + 'UserBan');
// 如果是2 租赁中过来 价格原价
var isSearch;
var accountID;
// 租号时长
var duration = 3;
// 租号类别
var LType = 0;
var payType = 0;
//当前环境
var payEvn = 0;

if (token != null && token != '' && LoginTime != null && LoginTime != '') {
    //判断是过期 3天
    var time = 60 * 60 * 24 * 3 - (Date.parse(new Date()) / 1000 - LoginTime)
    if (time <= 0) {
        //过期 跳转登录
        window.location.href = allAjaxUrl.H5_login;
    } else {
        //支付失败判断
        var payError = getParam("payError");
        if (payError == 1) {
            alert("支付失败")
            window.location.href = allAjaxUrl.H5_Search;   //无数据去列表
        } else {
            //已经登录 查看账号数据 已经参数是否正确
            var rentId = getParam("rentId");
            isSearch = getParam("Search");
            var dataI = getParam("dataI");    //本地储存中的下标
            if (isSearch == 1) {
                //ep_h5_SearchRentData    查询列表进入
                var SearchRentData = localStorage.getItem(localCache + 'SearchRentData');
                //不判断是否过期
                if (SearchRentData == null || SearchRentData == "") {
                    window.location.href = allAjaxUrl.H5_Search;   //无数据去列表
                } else {
                    DataHandle(SearchRentData, rentId, dataI);
                }
                // }else if (isSearch ==2) {
                //   //我租赁中数据 进入
                //   //ep_h5_MyLeaseRentData
                //   var MyLeaseRentData = localStorage.getItem(localCache + 'MyLeaseRentData')
                //   //不判断是否过期
                //   if (MyLeaseRentData == null || MyLeaseRentData == "") {
                //     window.location.href = allAjaxUrl.H5_MyLease;    //无数据调回原先页面
                //   }else{
                //     DataHandle(MyLeaseRentData,rentId,dataI);
                //   }      
                // } else{
                //   //ep_h5_RandRentData 原先首页
                //   var RandRentData = localStorage.getItem(localCache + 'RandRentData')
                //   //不判断是否过期
                //   if (RandRentData == null || RandRentData == "") {
                //     window.location.href = allAjaxUrl.H5_Search;    //无数据去列表
                //   }else{
                //     DataHandle(RandRentData,rentId,dataI);
                //   }
            }
        }

    }
} else {
    //未登录 跳转登录
    window.location.href = allAjaxUrl.H5_login;
}

//英雄皮肤数据
function heroSkinHandle(heroList, skinList) {
    //英雄
    var heroRow = {}
    heroRow.data = {}
    heroRow.data.Hn = {}
    heroRow.data.Hi = {}
    heroRow.data.id = {}
    heroRow.data.id = heroList

    var skinRow = {}
    skinRow.data = {}
    skinRow.data.Sn = {}
    skinRow.data.Si = {}
    skinRow.data.id = {}
    skinRow.data.id = skinList

    var AllHeroSkinData = localStorage.getItem(localCache + 'AllHeroSkinData');
    if (AllHeroSkinData == null) {
        console.log(" 缺少数据 英雄皮肤 取消渲染");
        window.location.href = allAjaxUrl.H5_Search;   //无数据去列表
        return;
    }
    JSON.parse(AllHeroSkinData).forEach(function (val) {
        if (heroidIndex != val.heroId) {
            HsHeroSkinJSON[val.heroId + "Hn"] = val.hDes;
            HsHeroSkinJSON[val.heroId + "Hi"] = val.hImg;
            heroidIndex = val.heroId;
            ++t_heroNumber;
        }
        if (skinidIndex != val.skinId) {
            HsHeroSkinJSON[val.skinId + "Sn"] = val.sDes;
            HsHeroSkinJSON[val.skinId + "Si"] = val.sImg;
            skinidIndex = val.skinId;
            ++t_skinNumber;
        }
    });
    var Humber = 0, Snumber = 0;
    heroRow.data.id.forEach(function (val) {
        heroRow.data.Hn[Humber] = HsHeroSkinJSON[val + "Hn"];
        heroRow.data.Hi[Humber] = HsHeroSkinJSON[val + "Hi"];
        ++Humber;
    });
    skinRow.data.id.forEach(function (val) {
        skinRow.data.Sn[Snumber] = HsHeroSkinJSON[val + "Sn"];
        skinRow.data.Si[Snumber] = HsHeroSkinJSON[val + "Si"];
        ++Snumber;
    });
    console.log(heroRow)
    console.log(skinRow)
    var html = template('heroIconBox_at', heroRow);
    document.getElementById('heroIconBox').innerHTML = html;

    var html = template('skinIconBox_at', skinRow);
    document.getElementById('skinIconBox').innerHTML = html;

    wx.miniProgram.getEnv(function (res) {
        if (res.miniprogram) {
            //小程序
            payEvn = 1;
            //默认 微信支付
            payType = 1;
            $('#zfb').css('display','none');
            $('#wxzf').css('display','');
            $('#wxzf .ischoose').addClass('choosedPay');
        } else {
            //其他浏览器包含微信浏览器
        }
    })
}

//账号数据==== START

function DataHandle(ShowRentData, rentId, dataI) {
    ShowRentList = JSON.parse(ShowRentData);  //一页10条固定 请求时候已经固定

    //当前值 下标 ...
    var val = ShowRentList[dataI];
    val.numRan = rentRandom(val.rentId);
    console.log(val);
    if (val != null && val != "" && ShowRentList[dataI].rentId == rentId) {
        //价格 原价
        if (val.hourPrice % 1 === 0) {
            if (isSearch == 2) {
                val.hourPrice = (val.hourPrice / 100 * 1).toFixed(2);
            } else {
                val.hourPrice = (val.hourPrice / 100 * 1).toFixed(2);
            }
        } else {
            val.hourPrice = ""
        }
        if (val.dayPrice % 1 === 0) {
            if (isSearch == 2) {
                val.dayPrice = (val.dayPrice / 100 * 1).toFixed(2);
            } else {
                val.dayPrice = (val.dayPrice / 100 * 1).toFixed(2);
            }
        } else {
            val.dayPrice = ""
        }
        if (val.nightPrice % 1 === 0) {
            if (isSearch == 2) {
                val.nightPrice = (val.nightPrice / 100 * 1).toFixed(2);
            } else {
                val.nightPrice = (val.nightPrice / 100 * 1).toFixed(2);
            }
        } else {
            val.nightPrice = ""
        }
        if (val.deposit % 1 === 0) {
            if (isSearch == 2) {
                val.deposit = (val.deposit / 100 * 1).toFixed(2);
            } else {
                val.deposit = (val.deposit / 100 * 1).toFixed(2);
            }
        } else {
            val.deposit = ""
        }
        //段位
        var isdan;
        switch (val.dan) {
            case 1: isdan = '倔强青铜'; isdanImg = '../images/Icon_CompetitiveRace_1.png'; break;
            case 2: isdan = '秩序白银'; isdanImg = '../images/Icon_CompetitiveRace_2.png'; break;
            case 3: isdan = '荣耀黄金'; isdanImg = '../images/Icon_CompetitiveRace_3.png'; break;
            case 4: isdan = '尊贵铂金'; isdanImg = '../images/Icon_CompetitiveRace_4.png'; break;
            case 5: isdan = '永恒钻石'; isdanImg = '../images/Icon_CompetitiveRace_5.png'; break;
            case 6: isdan = '至尊星耀'; isdanImg = '../images/Icon_CompetitiveRace_6.png'; break;
            case 7: isdan = '最强王者'; isdanImg = '../images/Icon_CompetitiveRace_7.png'; break;
            case 8: isdan = '荣耀王者'; isdanImg = '../images/Icon_CompetitiveRace_8.png'; break;
            default: break;
        }
        val.dan = isdan;
        val.danImg = isdanImg
        //等级
        if (val.gameGrade % 1 === 0) {
        } else {
            val.gameGrade = "暂无"
        }
    } else {
        alert("数据异常");
        window.location.href = allAjaxUrl.H5_Search;
    }
    if (val.accountType == 0) {
        val.gameTypeStr = "王者荣耀";
        val.accountTypeStr = 'QQ账号';        //写死
        switch (val.gameArea) {
            case '0': val.gameSysStr = '苹果系统'; break;
            case '1': val.gameSysStr = '安卓系统'; break;
            default: val.gameSysStr = ''; break;
        }
        switch (val.isqualify) {
            case '0': val.qualifyStr = '可排位'; break;
            case '1': val.qualifyStr = '不可排位'; break;
            default: val.qualifyStr = ''; break;
        }
    } else if (accountType == 1) {
        val.gameTypeStr = "绝地求生";
    } else if (accountType == 2) {
        val.gameTypeStr = "网易UU加速器";
    } else if (accountType == 3) {
        val.gameTypeStr = "腾讯视频Vip";
    } else if (accountType == 4) {
        val.gameTypeStr = "腾讯NBA会员";
    } else if (accountType == 5) {
        val.gameTypeStr = "优酷会员";
    } else if (accountType == 6) {
        val.gameTypeStr = "英雄联盟";
    }
    //状态
    if (val.state == 3) {
        isRent = true;
        val.state = "待租";
    } else if (val.state == 4) {
        val.state = "出租中";
        //隐藏租号操作
    } else {
        val.state = "已下架";
        //隐藏租号操作
    }
    accountID = val.rentId;
    // 余额
    val.userBalance = userBalance;
    if (val.userBalance % 1 === 0) {
        if (isSearch == 2) {
            val.userBalance = (val.userBalance / 100 * 1).toFixed(2);
        } else {
            val.userBalance = (val.userBalance / 100 * 1).toFixed(2);
        }
    } else {
        val.userBalance = ""
    }

    //页面渲染
    getAccountData(val);
    //皮肤英雄渲染 英雄6个 皮肤4个
    // console.log(JSON.parse(val.hshero))
    // console.log(JSON.parse(val.hsskin))
    // console.log(JSON.parse(val.hshero).slice(0, 5))
    // console.log(JSON.parse(val.hsskin).slice(0, 5));
    heroSkinHandle(JSON.parse(val.hshero).slice(0, 5), JSON.parse(val.hsskin).slice(0, 4));
    //储存本地 列表使用
    localStorage.setItem(localCache + 'RentHero', val.hshero);
    localStorage.setItem(localCache + 'RentSkin', val.hsskin);

    // 租号时长 
    if (LType == 0) {

    } else if (LType == 1) {
        duration = 24;
    } else {
        duration = 168;
    }
    // console.log(Number($('#Addnumber').val()));
    $('.rentDeposit').text('￥' + ((Number($('#Addnumber').val())) * val.hourPrice).toFixed(2))
    if (LType == 0) {
        $('.addition').click(function () {
            $('.rentDeposit').text('￥' + ((Number($('#Addnumber').val()) + 1) * val.hourPrice).toFixed(2))
            $('.fontcolor').text((Number($('.rentDeposit').text().substring(1)) + Number(val.deposit)).toFixed(2))
            // 时长
            if (Number($('#Addnumber').val())+1>2) {
                duration = Number($('#Addnumber').val())+1;
            }else{
                alert("时长最小为3")
            }
            // console.log(duration)
        })
        $('.subtraction').click(function () {
        
            if (Number($('#Addnumber').val()) - 1 == 2) {
                $('.rentDeposit').text('￥' + 3 * val.hourPrice)
            } else {
                $('.rentDeposit').text('￥' + ((Number($('#Addnumber').val()) - 1) * val.hourPrice).toFixed(2))
            }
            $('.fontcolor').text((Number($('.rentDeposit').text().substring(1)) + Number(val.deposit)).toFixed(2))
            // 时长
            if (Number($('#Addnumber').val())-1>2) {
                duration = Number($('#Addnumber').val())-1;
            }else{
                alert("时长最小为3")
                duration = 3;
            }
            // console.log(duration)
        })
        $('.fontcolor').text((Number($('.rentDeposit').text().substring(1)) + Number(val.deposit)).toFixed(2))
    }

    // 租号类别
    $(".typeChoosedBg").click(function () {
        clear();
        $(this).addClass("typeChoosed")
        LType = Number($(this).attr("val"));
        console.log(LType)
        // console.log(LType);
        if (LType == 0) {
            $('.rentDeposit').text('￥' + (Number($('#Addnumber').val()) * val.hourPrice).toFixed(2))
            $('.addition').click(function () {
                $('.rentDeposit').text('￥' + (Number($('#Addnumber').val()) * val.hourPrice).toFixed(2))
                $('.fontcolor').text((Number($('.rentDeposit').text().substring(1)) + Number(val.deposit)).toFixed(2))
            })
            $('.subtraction').click(function () {
                $('.rentDeposit').text('￥' + (Number($('#Addnumber').val()) * val.hourPrice).toFixed(2))
                $('.fontcolor').text((Number($('.rentDeposit').text().substring(1)) + Number(val.deposit)).toFixed(2))
            })
            $('.fontcolor').text((Number($('.rentDeposit').text().substring(1)) + Number(val.deposit)).toFixed(2))
        } else if (LType == 1) {
            $('.rentDeposit').text('￥' + val.dayPrice)
            $('.fontcolor').text((Number(val.dayPrice) + Number(val.deposit)).toFixed(2))
        } else if (LType == 2) {
            $('.rentDeposit').text('￥' + val.nightPrice)
            $('.fontcolor').text((Number(val.nightPrice) + Number(val.deposit)).toFixed(2))
        }
    })

    function clear() {
        $(".typeChoosedBg").each(function () {
            if ($(this).hasClass('typeChoosed')) {
                $(this).removeClass('typeChoosed');
            }
        })
    }
    // 余额
    $('.userBalance').text(val.userBalance)
    // console.log(duration);
}

// 填充
function getAccountData(data) {
    var rentRow = {}
    rentRow.data = data
    var html = template('rentTem', rentRow);
    document.getElementById('rentDom').innerHTML = html;

    //添加事件
    //立即租号
    $('.shadow').hide()
    $('.shadow').height(window.innerHeight + 'px')
    $('.shadow').click(function () {
        $('.shadow').hide()
        $('.choosePayType').height('0')
        allowScroll()
        rentAppoint('hide')
    })

    $('.rentNow').click(function () {
        //判断 是否弹出文明租号
        if (localStorage.getItem(localCache + 'rentAppoint')) {
            // if (false) {
            $('.shadow').show()
            $('.choosePayType').height('auto')
            unScroll()
        } else {
            rentAppoint('show')
            $('.shadow').show()
        }
    })

    //选择支付方式 ======== START
    $('.payType').click(function () {
        if ($(this)[0].id == 'zfb') {
            $('.ischoose').eq(0).addClass('choosedPay').css('border-color', 'transparent')
            $('.ischoose').eq(1).removeClass('choosedPay').css('border-color', '#999999')
            $('.ischoose').eq(2).removeClass('choosedPay').css('border-color', '#999999')
            payType = 0;
        } else if ($(this)[0].id == 'wxzf') {
            $('.ischoose').eq(1).addClass('choosedPay').css('border-color', 'transparent')
            $('.ischoose').eq(0).removeClass('choosedPay').css('border-color', '#999999')
            $('.ischoose').eq(2).removeClass('choosedPay').css('border-color', '#999999')
            payType = 1
        } else {
            $('.ischoose').eq(2).addClass('choosedPay').css('border-color', 'transparent')
            $('.ischoose').eq(0).removeClass('choosedPay').css('border-color', '#999999')
            $('.ischoose').eq(1).removeClass('choosedPay').css('border-color', '#999999')
            payType = 2
        }
        console.log(payType)
    })

    //再看看 确认租赁
    // $('.cancel').click(function () {
    //     $('.shadow').hide()
    //     $('.choosePayType').height('0')
    //     allowScroll()
    // })

    $('.confirm').click(function () {
        $('.shadow').hide()
        $('.choosePayType').height('0')
        allowScroll()
        rentGo();
    })

    //选择支付方式 ======== END
}

//继续租号
var rentGoAble = true;
function rentGo() {
    if (!isRent) {
        alert("账号无法租赁")
        return;
    }
    if (accountID == null) {
        alert("请求账号异常")
        return;
    }
    if (!rentGoAble) {
        console.log("重复点击")
        return;
    }

    if (payEvn == 1 && payType == 1) {
        // 微信小程序
        wx.miniProgram.navigateTo({ url: '../pay/pay?token='+token+'&accountID='+accountID
        +'&duration='+duration+'&LType='+LType+'&isVi=0' })
        $('#wxzf').css('dispaly','');
    } else {
        rentGoAble = false;
        // 默认支付宝
        rentGo2(payType,LType,duration)
    }
}

function rentGo2(payType,LType,duration){
    $('.spinner').css('display', '')
    $.ajax({
        url: allAjaxUrl.userLease,
        type: 'POST',
        data: {
            token: token,
            accountID: accountID,
            duration: duration,
            LType: LType,
            payType: payType
        },
        success: function (res) {
            $('.spinner').css('display', 'none')
            //var res=JSON.parse(res)
            console.log(res)
            if (res == null || res == undefined) {
                //无数据
                alert(" 请求失败 ");
            } else {
                if (res.dataCode == 1) {
                    window.location.href = allAjaxUrl.H5_orderDetail + "?isleased=1";
                } else if (res.dataCode == 2) {
                    console.log(res.data)
                    $(document.body).html(res.data);
                } else if (res.dataCode == 5) {
                    //有未完成订单
                    alert(res.message)
                    window.location.href = allAjaxUrl.H5_order + "?type=1";
                } else if (res.dataCode == 1001) {
                    //过期 跳转登录
                    window.location.href = allAjaxUrl.H5_login;
                } else {
                    alert(res.message)
                }
            }
            rentGoAble = true;
        },
        error: function () {
            rentGoAble = true;
            $('.spinner').css('display', 'none')
            alert('网络异常 请稍后重试！')
        }
    })
}
// 租号类别
// var LType;
// $(".typeChoosedBg").click(function () {
//     clear();
//     $(this).addClass("typeChoosed")
//     LType = Number($(this).attr("val"));
//     console.log(LType);
//     if(LType == 0){
//         $('.rentDeposit').text('￥' + Number($('#Addnumber').val())*hourPrice)
//     }
// })

// function clear(){
//     $(".typeChoosedBg").each(function(){
//         if($(this).hasClass('typeChoosed')){
//             $(this).removeClass('typeChoosed');
//         }
//     })
// }
// 租号时长
$('.type0').click(function () {
    $('.rent_time').show();
})
$('.type1').click(function () {
    $('.rent_time').hide();
})
$('.type2').click(function () {
    $('.rent_time').hide();
})


//弹出层防止下层页面滚动
function allowScroll() {
    $('html').css('overflow', 'visible')
    $('html').css('height', 'auto')
    $('body').css('overflow', 'visible')
    $('body').css('height', 'auto')
    //立即租号按钮
    $('.rentNow').show()
    $("#rentDom").height("calc(100vh - 1.5rem)")
}

//
function unScroll() {
    $('html').css('overflow', 'hidden')
    $('html').css('height', '100%')
    $('body').css('overflow', 'hidden')
    $('body').css('height', '100%')
    //立即租号按钮
    $('.rentNow').hide()
    $("#rentDom").height("calc(100vh)")
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

// 选择租号时长
$(function () {
    $('.addition').click(function () {
        if (Number($('#Addnumber').val()) >= 100000) {
            $('#Addnumber').val(100000);
        } else {
            $('#Addnumber').val(Number($('#Addnumber').val()) + 1);
        }
    })
    $('.subtraction').click(function () {
        $('#Addnumber').val(Number($('#Addnumber').val()) - 1);
        if ($('#Addnumber').val() <= 2) {
            $('#Addnumber').val(Number($('#Addnumber').val()) + 1);
        }
    })
})

//余额