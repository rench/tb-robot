let retry = 1000; //重试次数
function findAndCommit() {
    let btn = document.querySelectorAll('#submit-btn');
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
    //ncart.suning.com/order.do?
    if (location.href.indexOf('//shopping.suning.com/order.do') > -1 || location.href.indexOf('//ncart.suning.com/order.do') > -1) {
        //if (location.href.indexOf('buyertrade.taobao.com') > -1) {
        findAndCommit();
    }
}
auto();