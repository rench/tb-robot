let retry = 1000; //重试次数
function findAndCommit() {
    let btn = document.querySelectorAll('#confirmOrder_1 a[title="提交订单"]');
    if (btn.length > 0) {
        btn[0].click();
        console.log('自动提交成功!!!!');
    } else {
        console.warn('未能发现提交按钮!!!!');
        if (retry > 0) {
            setTimeout(findAndCommit, 1);
            retry--;
        }
    }
}
function auto() {
    if (location.href.indexOf('buy.tmall.com/order/confirm_order.htm') > -1 || location.href.indexOf('buy.taobao.com/auction/buy_now.jhtml') > -1) {
        //if (location.href.indexOf('buyertrade.taobao.com') > -1) {
        findAndCommit();
    }

    if(location.href.indexOf('cart.taobao.com') > -1 || location.href.indexOf('cart.tmall.com') > -1){
        checkout();
    }

    /**
    let start_time, end_time, server_time;
    let script2 = document.createElement('script');
    script2.innerHTML = 'function adjust_time(json){console.log(new Date(json.time*1000));console.log(new Date());}';
    document.body.appendChild(script2);
    let script = document.createElement('script')
    script.src = 'https://t.alicdn.com/t/gettime?callback=adjust_time&_ksTS=' + new Date().valueOf()
    script.async = false
    start_time = new Date().valueOf();
    document.body.appendChild(script);
    */
}
var count = 1
function checkout(){
    if(document.querySelectorAll('.td-amount > .td-inner input')[0]==undefined){
      setTimeout(checkout,50)
      return
    }
    var value = document.querySelectorAll('.td-amount > .td-inner input')[0].value
    while(value!=1){
       document.querySelectorAll('.td-amount .J_Minus')[0].click()
       value = document.querySelectorAll('.td-amount > .td-inner input')[0].value
    }
    
    if(!document.querySelectorAll('.J_CheckBoxItem')[0].checked){
      document.querySelectorAll('.td-chk > .td-inner > .cart-checkbox label')[0].click()
    }
    if(document.querySelectorAll('.J_CheckBoxItem')[0].checked){
      console.log('checked')
      if(count++ < 1000){
        setTimeout(checkout,20)
        return
      }
      document.querySelectorAll('.btn-area')[0].querySelectorAll('a')[0].click()
    }
    

}
auto();