function i18n() {
    document.title = chrome.i18n.getMessage('optionsTitle');
    $('.ttmain h2 b').text(chrome.i18n.getMessage('chooseSitesTextPart1'));
    $('.ttmain h2 span').text(chrome.i18n.getMessage('chooseSitesTextPart2'));
    $(':submit').val(chrome.i18n.getMessage('saveOptions'));
    $('.ttheader h1').text(chrome.i18n.getMessage('optionsTitle'));
}


// Saves options to localStorage.
function saveOptions() {
    var checkedSites = []
    $('input:checked').each(function(i, element) {
        checkedSites.push($(element).val());
    });
    if (window.localStorage) {
        localStorage.setItem('10tracks-extension-options', JSON.stringify(checkedSites));
    } else {
        alert("Options can't be saved due to missing localStorage support.");
    }
    window.close();
}

// Restores select box state to saved value from localStorage.
function restoreOptions() {
    if (window.localStorage) {
        var checkedSites = JSON.parse(localStorage.getItem('10tracks-extension-options'));
        checkedSites = checkedSites || [];
        for(var i=0; i<checkedSites.length; i++) {
            $('input:checkbox[value*=' + checkedSites[i] + ']').attr('checked','checked');
        }
    } else {
        alert("Options can't be read due to missing localStorage support.");
    }
}

$(document).ready(function() {
    i18n();
    $(':submit').click(saveOptions);
    restoreOptions();
    $('.ttclose').click(function(){
        window.close();
    })
});