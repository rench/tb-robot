
var debugFlag = location.href.indexOf('noahludev') > -1;
var port = chrome.extension.connect();
var extID = chrome.i18n.getMessage("@@extension_id");
var extVersion, miaoTimerInfo = []

var BASE_URL = 'http://miao.enjoyapps.org'
var CDN_URL = 'http://cdn.enjoyapps.org'
var LINK_SCRIPT, LINK_CHECK, miaoFrequency = 250

port.postMessage({command: "queryIsAutoStart"});
port.onMessage.addListener(function(msg) {
    BASE_URL = msg.baseUrl ? msg.baseUrl : BASE_URL
    CDN_URL = msg.cdnUrl ? msg.cdnUrl : CDN_URL;
    miaoFrequency = msg.miaoFrequency ? 1000/msg.miaoFrequency: miaoFrequency;
    miaoTimerInfo = msg.miaoTimerInfo ? JSON.parse(msg.miaoTimerInfo) : [];
    // console.log('miaoFrequency: ' + miaoFrequency)

    // standalone script miao.js
    // LINK_SCRIPT = CDN_URL + '/miao/miao.js'

    LINK_CHECK = BASE_URL + '/check.php'
    isCheck = msg.isCheck;

    extVersion = msg.extVersion;
    if (msg.autoStart) {

        if (isCheck == 'true') {
            Ajax(LINK_CHECK + '?id=' + extID, {
                method: 'GET',
                success: function(rsp) {
                    if (rsp.stat === 'ok') {
                        start(document);
                    } else {
                        alert(rsp.msg)
                    }
                }
            }).send()
        } else {
            start(document);
        }

    }
});

function start(doc){
    var oTimer;
    var userMiaoStart, userMiaoEnd, userMiaoDuration;

    if (doc.domain.indexOf("taobao.com") > -1 ||
            doc.domain.indexOf("tmall.com") > -1 ||
                location.href.indexOf("miaotest") > -1) {

        injectDom(doc)
        // injectScript("var _MIAOID='"+extID+"', _MIAOVER='"+extVersion+"';")
        // appendMiaoScript(LINK_SCRIPT + '?r=' + new Date().getTime())

        // inject standalone miao.js
        // appendMiaoScript(LINK_SCRIPT)
        oTimer = $('noahlu-miao-timer')

        // 回车提交
        doc.body.onkeydown = function(e){

            if (e.keyCode == 13 && $$('.J_Submit').length > 0) {
                var picId, key;
                // todo: var $$(".question-img").length > 0 和 $$(".answer-input") 
				if($$(".question-img").length > 0 && $$(".answer-input").length > 0)
				{
					picId = $$(".question-img")[0].src;
					key = $$(".answer-input")[0].value;
				}
				
                $$('.J_Submit')[0].click();

                userMiaoEnd = new Date();
                userMiaoDuration = userMiaoEnd.getTime() - userMiaoStart.getTime();
                port.postMessage({
                    command: "recordMiaoDuration",
                    miaoDuration: userMiaoDuration,
                    miaoLink: location.href,
                    miaoTitle: document.title,
                    miaoPicId: picId,
                    miaoKid: key
                });
                $('noahlu-score').className = 'noahlu-score';
                $('noahlu-score').innerHTML = '本次秒杀耗时：' + userMiaoDuration / 1000 + ' 秒';

                // inject callback `taoExecTest(picId, key)`
                // try{
                //     injectScript("taoExecTest('"+picId+"','"+key+"');")
                // }catch(e){}

                // log('User Miao Start Time: ' + userMiaoStart)
                // log('User Miao End Time: ' + userMiaoEnd)
                // log('User Miao Duration: ' + userMiaoDuration / 1000 + ' 秒');
            }
        }

        var syncTimeCallback = syncTime(oTimer, function(timer){

            var refreshBtn = $$('.J_RefreshStatus')[0];
            var miaoClockswitch = $$('#noahlu-miao header a')[1];
            var answerInput = $$('.answer-input')[0];

            if (answerInput) {
                userMiaoStart = new Date();
                setTimeout(function(){
                    answerInput.focus();
                    clearInterval(timer);
                },150)
            }

            if (refreshBtn) {
                refreshBtn.click();

                // 展开计时器
                if (miaoClockswitch && miaoClockswitch.innerHTML == '展开') {
                    miaoClockswitch.click();
                }
            }

        })

        // getLagTime('http://acookie.taobao.com/1.gif?r=' + (new Date()).getTime(), syncTimeCallback);
        getLagTime('http://a.tbcdn.cn/p/fp/2011a/assets/space.gif?r=' + (new Date()).getTime(), syncTimeCallback);

    } else {
        // log("亲，我只支持淘宝，天猫秒杀哦！");
    }
}


function injectDom(doc){
    var oDisplay, oTimer, oStyle, oHeader, oSwithcer, oScore, oInfo;

    oDisplay = doc.createElement("div");
    oDisplay.className = "noahlu-miao";
    oDisplay.id = "noahlu-miao";

    oHeader = doc.createElement("header");
    oHeader.innerHTML = "<a href='" + BASE_URL + "/howtouse.php?ref=timer' target='_blank'>MIAO秒杀助手</a>" +
                        " [<a href='#' class='noahlu-miao-link'>展开</a>]";

    oTimer = doc.createElement("div");
    oTimer.className = "noahlu-miao-timer noahlu-hide"; // 计时表默认隐藏
    oTimer.id = "noahlu-miao-timer";

    oInfo = doc.createElement("div");
    oInfo.className = "noahlu-miao-info";
    oInfo.id = "noahlu-miao-info";

    var defaultInfo = "<a href='http://miao.enjoyapps.org/forum/' target='_blank'>秒杀论坛</a>";
    var infoText = '';
    if (miaoTimerInfo.length > 0) {
        for (var i = 0; i < miaoTimerInfo.length; i++) {
            infoText += "<a href='"+miaoTimerInfo[i].link+"' target='_blank'>"+miaoTimerInfo[i].text+"</a>"
            miaoTimerInfo[i]
        };
    };

    oInfo.innerHTML = infoText || defaultInfo;

    oStyle = doc.createElement("style");
    oStyle.innerHTML =
        ".noahlu-miao{border-radius:2px;background-color:rgba(5,5,5,0.15); padding:3px; position:fixed;top:30px;left:30px;z-index:1000000000;}" +
        ".noahlu-miao header{text-align:center;}" +
        ".noahlu-miao-link{font-size:10px; color:red;text-decoration:underline;margin-bottom:3px;text-align:center}" +
        ".noahlu-miao-timer{color:#fff;font-size:20px;padding:5px;border:1px solid #aaa;background-color:#bbb;border-radius:4px;}" +
        ".noahlu-score{text-align:center;color:red;}" +
        ".noahlu-miao-info{text-align: center; margin: 0px; font-size: 12px;}" +
        ".noahlu-hide{display:none}"

    oScore = doc.createElement('div');
    oScore.className = 'noahlu-score noahlu-hide';
    oScore.id = 'noahlu-score';

    oDisplay.appendChild(oHeader);
    oDisplay.appendChild(oTimer);
    oDisplay.appendChild(oScore);
    oDisplay.appendChild(oInfo);
    doc.head.appendChild(oStyle);
    doc.body.appendChild(oDisplay);

    // Toggle timer
    oSwithcer = oHeader.querySelectorAll('a')[1];
    oSwithcer.addEventListener('click', function(e){
        e.preventDefault();
        if(oTimer.className.indexOf('noahlu-hide') > -1) {
            oTimer.className = 'noahlu-miao-timer';
            oSwithcer.innerHTML = '收起';
        } else {
            oTimer.className = 'noahlu-hide';
            oSwithcer.innerHTML = '展开';
        }
    })
}

function getLagTime(url, callback){
    var xhr = new XMLHttpRequest();
    var startDate, endDate, networkTime, serverDate, lagTime;

    xhr.open('GET', url, true);

    xhr.onreadystatechange = function(){

        // http://www.w3.org/TR/XMLHttpRequest/#states
        // readyState 2: all HTTP headers of the final response have been received. 
        if(xhr.readyState === 2) {
            endDate = new Date();
            serverDate = new Date(xhr.getResponseHeader('date'));
            networkTime = Math.floor( (endDate.getTime() - startDate.getTime()) / 2 );

            lagTime = endDate.getTime() - serverDate.getTime() - networkTime;
            // log('Server date is: ' + serverDate);
            // log('Local date is: ' + endDate);
            // log('networkTime: ' + networkTime);
            // log('Lag time is: ' + lagTime);
            callback && callback(lagTime);
        }
    }

    startDate = new Date();
    xhr.send();
}

function timeStandardize(str) {
    return str.toString().length > 1 ? str : "0" + str;
}

function syncTime(oTimer, callback){
    // log('[-----Miao: creating syncTimeCallback-----]')

    return function(lagTime){
        // log('[-----Miao: syncTimeCallback-----]')
        var timer = setInterval(function(){
            var localDate, serverDate, h, m, s;

            serverDate = new Date();
            localDate = new Date();

            serverDate.setTime(localDate.getTime() - lagTime);
            h = timeStandardize(serverDate.getHours());
            m = timeStandardize(serverDate.getMinutes());
            s = timeStandardize(serverDate.getSeconds());

            oTimer.innerHTML = "服务器时间：" + h + ":" + m + ":" + s;
            debugFlag && (oTimer.innerHTML = "服务器：" + serverDate.getTime() +  " 本地：" + localDate.getTime());
            callback(timer);
        }, miaoFrequency);
    }
}

// function injectScript(script) {
//     var oScript = document.createElement('script')

//     oScript.type = 'text/javascript'
//     oScript.innerHTML = script
//     oScript.id = 'J-miao-script'
//     // console.log(script)

//     document.head.appendChild(oScript)
// }

// function appendMiaoScript(url) {
//     var oScript = document.createElement('script')

//     oScript.type = 'text/javascript'
//     oScript.charset = 'UTF-8'
//     oScript.src = url 
//     oScript.id = 'J-miaoshazhushou'

//     document.head.appendChild(oScript)
// }

function log(msg){
    console = window.console || {};
    console.log = console.log || function(){};
    debugFlag && console.log(msg);
}