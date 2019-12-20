$('.spinner').css('display','none')
var pageNum = 1
var pageSize = 10
var totalCount
var indetList = []
var loadState = true
//获取订单列表封装//获取用户信息

var isLogin = false //登录状态
var token = localStorage.getItem(localCache + 'token')
var accounts
if (token != null && token != undefined && token != '') {
    isLogin = true
} else {
    isLogin = false
    alert('登录失效，请重新登录')
    window.location.href = '../html/login.html'
}

// 维权类别
var rpType;
$(".typeChoosedBg").click(function () {
    $(this).toggleClass("typeChoosed")
    let typeStr = [];
    $(".typeChoosed").each(function () {
        typeStr.push($(this).attr("val"))
    });
    rpType = typeStr.join(",");
    console.log(rpType);
})

// 维权说明地址
$(".linkRP").click(function () {
    //支付宝生活号文档地址
    window.location.href = 'https://t.alipayobjects.com/images/partner/TB1EM4obl8rDuNk6XejO06EYXXa.html'
})

//添加维权记录
var subStatus = false;  //是否已经请求
function addRProtection() {
    if (subStatus) {
        alert("请勿重复提交")
        return
    }

    leaseId = getParam("lId");
    if (leaseId == null || leaseId < 1) {
        alert("请返回前一页面清除缓存后再试")
        return
    }
    // 描述内容
    RpDes = $('textarea[name="RpDes"]').val();
    if (RpDes.length > 250) {
        alert("描述内容超长")
        return
    }
    if (rpType == null) {
        alert("请选择违规类型")
        return
    }

    var formData = new FormData();
    formData.append("token", token);
    formData.append("leaseId", leaseId);
    formData.append("RpDes", RpDes);
    formData.append("rpType", rpType);
    formData.append("tenant", true);

    //图片
    if (userAType == 2) {
         //支付宝
         for (let index = 0; index < 8; index++) {
            let thisImg = G_img_base64Data["inputImageFile_" + (index + 1)];
            if (thisImg) {
                // alert(2665221646);
                thisImg = thisImg.replace(",","@");
                formData.append("base64Data", thisImg);
            } else {
                console.log(" kong ")
                // alert("空")
            }
        }
        formData.append("isBase64", true);
    } else {
        $('input[name="RPImage"]').each(function () {
            if (this.value) {
                console.log(this.value)
                console.log(this.files[0])
                formData.append("files", this.files[0]);
                // alert( this.files[0])
            } else {
                console.log(" kong ")
                // alert("空")
            }
        });
    }

    subStatus = true;
    $('.spinner').css('display','')
    $.ajax({
        url: allAjaxUrl.addRProtection,
        // url: allAjaxUrl.t1,
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (res) {
            subStatus = false;
            $('.spinner').css('display','none')
            console.log(res)
            if (res.dataCode == 1) {
                alert(res.message);
                //$("#" + leaseId).attr("imglist", res.data)
            } else if (res.dataCode == 1001) {
                alert("请重新登录");
                window.location.href = '../html/login.html'
            } else {
                alert(res.message);
            }
        },
        error: function () {
            $('.spinner').css('display','none')
            subStatus = false;
            alert("请求失败");
        }
    })
}

//
var G_img1;
var G_img1lj;
var G_img_base64Data = []
// 选择图片
function loadImage(img) {
    var filePath = img.value;
    console.log(filePath)
    //
    console.log(img.files)
    var filePath = img.files[0].name;
    var fileExt = filePath.substring(filePath.lastIndexOf("."))
        .toLowerCase();
    if (!checkFileExt(fileExt)) {
        alert("您上传的文件不是图片,请重新上传！");
        img.value = "";
        G_img1 = null;
        G_img1lj = null;
        return;
    }
    if (img.files && img.files[0]) {
        if ((img.files[0].size / 1024).toFixed(0) > (1024 * 5)) {
            img.value = "";
            alert("单张图片不得大于5M");
            return
        }
    } else {
        img.select();
        var url = document.selection.createRange().text;
        try {
            var fso = new ActiveXObject("Scripting.FileSystemObject");
        } catch (e) {
            alert('如果你用的是ie8以下 请将安全级别调低！');
        }
        alert("文件大小为：" + (fso.GetFile(url).size / 1024).toFixed(0) + "kb");
    }
    G_img1 = img.files[0];
    G_img1lj = URL.createObjectURL(img.files[0])
    console.log(G_img1lj)
    console.log(img.id)
    console.log("#" + img.id + "_img")
    $("#" + img.id + "_img").attr("src", G_img1lj);
    $("#" + img.id + "_img").css({ "width": "100%", "height": "100%" });
}


// ==== 支付宝 jsapi ==== 
function loadImageAli(img) {
    AlipayJSBridge.call(
        'chooseImage', {
            count: 1,
            // 如果只需要拍照，可以只传['camera']
            sourceType: ['camera', 'album']
        },
        function (result) {
            // alert(JSON.stringify(result));

            var apFilePath = result.apFilePathsV2 || result.apFilePaths || [];
            if (typeof apFilePath === 'string') {
                try {
                    apFilePath = JSON.parse(apFilePath);
                } catch (e) { }
            }

            if (!apFilePath.length || !/^https?:/.test(apFilePath[0])) {
                return;
            }

            //压缩 减小请求大小 服务端再次压缩 0	低质量1	中等质量2	高质量3	不压缩4	根据网络适应 两次压缩后 图片损耗大不依旧清晰不影响用途
            AlipayJSBridge.call('compressImage', {
                apFilePaths: apFilePath,
                compressLevel: 0
            }, function (result) {
                apFilePath = result.apFilePaths;

                //继续操作
                var eImage = document.querySelector('#' + img.id + "_img");
                var image = new Image();
                image.crossOrigin = 'anonymous';
                image.onload = function () {
                    var canvas = document.createElement('CANVAS');
                    var context = canvas.getContext('2d');
                    canvas.height = image.height;
                    canvas.width = image.width;
                    // alert(image.height +" = "+image.width)
                    context.drawImage(image, 0, 0);
                    try {
                        var dataURL = canvas.toDataURL('image/jpeg');
                        // console.log(dataURL);
                        if (dataURL.length>1024*1024*5) {
                            alert("单张图片过大");
                        }else{
                            eImage.src = dataURL;
                            G_img_base64Data[img.id] = dataURL;
                            $("#" + img.id + "_img").css({ "width": "100%", "height": "100%" });
                        }
                    } catch (e) {
                        eImage.src = apFilePath[0];
                        $("#" + img.id + "_img").css({ "width": "100%", "height": "100%" });
                    }
                    canvas = null;
                }
                image.src = apFilePath[0];
            });
        }
    );
}
// function loadImageAli(img) {
//     AlipayJSBridge.call(
//         'photo', {
//             dataType: 'fileURL',
//             imageFormat: 'jpg',
//             quality: 60,
//             maxWidth: 5000,
//             maxHeight: 5000,
//             beautyLevel:0,
//             allowEdit: true,
//             multimediaConfig: { // 可选，仅当该项被配置时，图片被传输至 APMultimedia
//               compress: 2, // 可选，默认为4。 0-低质量，1-中质量，2-高质量，3-不压缩，4-根据网络情况自动选择
//               business: "multiMedia" // 可选，默认为“NebulaBiz”
//             }
//         },
//         function (result) {
//             alert(JSON.stringify(result));
//             alert(result.apFilePathsV2);
//             alert(result.apFilePaths);

//             var apFilePath = result.apFilePathsV2 || result.apFilePaths || [];
//             if (typeof apFilePath === 'string') {
//                 try {
//                     apFilePath = JSON.parse(apFilePath);
//                 } catch (e) { }
//             }

//             if (!apFilePath.length || !/^https?:/.test(apFilePath[0])) {
//                 return;
//             }
//             // 如下演示如何拿到base64格式的数据，可用于上传到服务器端的场景
//             var eImage = document.querySelector('#'+img.id + "_img");
//             var image = new Image();
//             image.crossOrigin = 'anonymous';
//             image.onload = function () {
//                 var canvas = document.createElement('CANVAS');
//                 var context = canvas.getContext('2d');
//                 canvas.height = image.height;
//                 canvas.width = image.width;
//                 alert(image.height +" = "+image.width)
//                 context.drawImage(image, 0, 0);
//                 try {
//                     var dataURL = canvas.toDataURL('image/jpeg');
//                     console.log(dataURL);
//                     eImage.src = dataURL;
//                     alert("11")
//                     alert(dataURL)
//                 } catch (e) {
//                     eImage.src = apFilePath[0];
//                     alert("0022")
//                 }
//                 alert(canvas)
//                 $("#" + img.id + "_img").css({ "width": "100%", "height": "100%" });
//                 canvas = null;
//             }
//             image.src = apFilePath[0];
//             alert("33")
//         }
//     );
// }

function checkFileExt(ext) {
    if (!ext.match(/.jpg|.jpeg|.gif|.png|.bmp/i)) {
        return false;
    }
    return true;
}

//url参数
function getParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
} 