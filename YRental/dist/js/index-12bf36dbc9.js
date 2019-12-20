$('.tabbar').load('tabbar.html');

$('.search').click(function(){
    window.location.href='search.html'
})

console.log(window.innerHeight)
// $('#rentDom').css('height',"calc("+window.innerHeight+'px'+"-1px")
$('#rentDom').height("calc("+window.innerHeight+"px - 7.61rem)")
// var div=document.getElementById('rentDom')
// div.style.height="calc("+window.innerHeight+"px - 7.61rem)"
data=[1,1,1,1,1]
var rentRow = {}
rentRow.data = data
var html = template('rentTem', rentRow);
document.getElementById('rentDom').innerHTML = html;

//跳转账号详情
function toAccountDeatil(){
    window.location.href='./accountDetail.html'
}