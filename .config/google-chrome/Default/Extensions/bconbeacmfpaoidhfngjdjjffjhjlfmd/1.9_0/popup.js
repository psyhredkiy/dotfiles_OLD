//var defReloadTime = '60';
var defwordsList = chrome.i18n.getMessage("defwordsList");
var defextActiveYesNo = '1';

var saveDesc = chrome.i18n.getMessage("saveDesc");
document.getElementById("save").innerHTML = saveDesc;

var extSettingsDesc = chrome.i18n.getMessage("extSettingsDesc");
document.getElementById("extSettings").innerHTML = extSettingsDesc;

document.getElementById("wordsList").value = (localStorage["wordsList"] === undefined) ? defwordsList : localStorage["wordsList"];
//

//
var extActiveYesNoSave = (localStorage["extActiveYesNo"] === undefined) ? defextActiveYesNo : localStorage["extActiveYesNo"];
var extActiveYesNo = document.getElementById("extActiveYesNo");
for (var i = 0; i < extActiveYesNo.children.length; i++)
{
	var child = extActiveYesNo.children[i];
	if (child.value == extActiveYesNoSave)
	{
		child.selected = "true";
		break;
	}
}
//
document.getElementById("extActiveYesNoImg").style.background = (extActiveYesNoSave == 1) ? 'green' : 'red';
//
function saveOptions()
{
	localStorage["wordsList"] = document.getElementById("wordsList").value;
	localStorage["voiceMessage"] = (localStorage["voiceMessage"] === undefined) ? 'YES' : localStorage["voiceMessage"];
	localStorage["colorOfMessage"] = (localStorage["colorOfMessage"] === undefined) ? 'red' : localStorage["colorOfMessage"];
	localStorage["delayOfMessage"] = (localStorage["delayOfMessage"] === undefined) ? '3' : localStorage["delayOfMessage"];
	localStorage["voiceMessageYesNo"] = (localStorage["voiceMessageYesNo"] === undefined) ? '1' : localStorage["voiceMessageYesNo"];

//
	var extActiveYesNo = document.getElementById("extActiveYesNo");
	localStorage["extActiveYesNo"] = extActiveYesNo.children[extActiveYesNo.selectedIndex].value;
//

	chrome.tabs.getCurrent(function(tab){
		chrome.tabs.reload();
	})
	//chrome.extension.sendMessage({method: "startContent"} );
	//chrome.tabs.executeScript(null, {file: "content.js"});
	
	document.getElementById("saveResult").style.display = "block";
	document.getElementById("saveResult").innerHTML = chrome.i18n.getMessage("saveResultDesc");
	setTimeout(seccusResult,3000);
}
function seccusResult()
{
	document.getElementById("saveResult").innerHTML = "";
	document.getElementById("saveResult").style.display = "none";


}

function gotoSettingsPage(info, tab)
{
	chrome.tabs.create(
	{
		"url" : "options.html"
	});
}

var on_save=document.getElementById('save');
on_save.addEventListener('click',saveOptions,false);

var on_extSettings=document.getElementById('extSettings');
on_extSettings.addEventListener('click',gotoSettingsPage,false);
