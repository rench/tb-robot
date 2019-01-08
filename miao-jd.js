function saveAndCommit(){
    let script2 = document.createElement('script');
    script2.innerHTML = 'try{save_Consignee();}catch(e){} try{save_Payment();}catch(e){} try{submitOrder();}catch(e){}';
    document.body.appendChild(script2);
}
function retry(){
    let script2 = document.createElement('script');
    script2.innerHTML = 'try{tryAgain()();}catch(e){}';
    document.body.appendChild(script2);
}
function auto() {
    if (location.href.indexOf('marathon.jd.com/seckill/seckill.action') > -1) {
      saveAndCommit();
    }else if(location.href.indexOf('marathon.jd.com/koFail.html') > -1){
      retry();
    }
}
auto();