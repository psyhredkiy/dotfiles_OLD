var defWordsList = chrome.i18n.getMessage("defwordsList");
var defColorOfMessage = 'red';
var defDelayOfMessage = '3';
var defvoiceMessageYesNo = '1'; // Yes
var defVoiceMessage = 'yes';
var defextActiveYesNo = '1';

//
var wordListDesc = chrome.i18n.getMessage("wordListDesc");
document.getElementById("wordListDesc").innerHTML = wordListDesc;

var extActiveYesNoDesc = chrome.i18n.getMessage("extActiveYesNoDesc");
document.getElementById("extActiveYesNoDesc").innerHTML = extActiveYesNoDesc;

var delayOfMessageDesc = chrome.i18n.getMessage("delayOfMessageDesc");
document.getElementById("delayOfMessageDesc").innerHTML = delayOfMessageDesc;

var voiceMessageYesNoDesc = chrome.i18n.getMessage("voiceMessageYesNoDesc");
document.getElementById("voiceMessageYesNoDesc").innerHTML = voiceMessageYesNoDesc;

var voiceMessageDesc = chrome.i18n.getMessage("voiceMessageDesc");
document.getElementById("voiceMessageDesc").innerHTML = voiceMessageDesc;

var colorOfMessageDesc = chrome.i18n.getMessage("colorOfMessageDesc");
document.getElementById("colorOfMessageDesc").innerHTML = colorOfMessageDesc;

var saveDesc = chrome.i18n.getMessage("saveDesc");
document.getElementById("save").innerHTML = saveDesc;

//

document.getElementById("colorRandom").checked = (localStorage["colorRandom"] === undefined) ? false : true;

document.getElementById("wordsList").value = (localStorage["wordsList"] === undefined) ? defWordsList : localStorage["wordsList"];
document.getElementById("colorOfMessage").value = (localStorage["colorOfMessage"] === undefined) ? defColorOfMessage : localStorage["colorOfMessage"];
document.getElementById("voiceMessage").value = (localStorage["voiceMessage"] === undefined) ? defVoiceMessage : localStorage["voiceMessage"];

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
var delayOfMessageSave = (localStorage["delayOfMessage"] === undefined) ? defDelayOfMessage : localStorage["delayOfMessage"];
var delayOfMessage = document.getElementById("delayOfMessage");
for (var i = 0; i < delayOfMessage.children.length; i++)
{
	var child = delayOfMessage.children[i];
	if (child.value == delayOfMessageSave)
	{
		child.selected = "true";
		break;
	}
}
//
var voiceMessageYesNoSave = (localStorage["voiceMessageYesNo"] === undefined) ? defvoiceMessageYesNo : localStorage["voiceMessageYesNo"];
var voiceMessageYesNo = document.getElementById("voiceMessageYesNo");
for (var i = 0; i < voiceMessageYesNo.children.length; i++)
{
	var child = voiceMessageYesNo.children[i];
	if (child.value == voiceMessageYesNoSave)
	{
		child.selected = "true";
		break;
	}
}
//

//function sendOptions()
//{
//	chrome.extension.sendMessage({method:"options"});
//}


function saveOptions()
{
	if(document.getElementById("colorRandom").checked)
	{
		localStorage["colorRandom"] = 1;
	}
	else
	{
		if(localStorage["colorRandom"] == 1)
		{
			localStorage.removeItem("colorRandom");
		}	
	}
	//
	localStorage["wordsList"] = document.getElementById("wordsList").value;
	localStorage["voiceMessage"] = document.getElementById("voiceMessage").value;
	localStorage["colorOfMessage"] = document.getElementById("colorOfMessage").value;

	var delayOfMessage = document.getElementById("delayOfMessage");
	localStorage["delayOfMessage"] = delayOfMessage.children[delayOfMessage.selectedIndex].value;

//
	var extActiveYesNo = document.getElementById("extActiveYesNo");
	localStorage["extActiveYesNo"] = extActiveYesNo.children[extActiveYesNo.selectedIndex].value;
//

	var voiceMessageYesNo = document.getElementById("voiceMessageYesNo");
	localStorage["voiceMessageYesNo"] = voiceMessageYesNo.children[voiceMessageYesNo.selectedIndex].value;

	document.getElementById("saveResult").style.display = "block";
	document.getElementById("saveResult").innerHTML = chrome.i18n.getMessage("saveResultDesc");
	setTimeout(seccusResult,3000);
}

function seccusResult()
{
	document.getElementById("saveResult").innerHTML = "";
	document.getElementById("saveResult").style.display = "none";
}

var on_save=document.getElementById('save');
on_save.addEventListener('click',saveOptions,false);

