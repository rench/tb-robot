
function notice(text){
	$('resultInfo').innerText = text
	setTimeout(function(){
		$('resultInfo').innerHTML = '';	
	},3000);	
}

/**
 * 页面初始化时恢复用户数据
 **/
function restoreOptions(){
    localStorage['isAutoStart'] = localStorage['isAutoStart'] ? localStorage['isAutoStart'] : 'true';
    localStorage['isShowNotification'] = localStorage['isShowNotification'] ? localStorage['isShowNotification'] : 'true';
    localStorage['miaoFrequency'] = localStorage['miaoFrequency'] || '';
    localStorage['reminderTime'] = localStorage['reminderTime'] || '';
	$('isAutoStart').checked = ('true' == localStorage['isAutoStart'])
	$('isShowNotification').checked = ('true' == localStorage['isShowNotification'])
  $('miaoFrequency').value = localStorage['miaoFrequency']
  $('reminderTime').value = localStorage['reminderTime'];

  initBanner();
}
window.onload = restoreOptions;

/**
 * 保存用户数据到localStorage
 **/
function saveOptions(){
	localStorage['isAutoStart'] = $('isAutoStart').checked ? 'true' : 'false';
	localStorage['isShowNotification'] = $('isShowNotification').checked ? 'true' : 'false';
  localStorage['miaoFrequency'] = $('miaoFrequency').value || '';
  localStorage['reminderTime'] = $('reminderTime').value || '';
	
	notice('设置成功！');
}

function initBanner() {
  var oBannerWrapper = $('J-banner');

  if (localStorage['banners']) {
    var banners = JSON.parse(localStorage['banners']);
    for (var i = 0; i < banners.length; i++) {
      var oLink = document.createElement('a');
      var oImg = document.createElement('img');
      oLink.href = banners[i].link;
      oImg.src = banners[i].img;

      oLink.appendChild(oImg);
      oBannerWrapper.appendChild(oLink);
    };

    show(oBannerWrapper)
  } else {
    hide(oBannerWrapper)
  }
}

on($('isAutoStart'),'click',function(e){
    saveOptions();    
})

on($('miaoFrequency'),'blur',function(e){
    saveOptions();    
})

on($('isShowNotification'),'click',function(e){
    saveOptions();    
})

on($('reminderTime'),'blur',function(e){
    saveOptions();    
})

