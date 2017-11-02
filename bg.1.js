/* @author Noah Lu <codedancerhua@gmail.com>
 */
 
var timeInterval = 1.5 * 60; //poll interval(seconds)

var baseUrl = localStorage['baseUrl'] || 'http://miao.enjoyapps.org'
var queryUrl = baseUrl + '/queryMiaoList.php'
var miaoMoreLink = baseUrl + '/reviewMiaoData.php?ref=miao' // 更多秒杀链接
var LINK_UPDATE = baseUrl + '/forum/forum.php?mod=viewthread&tid=79&ref=miao'
var LINK_INSTALL = baseUrl + '/forum/forum.php?mod=viewthread&tid=45&ref=miao'

var queryData = new FormData();
var extID = chrome.i18n.getMessage("@@extension_id");
var extVersion
var platform = 'normal'

localStorage['platform'] = platform

Ajax('manifest.json', function(rsp){
    extVersion = rsp.version
    localStorage['currentVersion'] = extVersion;
    _gaq.push(['_trackPageview', '/bg_view/v_' + platform + '_' + extVersion + '_' + extID]);
    queryData.append('version', extVersion)
}).send();

localStorage['isAutoStart'] = localStorage['isAutoStart'] ? localStorage['isAutoStart'] : 'true';
localStorage['isShowNotification'] = localStorage['isShowNotification'] ? localStorage['isShowNotification'] : 'true';

chrome.extension.onConnect.addListener(function(port){
    // 等于true为自动秒杀开启状态
    var autoStartFlag = (localStorage['isAutoStart'] == 'true');

    port.onMessage.addListener(function(msg){
        if (msg.command == 'queryIsAutoStart') {
            port.postMessage({
                autoStart: autoStartFlag,
                extVersion: extVersion,
                cdnUrl: localStorage['cdnUrl'],
                baseUrl: localStorage['baseUrl'],
                isCheck: localStorage['miaoCheck'],
                miaoFrequency: localStorage['miaoFrequency'],
                miaoTimerInfo: localStorage['timers']
            });
            // console.log('post queryIsAutoStart')
        } else if (msg.command == 'recordMiaoDuration') {
            // console.log('post recordMiaoDuration')
            localStorage['miaoDuration'] = msg.miaoDuration;
            localStorage['lastMiaoTitle'] = msg.miaoTitle;
            localStorage['lastMiaoLink'] = msg.miaoLink;
            // _gaq.push(['_trackPageview', '/miaoDuration/' + msg.miaoDuration + '_' + msg.miaoTitle.substring(0, 20)]);
            _gaq.push(['_trackPageview', '/miaoPicId/' + msg.miaoPicId + '_' + encodeURIComponent(msg.miaoKid)]);
        }
    })
})

queryData.append('timestamp', localStorage['timestamp']);
console.log(localStorage['timestamp'])
Ajax(queryUrl, ajaxHandler).send(queryData);

// ajax longpoll
setInterval(function(){
    var pollRequestMiaoList = Ajax(queryUrl, ajaxHandler)
    var queryData = new FormData();
    queryData.append('timestamp', localStorage['timestamp']);
    console.log(localStorage['timestamp'])
    pollRequestMiaoList.send(queryData)
}, timeInterval * 1000)

var reminderTime = localStorage['reminderTime'] ? parseInt(localStorage['reminderTime']) : 10;
setInterval(function(){
   showNotification(reminderTime)
}, 60 * 1000)

try {
    // management APIs are used for monitoring all extensions
    // chrome.management.onInstalled.addListener(function() {
    //     _gaq.push(['_trackPageview', '/install/v_' + extVersion + '_' + extID]);
    //     window.open(LINK_INSTALL)
    // })

    chrome.runtime.onInstalled.addListener(function(details) {
        var reason = details.reason

        switch (reason) {
            case 'install':
                _gaq.push(['_trackPageview', '/install/v_' + extVersion + '_' + platform]);
                window.open(LINK_INSTALL)
            break;
            case 'update':
                _gaq.push(['_trackPageview', '/update/v_' + extVersion + '_' + platform]);
                // window.open(LINK_UPDATE)
            break;
            default: 
        }

    })

    // below api seems not work 2013.9.22
    if (chrome.runtime.setUninstallUrl) {
        chrome.runtime.setUninstallUrl('http://enjoyapps.org/miao/uninstall.php?v='+extVersion+'&p='+platform)
    } else {
        chrome.management.onUninstalled.addListener(function(id) {
            if (id === 'cocfohgifambkoagcleimmmboonlcdoa' || id == 'pbadebjhhdipjnkbnojcoheifgopgmmd') {
                _gaq.push(['_trackPageview', '/uninstall/v_' + extVersion + '_' + extID]);
            }
        })
    }
    
} catch(e) {
    console.log(e.message)
}


// helper
// ------

// ajax factory 
function Ajax(url, ajaxHandler){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){

        // complete
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                rsp = JSON.parse(xhr.responseText);
                ajaxHandler(rsp);
            }
        }
    }
    xhr.open("POST", url, true);

    return xhr;
}

function ajaxHandler(rsp){
    // console.log('func(ajaxHandler) isMiaoTimeValidate ' + isMiaoTimeValidate(miaoTime))

    // 如果服务器无变更
    if (rsp.stat == 'nochange') {        
        return;
    };

    // ads
    localStorage['miaoAds'] = rsp.miaoAds ? JSON.stringify(rsp.miaoAds) : ''
    localStorage['latestVersion'] = rsp.version || "";
    localStorage['miaoMore'] = rsp.miaoMore || miaoMoreLink;
    localStorage['sponsor'] = rsp.sponsor || "";
    localStorage['baseUrl'] = rsp.baseUrl || "";
    localStorage['cdnUrl'] = rsp.cdnUrl || "";
    localStorage['miaoCheck'] = JSON.stringify(rsp.isCheck) || "";
    localStorage['banners'] = JSON.stringify(rsp.banners) || "";
    localStorage['timers'] = JSON.stringify(rsp.timers) || "";
    localStorage['timestamp'] = rsp.timestamp || "";

    chrome.browserAction.setBadgeText({text: ""});
    localStorage['isDisplayInfo'] = 'false'; // 不展示秒杀信息

    if (rsp.stat == 'ok') {
        var miaoTime = rsp.time;

        // only show miaoInfo before valid time 
        if (isMiaoTimeValidate(miaoTime)) {

            // set icon badge text
            if (JSON.stringify(rsp.data) != localStorage['miaoData'] || localStorage['badge'] != 'hide') {
                chrome.browserAction.setBadgeText({text: rsp.data.length + ""});
                localStorage['badge'] = 'show'; // show until user click icon and display popup
            }

            localStorage['miaoTime'] = JSON.stringify(rsp.time);
            localStorage['miaoData'] = JSON.stringify(rsp.data);

            localStorage['isDisplayInfo'] = 'true'; // 展示秒杀信息

        } else {
            // console.log('func(ajaxHandler) no available info.')
        }
    } else {
        // console.log('func(ajaxHandler) stat fail')
    }
}

function createNotification(ico, title, detail, callback) {
    // console.log(detail)
    chrome.notifications.create('miaoReminder', {
        type: 'basic',
        iconUrl: ico, 
        title: title,
        message: detail.title
    },function() {
        callback && callback()
    })
}

function cancelNotification(callback) {
    chrome.notifications.clear('miaoReminder', function() {
        callback && callback()
    })
}

function calNoticeTime(minutes) {
    var miaoMinute = JSON.parse(localStorage['miaoTime'])[2];
    var miaoHour = JSON.parse(localStorage['miaoTime'])[1];
    var preMinute; // the time (minute) to show notification
    var preHour; // the time (hour) to show notification

    if ( !isMiaoTimeValidate(JSON.parse(localStorage['miaoTime'])) ) return; 

    if (miaoMinute > minutes) {
        preMinute = miaoMinute - minutes;
        preHour = miaoHour;
    } else {
        preMinute = 60 - (minutes - miaoMinute);
        preHour = miaoHour >= 1 ? miaoHour - 1 : 24 -1;
    }

    return [preHour, preMinute];
}

function showNotification(minutes) {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var time = calNoticeTime(minutes);
    var isShowNotification = localStorage['isShowNotification']

    // console.log('func(showNotification) isShowNotification:' + isShowNotification)

    if ( !time ||
            isShowNotification == 'false' ||
                !isMiaoTimeValidate(JSON.parse(localStorage['miaoTime'])) ) return;

    // console.log("func(showNotification) current time:" + h + ":" + m);

    if (h == time[0] && m == time[1]) {
        createNotification('ico.png', '秒杀' + minutes + '分钟后即将开始:',
                JSON.parse(localStorage['miaoData'])[0])
        setTimeout(function(){ 
            cancelNotification()
        },5000);
    }
}
