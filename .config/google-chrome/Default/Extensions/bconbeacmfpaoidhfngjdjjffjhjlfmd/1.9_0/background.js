//
//chrome.tabs.executeScript(null, {file: "content.js"});
//chrome.browserAction.onClicked.addListener(function(tab) {
//alert(tab.id + ':'+ tab.url);
//chrome.tabs.executeScript(tab.id, {file: "content.js"});
//});

createDefMenu();

chrome.extension.onMessage.addListener(
function(message, sender, sendResponse)
{
	if(message.method == 'getWordsList')
	{
		if(localStorage["extActiveYesNo"] > 0)
		{
			var color = localStorage["colorOfMessage"];
			if(localStorage["colorRandom"])
			{
				color = 'random';
			}		
			if(localStorage["contextMenusWord"])
			{
				sendResponse({data: localStorage["contextMenusWord"], color: color});
				localStorage.removeItem("contextMenusWord"); 
			}
			else
			{
				sendResponse({data: localStorage[message.key], color: color});
			}	
		}
	}
	else if (message.method == 'notification')
	{
				if(localStorage["delayOfMessage"]>0)
				{
					var timerTime = localStorage["delayOfMessage"] * 1000;
					var notification = webkitNotifications.createNotification(
						'pic/icon_4848.png',  // icon url - can be relative
						'' ,  // notification title
						'Найдено совпадений ['+message.count+'] для фразы [' + message.key + '] на странице '+sender.tab.url  // notification body text
					);
					notification.show();
					setTimeout(function(){
					notification.cancel();
					}, timerTime);
				}
				else if(localStorage["delayOfMessage"] == 0)
				{
					var notification = webkitNotifications.createNotification(
						'pic/icon_4848.png',  // icon url - can be relative
						'' ,  // notification title
						'Найдено совпадений ['+message.count+'] для фразы [' + message.key + '] на странице '+sender.tab.url  // notification body text
					);
					notification.show();
				}
				if(localStorage["voiceMessageYesNo"] == 1)
				{
					chrome.tts.speak(localStorage["voiceMessage"]);
				}
	}
	// else if (message.method == 'startContent')
	// {
		// chrome.tabs.executeScript(null, {file: "content.js"});
	// }
	else
	{
		sendResponse({});
	}
}
)
//
function createDefMenu()
{
chrome.contextMenus.create(
	{
		"title" : chrome.i18n.getMessage("contextMenusName")+" \"%s\" ",
		"contexts" : ["selection"],
		"id" : "addtokeys",
		"onclick" : addToKeys
	});
}
//
function addToKeys(info, tab)
{
	if(localStorage["wordsList"] && localStorage["wordsList"] != '')
	{
		localStorage["wordsList"] +=',' +info.selectionText;
	}
	else
	{
		localStorage["wordsList"] = info.selectionText;
	}	
	localStorage["contextMenusWord"] = info.selectionText;
	chrome.tabs.executeScript(null, {file: "content.js"});
	//chrome.extension.sendMessage({method: "startContent"} );
}
