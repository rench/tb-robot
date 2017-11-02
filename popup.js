/*
 * @author Noah Lu <codedancerhua@gmail.com> 
 * */
   
// 初始化
if (!localStorage['miaoTime'] && !localStorage['miaoData']) {
    localStorage['miaoTime'] = '[0,0,0]';
    localStorage['miaoData'] = '[{"title": "","img": "","link": "","price": "","miaoPrice": ""}]';
}

// 等于true为自动秒杀开启状态
var autoStartFlag = (localStorage['isAutoStart'] == 'true');
var miaoTime = JSON.parse(localStorage['miaoTime']);
var miaoData = JSON.parse(localStorage['miaoData']);
var miaoAds

/* 解析HTML模版
 * @param {Object} 数据对象
 * @param {String} 数据模版数组
 * @return {String} 解析后的数据字符串
 * */
function parseTemplate(data, template){
    var _template = template;

    for (var i in data) {
        while (_template.search("{%" + i + "}") != -1) {
            _template = _template.replace("{%" + i + "}", data[i]);
        }
    }

    return _template;
}

// DOM ready
window.addEventListener('DOMContentLoaded',function(){
    var template = $('J-dataTemplate').innerHTML;
    var oMiaoList = $('J-miaoList');
    var oMiaoTime = $('J-miaoStartTime');
    var oMiaoAds = $('J-ads')
    var oMiaoMore = $$('.miaoMore')[0];
    var oSponsor = $('sponsor');

    //console.log('miaoh:'+miaoTime[1]+' miaom:'+miaoTime[2])

    // 展示更多秒杀’按钮
    if (localStorage['miaoMore']) {
        oMiaoMore.href = localStorage['miaoMore'];
        show(oMiaoMore);
    } else {
        hide(oMiaoMore);
    }

    // 展示sponsor内容
    if (localStorage['sponsor']) {
        oSponsor.innerHTML = localStorage['sponsor'];
        show(oSponsor);
    } else {
        hide(oSponsor);
    }


    // always hide icon badge after popup.htm shows
    chrome.browserAction.setBadgeText({text: ''});
    localStorage['badge'] = 'hide';

    console.log('isDisplayInfo ' + localStorage['isDisplayInfo'])

    if ( isMiaoTimeValidate(JSON.parse(localStorage['miaoTime'])) && localStorage['isDisplayInfo'] != 'false' ) {

        show($('J-miaoSummary'));
        hide($$("#J-miaoList .loading")[0]);

        // show miao items
        oMiaoTime.innerText = miaoTime[1] + ":" + miaoTime[2];
        miaoData.forEach(function(v, i){
            var listItem = document.createElement('li');
            listItem.innerHTML = parseTemplate(v, template);
            oMiaoList.appendChild(listItem);
        })
    } else { // no miao items info available
        console.log('no miao items info available');
        hide($('J-miaoSummary'));
        hide($$("#J-miaoList .loading")[0]);
        show($$("#J-miaoList .noItems")[0]);
    }

    if (localStorage['miaoAds']) {
        miaoAds = JSON.parse(localStorage['miaoAds'])

        miaoAds.forEach(function(item, index) {
            var listItem = document.createElement('li')

            listItem.innerHTML = parseTemplate(item, template)
            oMiaoAds.appendChild(listItem)
        })
        show(oMiaoAds)
    } 

    if (autoStartFlag) {
        hide($$("#status .loading")[0]);
        hide($$("#status .fail")[0]);
        show($$("#status .success")[0]);
    } else {
        hide($$("#status .loading")[0]);
        show($$("#status .fail")[0]);
        hide($$("#status .success")[0]);
    }

    // 有可用更新
    if (localStorage['currentVersion'] < localStorage['latestVersion']) {
        console.log('update available')
        hide($$("#status .fail")[0]);
        hide($$("#status .success")[0]);
        show($$("#status .update")[0]);
    }

    // sponsor tracker
    if ($$('#sponsor a').length > 0) {
        on($$('#sponsor a')[0], 'click', function(){
            _gaq.push(['_trackPageview', '/popup/sponsor_top'])
        })
    }

}, false);
