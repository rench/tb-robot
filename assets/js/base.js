// ga
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37104103-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// Base
function $(id){
	return document.getElementById(id);	
}

function $$(selector){
	return document.querySelectorAll(selector);	
}

// utilities
function on(dom,type,handler){
	dom.addEventListener(type,handler,false);	
}

function removeClass(dom, classname) {
    if (dom.className.indexOf(classname) == -1) return;
    dom.className = dom.className.replace(classname, '');
}

function addClass(dom, classname) {
    if (dom.className.indexOf(classname) > -1) return;
    dom.className += " " + classname;
}

function hide(dom) {
    addClass(dom,'fn-hide');    
}

function show(dom) {
    removeClass(dom,'fn-hide');    
}

// ajax factory 
function Ajax(url, options){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){

        // complete
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                rsp = JSON.parse(xhr.responseText);
                options.success(rsp);
            }
        }
    }
    xhr.open(options.method, url, true);

    return xhr;
}

function isMiaoTimeValidate(miaoTime){
    var d = new Date();
    return d.getTime() < miaoTime[0] * 1000; 
}
