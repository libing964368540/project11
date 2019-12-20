//加载tabbar
$('.tabbar').load('tabbar.html');
$('.spinner').css('display', 'none')
//登录
//判断登录状态
// 数据请求
var pageNum = 1;
var pageSize = 10;
var isGrade150 = 0;
var dan = null;
var key = null;
var isqualify = null;
var gameArea = null;
var Sort = 0;
var HsHeroSkinJSON = {};        //皮肤英雄数据
var heroidIndex, t_heroNumber = 0;
var skinidIndex, t_skinNumber = 0;

var isLogin = false //登录状态
var token = localStorage.getItem(localCache + 'token')
var LoginTime = localStorage.getItem(localCache + 'LoginTime')
//加载
function load() {
    if (token != null && token != '' && LoginTime != null && LoginTime != '') {
        //判断是过期 3天
        var time = 60 * 60 * 24 * 3 - (Date.parse(new Date()) / 1000 - LoginTime)
        if (time <= 0) {
            //过期 跳转登录
            isLogin = false
            flag_updateHeroSkin = false; //全局 更新标记修改
            window.location.href = allAjaxUrl.H5_login;
        } else {
            currentOperatingSystem();
        }
    } else {
        //未登录 跳转登录
        isLogin = false
        flag_updateHeroSkin = false; //全局 更新标记修改
        window.location.href = allAjaxUrl.H5_login;
    }
}


$('#rentDom').height("calc(" + window.innerHeight + "px - 4.1rem)")
//判断是否第一次进
var showtoast = true
// if (localStorage.getItem(localCache + 'showtoast')) {
//     showtoast = false
// } else {
//     showtoast = true
// }
console.log(localCache)
// 王者段位localStorage.getItem(localCache + 'token')
danWz = [
    { id: 1, dan: '倔强青铜' },
    { id: 2, dan: '秩序白银' },
    { id: 3, dan: '荣耀黄金' },
    { id: 4, dan: '尊贵铂金' },
    { id: 5, dan: '永恒钻石' },
    { id: 6, dan: '至尊星耀' },
    { id: 7, dan: '最强王者' },
    { id: 8, dan: '荣耀王者' }
]
//渲染段位列表
var danRow = {}
danRow.data = danWz
var html = template('danBox_at', danRow);
document.getElementById('danBox').innerHTML = html;

// console.log(navigator.userAgent)

function currentOperatingSystem() {
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if (isAndroid == true) {
        choosed_system(1)
        if (showtoast) {
            $('.m-toast-pop').css('display', 'block')
            $('.m-toast-inner-text').text('已为您切换到安卓QQ')
            setTimeout(function () {
                $('.m-toast-pop').css('display', 'none')
            }, 1500)
            // localStorage.setItem(localCache + 'showtoast', false)
        }
        // return 'isAndroid'
    } else if (isiOS == true) {
        choosed_system(2)
        if (showtoast) {
            $('.m-toast-pop').css('display', 'block')
            $('.m-toast-inner-text').text('已为您切换到苹果QQ')
            setTimeout(function () {
                $('.m-toast-pop').css('display', 'none')
            }, 1500)
            // localStorage.setItem(localCache + 'showtoast', false)
        }

        // return 'iOS'
    } else {
        choosed_system(0)
        // return 'other'
    }
}

function style_normal(type) {
    $('.choose_' + type).css('color', '#666666')
    $('.' + type + '_triangle').css('border-top-color', '#666666')
    $('.choose_' + type + '_list').height(0)
    $('.choose_' + type + '_list').css('transition', 'all 0.1s linear')
    $('.choose_' + type + '_list').css('border-top', '0')
    $('.shade').height(0)
}

function style_choosed(type) {
    $('.choose_' + type).css('color', '#ff4731')
    $('.' + type + '_triangle').css('border-top-color', '#ff4731')
    $('.choose_' + type + '_list').height('4.56rem')
    $('.choose_' + type + '_list').css('transition', 'all 0.1s linear')
    $('.choose_' + type + '_list').css('border-top', '# 0.02rem solid #666666')
    $('.shade').height("calc(" + window.innerHeight + "px - 2.35rem)")
}
// 选择账号类型
$('.choose_system').click(function () {
    if ($('.choose_system_list').height() == 0) {
        style_normal('sort')
        style_choosed('system')
    } else {
        style_normal('system')
    }
})

//选择排序方式
$('.choose_sort').click(function () {
    if ($('.choose_sort_list').height() == 0) {
        style_normal('system')
        style_choosed('sort')
    } else {
        style_normal('sort')
    }
})

//选择系统
function choosed_system(e) {
    $('.choose_system_list').children().eq(e).addClass('choosedStyle');
    $('.choose_system_list').children().eq(e).siblings().removeClass('choosedStyle');
    $('.choose_system_text').text($('.choose_system_list').children().eq(e).text());
    $('.choose_system_text').css('color', '#ff4731');
    style_normal('system')
    //0 IOS 1 android 
    if (e == 0) {
        gameArea = null;
    } else if (e == 1) {
        gameArea = 1;
    } else if (e == 2) {
        gameArea = 0;
    }
    //加载
    getRentData(1);
}

//排序选择
function choosed_sort(e) {
    $('.choose_sort_list').children().eq(e).addClass('choosedStyle')
    $('.choose_sort_list').children().eq(e).siblings().removeClass('choosedStyle')
    $('.choose_sort_text').text($('.choose_sort_list').children().eq(e).text())
    style_normal('sort')
    // 默认 综合（皮肤数量高到低）1 价格低到高 2 价格高到低
    Sort = e;
    //加载
    getRentData(1);
}

//筛选
var filter_open = false
$('.choose_filter').click(function () {
    style_normal('sort')
    style_normal('system')
    $('.shade').height("calc(" + window.innerHeight + "px)")
    $('.choose_filter_list').height("calc(" + window.innerHeight + "px)")
    $('.choose_filter_list').css('transform', 'translateX(-8.64rem)')
    $('.choose_filter_list').css('transition', 'all 0.1s linear')
    $('.choose_filter_list').css('display', 'block')
    filter_open = true
})


//点击遮罩关闭选择
$('.shade').click(function () {
    if ($('.choose_system_list').height() !== 0) {
        style_normal('system')
    }
    if ($('.choose_sort_list').height() !== 0) {
        style_normal('sort')
    }
    if (filter_open == true) {
        filter_open = false
        // $('.choose_filter_list').css('right','-9.81rem')
        $('.choose_filter_list').css('transform', 'translateX(8.64rem)')
        $('.choose_filter_list').css('transition', 'all 0.1s linear')
        setTimeout(function () {
            $('.choose_filter_list').css('display', 'none')
        }, 100)
        $('.shade').height(0)
    }
})


//选择铭文 
var inscription = false //铭文
$('.filterBox').click(function () {
    if (inscription == false) {
        $('.filterBox>div').addClass('filterChoosed_mw')
        inscription = true
    } else {
        $('.filterBox>div').removeClass('filterChoosed_mw')
        inscription = false
    }
    console.log(inscription)
})

//选择段位
var choosedDan = 0 //段位
$('.clickDan').click(function () {
    $(this).addClass('filterChoosed')
    $(this).siblings().removeClass('filterChoosed')
    choosedDan = $(this)[0].title
})


//选择排位
var rank = true
$('.rankBox').children().eq(0).click(function () {
    rank = true
    $('.rankBox').children().eq(1).removeClass('filterChoosed')
    $('.rankBox').children().eq(0).addClass('filterChoosed')
})

$('.rankBox').children().eq(1).click(function () {
    rank = false
    $('.rankBox').children().eq(0).removeClass('filterChoosed')
    $('.rankBox').children().eq(1).addClass('filterChoosed')
})

//重置
$('.choose_filter_list_reset').click(function () {
    inscription = false
    $('.filterBox>div').removeClass('filterChoosed_mw')
    choosedDan = 0
    $('#danBox > div').removeClass('filterChoosed')
    rank = true
    $('.rankBox').children().eq(1).removeClass('filterChoosed')
    $('.rankBox').children().eq(0).addClass('filterChoosed')
})

//确认
$('.choose_filter_list_confirm').click(function () {
    console.log('铭文' + inscription)
    console.log('段位' + choosedDan)
    console.log('排位' + rank)
    filter_open = false
    // $('.choose_filter_list').css('right','-9.81rem')
    $('.choose_filter_list').css('transform', 'translateX(8.64rem)')
    $('.choose_filter_list').css('transition', 'all 0.1s linear')
    setTimeout(function () {
        $('.choose_filter_list').css('display', 'none')
    }, 100)
    $('.shade').height(0)
    //参数
    if (inscription) {
        isGrade150 = 1;
    } else {
        isGrade150 = 0;
    }
    //允许排位		0 允许 1 不允许
    if (rank) {
        isqualify = 0;
    } else {
        isqualify = 1;
    }
    if (choosedDan == 0) {
        dan = null;
    } else {
        dan = choosedDan;
    }
    getRentData(1);
})

//搜索
$('.search_btn').click(function () {
    //key 转id ==== START ====
    var temKey = $("#search_content").val();
    if (temKey == null || temKey == "") {
        console.log("无有效key " + temKey);
        key = null;
    } else {
        HsHeroSkinJSON
        if (HsHeroSkinJSON == null) {
            console.log(" 缺少数据 HsHeroSkinJSON");
        } else {
            for (let index = 1; index <= t_heroNumber; index++) {
                if (HsHeroSkinJSON[index + "Hn"] == temKey) {
                    key = index;
                    getRentData(1);
                    return;
                }
            }
            for (let index = 1; index <= t_skinNumber; index++) {
                if (HsHeroSkinJSON[index + "Sn"] == temKey) {
                    key = index;
                    getRentData(1);
                    return;
                }
            }
            // 无匹配值
            alert("无匹配值 显示默认内容");
            console.log("无匹配值 " + temKey);
        }
    }
    //key 转id ==== END ====
})

//跳转账号详情
function rentDetails(DataIndex, dataI) {
    isLogin = false
    flag_updateHeroSkin = false; //全局 更新标记修改
    window.location.href = allAjaxUrl.H5_AccountDetail + "?Search=1&rentId=" + DataIndex + "&dataI=" + dataI;
}
//  ============================================== 接口接入
// 拉取账号数据
function getRentData(parmpageNum) {
    pageNum = parmpageNum;
    var temKey = $("#search_content").val();

    //拉取数据
    $('.spinner').css('display', '')
    console.log(pageNum, pageSize, isGrade150, dan, key)
    $.ajax({
        url: allAjaxUrl.leaseSearch,
        type: 'POST',
        data: {
            pageNum: pageNum,
            pageSize: pageSize,           //一页10条固定
            is150Grade: isGrade150,
            dan: dan,
            key: key,
            isqualify: isqualify,
            gameArea: gameArea,
            Sort: Sort,
        },
        success: function (res) {
            $.ajax({
                url: allAjaxUrl.getUserBan,
                type: 'POST',
                data: {
                    token: token,
                },
                success:function(UserDeRes){
                    $('.spinner').css('display', 'none')
                    if(UserDeRes.dataCode == 1){
                        if(UserDeRes.data == null){
                            localStorage.setItem(localCache + 'UserBan', 0);
                        }else{
                            localStorage.setItem(localCache + 'UserBan', UserDeRes.data);
                        }
                    }
                },error:function () {
                    $('.spinner').css('display', 'none')
                }
            })
            //var res=JSON.parse(res)
            // console.log(res)
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
                        var SearchRentData = localStorage.getItem(localCache + 'SearchRentData');
                        SearchRentList = JSON.parse(SearchRentData);
                        Temp.forEach(function (i) {
                            SearchRentList.push(i)
                        })
                        Temp = SearchRentList;
                    } else {
                        //第一次提示 段位不限也不提示
                        // 返回顶部
                        $("#rentDom").scrollTop(0)
                        if (res.message != "租号列表" && (dan != null || temKey != "")) {
                            $('#m-toast-inner-text').text('无符合条件账号显示默认账号');
                            $('#m-toast-pop').fadeIn();
                            setTimeout(function () {
                                $('#m-toast-pop').fadeOut();
                            }, 2000);
                        }
                    }
                    localStorage.setItem(localCache + 'SearchRentData', JSON.stringify(Temp))
                    localStorage.setItem(localCache + 'SearchRentCount', Count)
                    
                    DataHandle_1();
                    // console.log(res.data);
                } else {
                    alert(res.message)
                }

            }
        },
        error: function () {
            $('.spinner').css('display', 'none')
            alert('网络异常 请稍后重试！')
        }
    })
}
//数据处理
function DataHandle_1() {
    //皮肤英雄数据
    flag_updateHeroSkin = true; //全局 更新标记修改
    var DataHeroSkin = PublicHeroSkin();   //如果本地无值则 返回 undefined
    // console.log(DataHeroSkin);
    if (DataHeroSkin == null) {
        console.log(" == DataHeroSkin 无数据 异常 ")
    }
    DataHandle_2();
}

function DataHandle_2() {
    var SearchRentData = localStorage.getItem(localCache + 'SearchRentData');
    SearchRentList = JSON.parse(SearchRentData);  //一页10条固定 请求时候已经固定
    // console.log("使用本地缓存 ",SearchRentData);

    //游戏皮肤数据
    var AllHeroSkinData = localStorage.getItem(localCache + 'AllHeroSkinData');
    if (AllHeroSkinData == null) {
        console.log(" 缺少数据 英雄皮肤 取消渲染");
        return;
    }
    // console.log(JSON.parse(AllHeroSkinData))
    t_heroNumber = 0;
    t_skinNumber = 0;
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
    // console.log(HsHeroSkinJSON)
    //当前值 下标 ...
    SearchRentList.forEach(function (val, index, arr) {
        //价格 原价
        if (val.hourPrice % 1 === 0) {
            // val.hourPrice=val.hourPrice/100;
            val.hourPrice = (val.hourPrice / 100 * 1).toFixed(2);
        } else {
            val.hourPrice = ""
        }
        //英雄皮肤数量占比
        val.heronumberShow = Math.floor(val.heronumber / t_heroNumber * 100)
        if (val.heronumberShow > 100)
            val.heronumberShow = 100;
        val.skinnubmerShow = Math.floor(val.skinnubmer / t_skinNumber * 100)
        if (val.skinnubmerShow > 100)
            val.skinnubmerShow = 100;

        // console.log(val)
        if (val.accountType == 0) {
            val.gameTypeStr = "王者荣耀";
            val.accountTypeStr = 'QQ账号';
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
        //随机的租赁次数
        val.numRan = rentRandom(val.rentId);
    });
    //页面渲染
    // getAccountArea(SearchRentList);
    // console.log(SearchRentList)
    //渲染账号列表
    var rentRow = {}
    rentRow.data = SearchRentList
    var html = template('rentTem', rentRow);
    document.getElementById('rentDom').innerHTML = html;
}

// 稀英雄 数据返回更新 异步
function updateHeroSkin() {
    //皮肤英雄数据
    flag_updateHeroSkin = false; //全局 更新标记修改 关闭
    console.log("updateHero");
    if (flag_updateHeroSkin == false) {
        //都返回后 再刷新防止刷新两次
        console.log("updateHeroSkin 开始渲染");
        DataHandle_2();
    }
}

//下拉加载 翻页
function rentScroll(e) {
    //单条高度
    var rowheight = $("#rentDom").children(".row_rent:first").height()
    //显示内容高度
    var showHeight = $("#rentDom").height();
    //元素滚动条内的内容高度 e.scrollHeight
    //元素滚动条内的顶部隐藏部分的高度  e.scrollTop
    // console.log((e.scrollHeight - showHeight - e.scrollTop))
    if (rowheight >= e.scrollHeight - showHeight - e.scrollTop) {
        var Count = localStorage.getItem(localCache + 'SearchRentCount')
        console.log(pageNum * pageSize <= Count, pageNum, pageSize, Count)
        pageNum++;
        if ((pageNum - 1) * pageSize <= Count && pageNum < Count) {
            getRentData(pageNum);
        }
    }
}

// share()