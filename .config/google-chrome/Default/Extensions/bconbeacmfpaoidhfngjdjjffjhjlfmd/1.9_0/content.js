var countOfmatches = 0;

if(!document.getElementById("linksInfo_mqbwqQqZzB"))
{
	linksInfo();
	var showHideLinks=document.getElementById('linksInfo_mqbwqQqZzB');
	showHideLinks.addEventListener('click',linksListShowHide,false);	
}	
if(!document.getElementById("linksList_ugm9pqZ9rY"))
{
	linksList();
}
//var showHideLinks=document.getElementById('linksInfo_mqbwqQqZzB');
//showHideLinks.addEventListener('click',linksListShowHide,false);

chrome.extension.sendMessage({method: "getWordsList", key: "wordsList"}, function(response)
{
	var arrayOfWords = response.data.split(",");
	// if(document.getElementById("link_ugm9pqZ9rY"))
	// {
		// document.getElementById('linksList_ugm9pqZ9rY').removeChild(document.getElementById("link_ugm9pqZ9rY"));	
	// }
	//	 
	 for(var i=0; i<arrayOfWords.length; i++)
	 {
	 	var searchString = arrayOfWords[i];
	 	var lSpaces = /^\s+/g;
		var rSpaces = /\s+$/g;
		searchString = searchString.replace(lSpaces, '');
		searchString = searchString.replace(rSpaces, '');

	 	var replaceStr = '<span style="border-radius: 5px; padding: 2px; background-color: ';
		if(response.color == 'random')
		{
			replaceStr += get_random_color();
		}
		else
		{
			replaceStr += response.color;
		}	
	 	replaceStr += '; color: white; margin: 0px;" >' + searchString + '</span>';

		//countOfmatches = 0;

        findAndReplace(searchString, replaceStr);

        if(countOfmatches > 0)
        {
			if(countOfmatches > 5)
			{
				var obj = document.getElementById("linksList_ugm9pqZ9rY");
				obj.style.height = "50%";
			}
			document.getElementById('linksInfo_mqbwqQqZzB').style.display = 'block';
        	chrome.extension.sendMessage({method: "notification", key: searchString, count: countOfmatches} );
        }
	 }
});
function linksListShowHide()
{
	var obj_1 = document.getElementById('linksList_ugm9pqZ9rY');
	var obj_2 = document.getElementById('linksInfo_mqbwqQqZzB');
	
	if(obj_1.style.display == 'none')
	{
		obj_1.style.display = 'block';
		obj_2.innerHTML = chrome.i18n.getMessage("hideLinks");;
	}
	else
	{
		obj_1.style.display = 'none';
		obj_2.innerHTML = chrome.i18n.getMessage("showLinks");;
	}
}
function createLinksInfo(data, anchor)
{

	//
	var div = document.createElement('div');
	div.setAttribute('id', "link_ugm9pqZ9rY");
	div.style.margin = "10px 0px 10px 0px";
	div.style.padding = "10px";
	div.style.display = "block";
	div.style.position = "relative";
	div.style.borderRadius = "5px";
	//div.style.boxShadow = "1px 1px 5px black";
	//div.style.zIndex = "10000";
	div.style.background = "white";
	div.style.border = "1px solid white";
	div.style.color = "black";
	div.style.font = "Verdana, Arial, Helvetica, sans-serif";
	div.style.fontSize = "12px";
	div.style.wordWrap = "break-word";
	//div.style.width = "280px";
	div.style.textAlign = "left";
	var imgUrl = chrome.extension.getURL('pic/link.png');
	
	//alert(data);
	div.innerHTML = '<a href=#'+anchor+'><img src="'+imgUrl+'" border=0></a> '+data;
	
	document.getElementById("linksList_ugm9pqZ9rY").appendChild(div);
}
function linksList()
{
	var div = document.createElement('div');
	div.setAttribute('id', "linksList_ugm9pqZ9rY");
	//div.style.margin = "10px";
	div.style.padding = "10px";
	div.style.display = "none";
	div.style.position = "fixed";
	div.style.bottom = "37px";
	div.style.right = "10px";
	div.style.borderRadius = "0px";
	div.style.border = "2px solid #666666";
	div.style.boxShadow = "1px 1px 5px #888888";
	div.style.zIndex = "10000";
	//div.style.background = "#336699";
	div.style.color = "white";
	//div.style.font = "Verdana, Arial, Helvetica, sans-serif";
	//div.style.fontSize = "16px";
	div.style.width = "300px";
	//div.style.height = "50%";
	div.style.overflow = "auto";
	//div.innerHTML = "Show";
	var bgImg = chrome.extension.getURL('pic/bg.png');
	div.style.backgroundImage = "url('"+bgImg+"')";
	
	document.body.appendChild(div);
}
function linksInfo()
{
	var div = document.createElement('div');
	div.setAttribute('id', "linksInfo_mqbwqQqZzB");
	div.style.margin = "0px";
	div.style.padding = "5px";
	div.style.display = "none";
	div.style.position = "fixed";
	div.style.bottom = "0px";
	div.style.right = "10px";
	div.style.borderRadius = "5px 5px 0px 0px";
	div.style.boxShadow = "1px 1px 5px #888888";
	div.style.zIndex = "10000";
	//div.style.background = "#336699";
	div.style.color = "white";
	div.style.font = "Verdana, Arial, Helvetica, sans-serif";
	div.style.fontSize = "16px";
	div.style.cursor = "pointer";
	div.style.textAlign = "center";
	div.style.width = "100px";
	div.innerHTML = chrome.i18n.getMessage("showLinks");
	
	var bgImg = chrome.extension.getURL('pic/bg.png');
	div.style.backgroundImage = "url('"+bgImg+"')";
	
	document.body.appendChild(div);
}

//
function findAndReplace(searchText, replacement, searchNode) {
    if (!searchText || typeof replacement === 'undefined')
    {
         return;
    }
    var regex = typeof searchText === 'string' ? new RegExp(searchText, 'gim') : searchText;
    var childNodes = (searchNode || document.body).childNodes;
    var cnLength = childNodes.length;
    excludes = 'html,head,style,title,link,script,object,iframe';
	
    while (cnLength--)
    {
        var currentNode = childNodes[cnLength];

		if (currentNode.nodeType === 1 && (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) 
		{
            arguments.callee(searchText, replacement, currentNode);
        }
        if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) 
		{
            continue;
        }		

//
		var parent = currentNode.parentNode;
		
		var matchId = GUID();
		//var anchor = '<a name='+matchId+' id="'+matchId+'"></a>';
		var html = currentNode.data.replace(regex, '<a name='+matchId+' id="'+matchId+'" style="cursor: pointer;">'+replacement+'</a>');
		
		frag = (function()
		{
			wrap = document.createElement('div'),
			frag = document.createDocumentFragment();
			wrap.innerHTML = html;
			while (wrap.firstChild) 
			{
				frag.appendChild(wrap.firstChild);
			}
			return frag;
		})();
		parent.insertBefore(frag, currentNode);
		parent.removeChild(currentNode);

		//	
		var arrayOfMatch = currentNode.data.match(regex);
		countOfmatches += arrayOfMatch.length;	
		
		//
		var srtMaxLength = 500;
		if(html.length > srtMaxLength)
		{
			html = html.substr(0,srtMaxLength);
			html += ' [...]';
		}

		createLinksInfo(html, matchId);	

//		
	}
}
//
function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}
function GUID()
{
    var S4 = function ()
    {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
    };

    return (S4() + S4());
}

//

