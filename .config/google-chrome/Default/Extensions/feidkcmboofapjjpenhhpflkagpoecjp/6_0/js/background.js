// run only once after install
if (window.localStorage) {
    var firstRun = false;
    if (!localStorage.getItem('10tracks-extension-installed')) {
        firstRun = true;
        localStorage.setItem('10tracks-extension-installed','true');
    }
    if (firstRun) {
        var checkedSites = ['vkontakte', 'promodj', 'prostopleer', 'soundcloud'];
        localStorage.setItem('10tracks-extension-options', JSON.stringify(checkedSites));
    }
}


var cookieHandler = new tentracksCookieHandler();

var vkontakteregexp = /.*vk.com.*|.*vkontakte.ru.*/;
var prostopleerregexp = /.*prostopleer.com.*/;
var promodjregexp = /.*promodj.com.*/;
var soundcloudregexp = /.*soundcloud.com.*/;
var tentracksregexp = /.*10tracks.ru.*|.*10tracks.com.*/;
var tabIds = {};

function tentracksCookieHandler() {
    this.tentracksAuthCookie = null;

    this.getAuthCookie = function() {
        return this.tentracksAuthCookie;
    };

    this.extractAuthCookie = function() {
        var self = this;
        if (!chrome.cookies) {
            chrome.cookies = chrome.experimental.cookies;
        }
 
        chrome.cookies.get({url: 'http://10tracks.com', name: 'tentracksauth'}, function(cookie){
            if (cookie) {
                self.tentracksAuthCookie = (cookie['name'] + '=' + cookie['value']);
            } else {
                self.tentracksAuthCookie = null;
            }
            for (var key in tabIds) {
                if (tabIds.hasOwnProperty(key)) {
                    chrome.tabs.sendRequest(tabIds[key], {
                        cookie: self.tentracksAuthCookie
                    });
                }
            }
        });
    };
}

chrome.tabs.onCreated.addListener(function(tab) {
    if (!cookieHandler.getAuthCookie()) {
        cookieHandler.extractAuthCookie();
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tentracksregexp.test(tab.url)) {
        cookieHandler.extractAuthCookie();
        return;
    }

    if (!cookieHandler.getAuthCookie()) {
        cookieHandler.extractAuthCookie();
    }

    var siteDetected = null;
    if (vkontakteregexp.test(tab.url)) {
        siteDetected = 'vkontakte';
    } else if (promodjregexp.test(tab.url)) {
        siteDetected = 'promodj';
    } else if (soundcloudregexp.test(tab.url)) {
        siteDetected = 'soundcloud';
    } else if (prostopleerregexp.test(tab.url)) {
        siteDetected = 'prostopleer';
    }

    if (siteDetected) {
        var f = function(){
            chrome.tabs.sendRequest(tabId, {
                detected: siteDetected,
                cookie: cookieHandler.tentracksAuthCookie
            });
        }

        if (window.localStorage) {
            var checkedSites = JSON.parse(localStorage.getItem('10tracks-extension-options'));
            checkedSites = checkedSites || [];
            if (checkedSites.indexOf(siteDetected) < 0 ) {
                return;
            } else {
                if (siteDetected == 'prostopleer') {
                    setTimeout(f, 1000);
                } else if (siteDetected == 'vkontakte'){
                    setTimeout(f, 500);
                } else {
                    f();
                }
            }
        } else {
            f();
        }
        if (tab.id) {
            tabIds[tab.id] = tab.id;
        } 
    }
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.action == 'upload'){
        var authCookie = cookieHandler.getAuthCookie();
        if (authCookie) {
            var site = request.site;
            var musicSourceName;
            if (site == 'vkontakte') {
                musicSourceName = chrome.i18n.getMessage("vkontakte");
            } else if (site == 'prostopleer') {
                musicSourceName = chrome.i18n.getMessage("prostopleer")
            } else if (site == 'promodj') {
                musicSourceName = chrome.i18n.getMessage("promodj");
            } else if (site == 'soundcloud') {
                musicSourceName = chrome.i18n.getMessage("soundcloud")
            }    

            if (site == 'vkontakte' || site == 'prostopleer' || site == 'soundcloud') {
                var xhr = new XMLHttpRequest();  
                xhr.open("GET", request.url, true);  
                xhr.responseType = "arraybuffer";  

                xhr.onload = function (oEvent) {
                    var arrayBuffer = xhr.response;
                    if (arrayBuffer) {
                        /*var blobBuilder = new (window.BlobBuilder || window.WebKitBlobBuilder);
                        blobBuilder.append(arrayBuffer);
                        var blob = blobBuilder.getBlob("audio/mpeg");*/
                        var blob = new Blob([arrayBuffer],{type:"audio/mpeg"});
                        
                        
                        if( typeof FormData == 'function') {
                            var fData = new FormData();
                            if (request.songMetadataOverride) {
                                fData.append('metadata_override', encodeURI(JSON.stringify(request.songMetadataOverride)));
                            }
                            fData.append('device_name', encodeURI(chrome.i18n.getMessage("internet")));
                            fData.append('music_source', encodeURI(musicSourceName));
                            fData.append('file', blob);

                            $.ajax({
                                type: "POST",
                                url: 'http://10tracks.com/api/tracks/file-nginx-source',
                                data: fData,
                                processData: false,
                                contentType: false,
                                success: function(data, textStatus, xmLHttpRequest){
                                    sendResponse({'status': 'upload_succeeded', 'metadata_override': request.songMetadataOverride});
                                    console.log('10tracks upload: succeeded');
                                },
                                error: function(xhr, ajaxOptions, thrownError){
                                    if (xhr.status == 403 && xhr.responseText == '"user-exceeded-limit"') {
                                        sendResponse({'status': 'upload_user_exceeded_limit', 'metadata_override': request.songMetadataOverride});
                                    } else {
                                        sendResponse({'status': 'upload_failed', 'metadata_override': request.songMetadataOverride});
                                    }
                                    console.log('10tracks upload: failed');
                                }
                            });
                            
                        }
                    } else {
                        sendResponse({'status': 'file_inaccessible', 'metadata_override': request.songMetadataOverride});
                        console.log('10tracks upload: arrayBuffer is empty');
                    }
                };
                xhr.onerror = function (e) {
                    sendResponse({'status': 'file_inaccessible', 'metadata_override': request.songMetadataOverride});
                    console.log('10tracks upload ['+site+']: failed', e);
                }
                xhr.send();
            } else {
                $.ajax({
                    type: "POST",
                    url: 'http://10tracks.com/api/upload/url',
                    data: {'url': request.url, 'device_name': chrome.i18n.getMessage("internet"), 'music_source': musicSourceName, 'metadata_override': JSON.stringify(request.songMetadataOverride)},
                    success: function(data, textStatus, xmLHttpRequest){
                        sendResponse({'status': 'job_added', 'metadata_override': request.songMetadataOverride});
                        console.log('10tracks upload: succeeded');
                    },
                    error: function(xhr, ajaxOptions, thrownError){
                        sendResponse({'status': 'job_not_added', 'metadata_override': request.songMetadataOverride});
                        console.log('10tracks upload: failed');
                    }
                });
            }
        } else {
            sendResponse({'status': 'not_authenticated', 'metadata_override': request.songMetadataOverride});
            console.log('10tracks upload: not authenticated.');
        }
    } else if (request.action == 'get_cookie') {
        window.open('http://10tracks.com','_blank');
        if (sender.tab && sender.tab.id) {
            tabIds[sender.tab.id] = sender.tab.id;
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    if (tabIds.hasOwnProperty(tabId)) {
        delete tabIds[tabId];
    }
});