let retry = 1000; //重试次数
function findAndCommit() {
    let btn = document.querySelectorAll('#confirmOrder_1 a[title="提交订单"]');
    if (btn.length > 0) {
        btn[0].click();
        console.log('自动提交成功!!!!');
    } else {
        console.warn('未能发现提交按钮!!!!');
        if (retry > 0) {
            setTimeout(findAndCommit, 10);
            retry--;
        }
    }
}
function auto() {
    if (location.href.indexOf('buy.tmall.com/order/confirm_order.htm') > -1 || location.href.indexOf('buy.taobao.com/auction/buy_now.jhtml') > -1) {
        //if (location.href.indexOf('buyertrade.taobao.com') > -1) {
        findAndCommit();
    }
    let start_time, end_time, server_time;
    let script2 = document.createElement('script');
    script2.innerHTML = 'function adjust_time(json){console.log(new Date(json.time*1000));console.log(new Date());}';
    document.body.appendChild(script2);
    let script = document.createElement('script')
    script.src = 'https://t.alicdn.com/t/gettime?callback=adjust_time&_ksTS=' + new Date().valueOf()
    script.async = false
    start_time = new Date().valueOf();
    document.body.appendChild(script);
}
auto();