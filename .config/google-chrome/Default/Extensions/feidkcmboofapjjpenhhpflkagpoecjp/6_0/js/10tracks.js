var loginTooltipContent =
'<div class="triangle-border">\
<table class="ttinside">\
<tr>\
<td class="ttsmalllogo"></td>\
<td class="tttext">' + chrome.i18n.getMessage("loginOffer") + '</td>\
<td class="ttnext"></td>\
</tr>\
</table>\
</div>';

var vkAddToTentracksTooltip = chrome.i18n.getMessage("vkAddToTentracks");

var tentracksAuthCookie;

function uploadMusic(e, url, site, metadataOverride) {
    if (tentracksAuthCookie) {
        var qtip = $('.qtip');
        if (qtip) {
            $(qtip).qtip('destroy');
        }
        var requestData = {
            'action': 'upload',
            'url': url,
            'site': site,
            'songMetadataOverride': metadataOverride
        }
        processUploadResponse({'status': 'upload_started', 'metadata_override': metadataOverride});
        chrome.extension.sendRequest(requestData, processUploadResponse);
    } else {
        var target = getClickEventTarget(e);
        prepareLoginTooltip(target);
        $(target).qtip('show');
    }
    e.preventDefault();
    return false;
}

function processUploadResponse(response) {
    if (response && response.status) {
        var notificationContent;
        var title, message;
        if (response.metadata_override) {
            if (response.metadata_override['album_artist']) {
                title = response.metadata_override['album_artist'];
            }
            if (response.metadata_override['title']) {
                if (title) {
                    title = title + ' – ' + response.metadata_override['title'];
                } else {
                    title = response.metadata_override['title'];
                }
            }
        }
        switch (response.status) {
            case 'upload_started':
                message = chrome.i18n.getMessage("uploadStarted");
                break;
            case 'job_added':
                message = chrome.i18n.getMessage("uploadJobAdded");
                break;
            case 'job_not_added':
                message = chrome.i18n.getMessage("uploadJobNotAdded");
                break;
            case 'upload_failed':
                message = chrome.i18n.getMessage("uploadFailed");
                break;
            case 'upload_succeeded':
                message = chrome.i18n.getMessage("uploadSucceeded");
                break;
            case 'not_authenticated':
                message = chrome.i18n.getMessage("uploadNotAuthenticated");
                break;
            case 'upload_user_exceeded_limit':
                message = chrome.i18n.getMessage("userExceededLimit");
                break;
            case 'get_url_failed':
                message = chrome.i18n.getMessage("extractingDownloadUrlFailed");
                break;
            case 'file_inaccessible':
                message = chrome.i18n.getMessage("fileInaccessible");
                break;
        }
        if (title) {
            notificationContent = '<div class="notification-title">' + title + '</div>';
        }
        if (message) {
            if (notificationContent) {
                notificationContent = notificationContent + '<div class="notification-message">' + message + '</div>';
            } else {
                notificationContent = '<div class="notification-message">' + message + '</div>';
            }
        }
        if (notificationContent) {
            $.noty({layout: 'topRight', theme: 'noty_theme_default', type: 'notification', text: notificationContent, timeout: 5000});
        }
    }
}

function getClickEventTarget(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) { // defeat Safari bug
        targ = targ.parentNode;
    }
    return targ;
}

function extractSongMetadataFromTitle(title) {
    var songMetadata = {};
    var indexOfDash = title.indexOf('-');
    if (indexOfDash > 0) {
        songMetadata['albumArtist'] = title.substring(0, indexOfDash).trim();
        songMetadata['songTitle'] = title.substring(indexOfDash + 1).trim();
    } else {
        indexOfDash = title.indexOf('–');
        if (indexOfDash > 0) {
            songMetadata['albumArtist'] = title.substring(0, indexOfDash).trim();
            songMetadata['songTitle'] = title.substring(indexOfDash + 1).trim();
        } else {            
            songMetadata['albumArtist'] = title;
        }
    }
    return songMetadata;
};    

function vk_handler() {
    this.init = function() {

        var self = this;
        var item;

        self.processFirst(self);

        var eHandler = function(e) {
            if (e.target.className && e.target.className.indexOf('audio') > -1) {
                self.processFirst(self);
                return;
            }

            if ($('.audio', $(e.target)).length > 0) {
                self.processFirst(self);
            }
        };

        document.addEventListener('DOMNodeInserted', eHandler);
    };

    this.processFirst = function(self) {
        $('.audio').each(function(i, element) {
            self.processItem($(element));
        });
    };

    this.processItem = function(item) {
        if (item.get(0).id != 'audio_global') //if not player box
        { 
            if (item.data('with_url') !== true) {
                item.data('with_url', true);
                this.addButton(item);
            }
        }
    };
    
    this.getButton = function(url, ttl, buttonAreaStyle) {
        var downloadAttr = '';

        if (!this.oldNames)
            downloadAttr = 'download="' + ttl.replace(/[\.,\"]/gi, "_") + '.mp3"';

        var downloadButton = '<div class="' + buttonAreaStyle + ' download-button fl_r" onmouseover="Audio.rowActive(this, \'' + vkAddToTentracksTooltip + '\', [9, 5, 0]);" onmouseout="Audio.rowInactive(this);" style="opacity: 0.4;"><div class="vkontakte-download-button"></div></div>';
        return downloadButton;
    };

    this.addButton = function(mainBox) {
        var urlData = null;
        var url = null;
        var ttl = null;
        var ttlWrapper = null;
        var self = this;
        var ht = null;
        var titleCache = '';
        var kbps = '';
        var weight = '';
        var downloadButton = null;

        mainBox.ready(function() {
            ttlWrapper = $('div[class*="title_wrap"]', mainBox);
            
            try {
                $('.user', ttlWrapper).remove();
            } catch (e) {
                console.log(e);
            }

            ttl = ttlWrapper.text().trim();

            urlData = $('input[type="hidden"]', mainBox).val().split(',');
            url = urlData[0];

            var audioEditWrap = $('div[class*="audio_edit_wrap"]', mainBox);
            if (audioEditWrap && audioEditWrap.length > 0) {
                downloadButton = self.getButton(url, ttl, 'vkontakte-download-button-playlist');
                try {
                    ttlWrapper.css('width','310px');
                } catch (e) {
                    console.log(e);
                }
                audioEditWrap.after(downloadButton);
            } else {
                var audioAddWrap = $('div[class*="audio_add_wrap"]', mainBox);
                if (audioAddWrap && audioAddWrap.length > 0) {
                    downloadButton = self.getButton(url, ttl, 'vkontakte-download-button-search-results');
                    try {
                        ttlWrapper.css('width','325px');
                    } catch (e) {
                        console.log(e);
                    }
                    audioAddWrap.after(downloadButton);
                } else {
                    var actionsArea = $('div[class*="actions"]', mainBox);
                    if (actionsArea && actionsArea.length > 0) {
                        actionsArea.css({'display': 'block','position':'absolute','right':'30px'});
                        downloadButton = self.getButton(url, ttl, 'vkontakte-download-button-player');
                        actionsArea.append(downloadButton);
                    }
                }
            }

            $('div.download-button div.vkontakte-download-button', mainBox).on("click", function(e) {
                var albumArtist = $('a', ttlWrapper).filter(':first').text().trim();
                var songTitle = $('.title', ttlWrapper).text().trim();
                var songMetadataOverride = {};
                if (albumArtist) {
                   songMetadataOverride['album_artist'] = albumArtist;
                   songMetadataOverride['song_artist'] = albumArtist;
                }
                if (songTitle) {
                    songMetadataOverride['title'] = songTitle;
                }

                uploadMusic(e, url, "vkontakte", songMetadataOverride);

                return false;
            });
        });
    }
}

function prostopleer_handler() {
    this.init = function() {
        $('.prostopleer-download-button').remove();
        var self = this;

        $('div[class*="track-wrapper clearfix"]').parents('li').each(function(i, element) {
            self.processItem(element);
        });
    };

    this.processItem = function(item) {
        var link = $(item).attr('link');

        if (link) {
            var downloadButton = $('<div class="icon"><a href="#" class="prostopleer-download-button"></a></div>');
            $(downloadButton).on("click", function(e) {
                var songMetadataOverride = {};
                try {
                    var albumArtist = $(item).attr("singer").trim();
                    var songTitle = $(item).attr("song").trim();
                    if (!albumArtist || !songTitle) {
                        var trackMain = $('div[class~="track-main"]', item);
                        if (trackMain.length > 0) {
                            if (!albumArtist) {
                                albumArtist = $('a[class~="artist"]', trackMain).text().trim();
                            }
                            if (!songTitle) {
                                songTitle = $('a[class~="title"]', trackMain).text().trim();
                            }
                        }
                    }
                    if (albumArtist) {
                        songMetadataOverride['album_artist'] = albumArtist;
                    }
                    if (songTitle) {
                        songMetadataOverride['title'] = songTitle;
                    }
                } catch (e) {
                    console.log('extracting song metadata failed: ', e);
                }

                $.ajax({
                    type : "POST",
                    url : 'http://prostopleer.com/site_api/files/get_url',
                    data : {'action': 'download', 'id': link},
                    success : function(data, textStatus, xmLHttpRequest) {
                        if (data && data['success'] && data['track_link']) {
                            uploadMusic(e, data['track_link'], "prostopleer", songMetadataOverride);
                        } else {
                            processUploadResponse({
                                'status' : 'get_url_failed',
                                'metadata_override' : songMetadataOverride
                            });
                        }
                    },
                    error : function(xhr, ajaxOptions, thrownError) {
                        processUploadResponse({
                            'status' : 'get_url_failed',
                            'metadata_override' : songMetadataOverride
                        });
                        console.log('get_url failed', thrownError);
                    }
                });
                e.preventDefault();
            });
            $('div.track-time', item).before(downloadButton);
        }
    }

};


function promodj_handler() {
    var self = this;

    this.init = function() {
        var a = $('div.playerr_standard a.playerr_bigdownloadbutton');
        var url = $(a).attr('href');
        var djUniversal = $('div.dj_universal');

        if (url && djUniversal.length > 0) {
            var downloadButton = $('<a href="#" class="promodj-download-button-single"></a>');
            $(downloadButton).on("click", function(e) {
                var songMetadataOverride = {};
                var albumArtist = null;
                var songTitle = null;
                try {
                    var tmpAlbumArtist = $('.dj_menu_title').text().trim();
                    var genericTitle = null;
                    try {
                        var x = $('.generic_title h5', djUniversal);
                        if (x.length > 0) {
                            x = x[0].firstChild;
                            if (x) {
                                genericTitle = x.data;                                
                            }
                        }                            
                    } catch (e) {
                        console.log(e);                        
                    }
                    if (!genericTitle) {
                        genericTitle = $('img.avatar', djUniversal).attr('ambatitle')
                    }
                    if (genericTitle) {
                        genericTitle = genericTitle.trim();
                    }

                    var songMetadata = extractSongMetadataFromTitle(genericTitle);
                    if (songMetadata['songTitle'] && songMetadata['albumArtist']) {
                        songTitle = songMetadata['songTitle'];
                        albumArtist = songMetadata['albumArtist'];
                    } else {
                        if (tmpAlbumArtist) {
                            var i = genericTitle.indexOf(tmpAlbumArtist);
                            if (i >= 0) {
                                var endOfAlbumArtist = i + tmpAlbumArtist.length;
                                if (endOfAlbumArtist < genericTitle.length) {
                                    var indexOfDash = genericTitle.indexOf('-', endOfAlbumArtist);
                                    if (indexOfDash < 0) {
                                        indexOfDash = genericTitle.indexOf('–', endOfAlbumArtist);
                                    }
                                    if (indexOfDash > 0) {
                                        albumArtist = genericTitle.substring(0, indexOfDash).trim();
                                        songTitle = genericTitle.substring(indexOfDash + 1).trim();
                                    }
                                }
                            }
                            if (!albumArtist) {
                                albumArtist = tmpAlbumArtist;
                            }
                            if (!songTitle) {
                                songTitle = genericTitle;
                            }
                        } else {
                            albumArtist = genericTitle;
                        }
                    }
                } catch(e) {
                    console.log(e);
                }

                if (albumArtist) {
                    songMetadataOverride['album_artist'] = albumArtist;
                }
                if (songTitle) {
                    songMetadataOverride['title'] = songTitle;
                }

                uploadMusic(e, url, "promodj", songMetadataOverride);
                e.preventDefault();
            });
            $('div.post_tool_hover', djUniversal).append(downloadButton);
        }

        $('div[class~="track2"]').each(function(i, element) {
            self.processTrackItem(element);
        });

        $('div[class~="track_clickable"]').each(function(i, element) {
            self.processTrackClickableItem(element);
        });
    }; 

    this.processTrackItem = function(item, reattempt) {
        $(item).ready(function() {
            var a = $('a.playerr_bigdownloadbutton', item);
            var url = a.attr('href');
            if (url) {
                var downloadButton = $('<a href="#" class="promodj-download-button-track2-square"></a>');
                $(downloadButton).on("click", function(e) {
                    var songMetadataOverride = {};
                    try {
                        var titleData = $('div[class~="title"]', item).text().trim();
                        var songMetadata = extractSongMetadataFromTitle(titleData);
                        if (songMetadata['songTitle']) {
                            songMetadataOverride['title'] = songMetadata['songTitle'];
                        }
                        if (songMetadata['albumArtist']) {
                            songMetadataOverride['album_artist'] = songMetadata['albumArtist'];
                        }
                    } catch (e) {
                        console.log('extracting song metadata failed: ', e);
                    }

                    uploadMusic(e, url, "promodj", songMetadataOverride);
                    e.preventDefault();
                });
                try {
                    a.css('margin-top', '5px');
                } catch (e) {
                    //console.log(e);
                }
                $('div.playerr_bigdownloadbutton', item).append(downloadButton);
            } else {
                console.log('url not found: ', item);
                if (!reattempt) {
                    console.log('try one more time later');
                    setTimeout(function() {
                        self.processTrackItem(item, true);
                    }, 3000);
                }
            }
        })
    }; 

    this.processTrackClickableItem = function(item, reattempt) {
        $(item).ready(function() {
            var downloadElement = $('div[class~="icons"] .downloads_count', item);
            var a = $('a', downloadElement);
            var url = a.attr('href');
            if (url) {
                var downloadButton = $('<a href="#" class="promodj-download-button-track-clickable-square"></a>');
                $(downloadButton).on("click", function(e) {
                    var songMetadataOverride = {};
                    try {
                        var titleDiv = $('div[class~="title"]', item);
                        var titleData = $('a', titleDiv).filter(':first').text().trim();
                        var songMetadata = extractSongMetadataFromTitle(titleData);
                        if (songMetadata['songTitle']) {
                            songMetadataOverride['title'] = songMetadata['songTitle'];
                        }
                        if (songMetadata['albumArtist']) {
                            songMetadataOverride['album_artist'] = songMetadata['albumArtist'];
                        }
                    } catch (e) {
                        console.log('extracting song metadata failed: ', e);
                    }

                    uploadMusic(e, url, "promodj", songMetadataOverride);
                    e.preventDefault();
                    return false;
                });
                $(downloadElement).append(downloadButton);
            }
        })
    }; 
};



function soundcloud_handler() {
    this.init = function() {
        var self = this;

        $('ul.tracks-list li.player div[class*="medium mode player"]').each(function(i, element) {
            self.processItem(element);
        });
    };

    this.processItem = function(item) {
        //var scriptContent = $('div.actionbar:first', item).nextAll('script:first').text();
        //scriptContent=scriptContent.match(/push\((.+)\);/)[1];
        //var audioInfo=$.parseJSON(scriptContent);
        //var url = audioInfo.streamUrl.replace("http://media.soundcloud.com/stream","http://media.soundcloud.com/../stream");
        var url = $('div[class~="download-options"] a', item).attr('href');

        if (url) {
            url = 'http://soundcloud.com' + url;
            var downloadButton = $('<a href="#" class="soundcloud-download-button"></a>');
            $(downloadButton).on("click", function(e) {
                var songMetadataOverride = {};
                try {
                    var titleDiv = $('div[class~="info-header"]', item);
                    var titleData = $('h3 a', titleDiv).text().trim();
                    var songMetadata = extractSongMetadataFromTitle(titleData);
                    if (songMetadata['songTitle']) {
                        songMetadataOverride['title'] = songMetadata['songTitle'];
                    }
                    if (songMetadata['albumArtist']) {
                        songMetadataOverride['album_artist'] = songMetadata['albumArtist'];
                    }
                } catch (e) {
                    console.log('extracting song metadata failed: ', e);
                }

                uploadMusic(e, url, "soundcloud", songMetadataOverride);
                e.preventDefault();
            });
            $('.info-header .meta-data', item).append(downloadButton);
        }
    };
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var site = request.detected;
    tentracksAuthCookie = request.cookie;
    if (tentracksAuthCookie) {
        var qtip = $('.qtip');
        if (qtip) {
            $(qtip).qtip('destroy');
        }
    }
    if (site == 'vkontakte') {
        var vk = new vk_handler();
        vk.init();
    } else if (site == 'prostopleer') {
        var pp = new prostopleer_handler();
        pp.init();
    } else if (site == 'promodj') {
        var pd = new promodj_handler();
        pd.init();
    } else if (site == 'soundcloud') {
        var sc = new soundcloud_handler();
        sc.init();
    }
});

function prepareLoginTooltip(target) {
    $(target).qtip({
        content: {
            text: loginTooltipContent
        }
        ,style: {
            def: false,
            tip: {
                corner: false
            }
        }
        ,show: {
            solo: true,
            event: 'click'
        }
        ,overwrite: true
        ,hide: {
            fixed: true,
            event: 'unfocus'
        }
        ,position: {
            my: 'bottom left',
            at: 'top left',
            adjust: {
               x: -43,
               y: -4
            }
        }
        ,events: {
            show: function(event, api) {
                var tooltip = api.elements.tooltip;
                $('.ttinside', tooltip).unbind("click").one("click", function(e){
                    $(tooltip).hide();
                    e.preventDefault();
                    return false;
                })
                $('.ttnext', tooltip).unbind("click").one("click", function(e) {
                    $(tooltip).hide();
                    var requestData = {
                        'action': 'get_cookie'
                    }
                    chrome.extension.sendRequest(requestData);
                    e.preventDefault();
                    return false;
                });
            }
        }
    });
}
