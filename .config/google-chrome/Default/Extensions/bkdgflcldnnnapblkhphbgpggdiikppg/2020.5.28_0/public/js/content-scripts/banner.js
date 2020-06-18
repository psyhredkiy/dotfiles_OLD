(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var consts = require('./consts.es6');
var id = consts.BANNER_ID;
var logoUrl = chrome.runtime.getURL('img/banner/logo-round.svg');

module.exports = '\n<div id="' + id + '" class="' + id + ' ' + consts.IS_ANIMATING_CLASS + ' slideIn">\n    <div class="' + id + '-inner">\n        <img class="' + id + '__logo" src="' + logoUrl + '"></img>\n        <div class="' + id + '__content">\n            <div class="js-' + id + '-title ' + id + '__title">\n            Google can use your searches\n            <br>\n            to profile you.\n            </div>\n        </div>\n    </div>\n    <div class="' + id + '__buttons">\n        <span class="js-' + id + '-more ' + id + '__btn">See More</span>\n        <span class="js-' + id + '-close ' + id + '__close">Dismiss</span>\n    </div>\n</div>\n';

},{"./consts.es6":2}],2:[function(require,module,exports){
'use strict';

// HTML

var BANNER_ID = 'ddgb';
var MODAL_ID = 'ddgm';
var HIDDEN_CLASS = 'is-hidden';
var BLUR_CLASS = 'is-blurred';
var HAS_BANNER_CLASS = 'has-ddg-banner';
var IS_ANIMATING_CLASS = 'is-animating';
var HAS_MODAL_CLASS = 'has-ddg-modal';

// Pixels
var BANNER_IMPRESSION = 'ebi';
var BANNER_CLICK = 'ebc';
var BANNER_DISMISS = 'ebx';
var MODAL_CLICK = 'emc';

// Icons
var CLOSE_ICON = '<path fill-rule="evenodd" clip-rule="evenodd" d="M8.21694 0.188564L5 3.4055L1.78306 0.188564C1.5337 -0.0608011 1.14698 -0.0608011 0.897615 0.188564L0.187024 0.899156C-0.0623413 1.14852 -0.0623413 1.53524 0.187024 1.7846L3.40396 5.00154L0.199742 8.20576C-0.0496235 8.45513 -0.0496235 8.84184 0.199742 9.09121L0.910333 9.8018C1.1597 10.0512 1.54641 10.0512 1.79578 9.8018L5 6.57227L8.21694 9.78921C8.4663 10.0386 8.85302 10.0386 9.10238 9.78921L9.81298 9.07861C10.0623 8.82925 10.0623 8.44253 9.81298 8.19317L6.58345 4.98895L9.80038 1.77201C10.0497 1.52264 10.0497 1.13593 9.80038 0.886563L9.08979 0.175971C8.85261 -0.0607263 8.45371 -0.0607263 8.21701 0.188634L8.21694 0.188564Z" fill="currentColor" />';

module.exports = {
    BANNER_IMPRESSION: BANNER_IMPRESSION,
    BANNER_CLICK: BANNER_CLICK,
    BANNER_DISMISS: BANNER_DISMISS,
    MODAL_CLICK: MODAL_CLICK,

    BANNER_ID: BANNER_ID,
    MODAL_ID: MODAL_ID,
    HIDDEN_CLASS: HIDDEN_CLASS,
    BLUR_CLASS: BLUR_CLASS,
    HAS_BANNER_CLASS: HAS_BANNER_CLASS,
    IS_ANIMATING_CLASS: IS_ANIMATING_CLASS,
    HAS_MODAL_CLASS: HAS_MODAL_CLASS,

    CLOSE_ICON: CLOSE_ICON
};

},{}],3:[function(require,module,exports){
'use strict';

var consts = require('./consts.es6');
var utils = require('./utils.es6');
var bannerHTML = require('./bannerTemplate.es6');
var modalHTML = require('./modalTemplate.es6');
var banner = utils.htmlToElement(bannerHTML);
var modal = utils.htmlToElement(modalHTML);

// Banner & Modal Elements
var bannerClose = banner.querySelector('.js-' + consts.BANNER_ID + '-close');
var bannerMore = banner.querySelector('.js-' + consts.BANNER_ID + '-more');
var bannerTitle = banner.querySelector('.js-' + consts.BANNER_ID + '-title');
var modalWrap = modal.querySelector('.js-' + consts.MODAL_ID + '-wrap');
var modalContent = modal.querySelector('#' + consts.MODAL_ID);
var modalClose = modal.querySelector('.js-' + consts.MODAL_ID + '-close');
var modalButton = modal.querySelector('.js-' + consts.MODAL_ID + '-btn');
var modalDontRemind = modal.querySelector('.js-' + consts.MODAL_ID + '-dont-remind');
var body = document.body;

var isSerp = false;

// For handling Google's own banner
var HAS_PROMOS_CLASS = 'has-promos';
var PROMOS_SELECTOR = '#promos, .og-pdp';
var promos = document.querySelector(PROMOS_SELECTOR);
// Observe and react when Google banner dismissed
// See: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
var promosConfig = { attributes: true, attributeFilter: ['aria-hidden'], subtree: true
    // Update banner position when Google banner dismissed
};var promosHiddenCallback = function promosHiddenCallback(mutationsList, observer) {
    // First child of #promos will be hidden when button is clicked
    if (mutationsList.length && mutationsList[0].target.hasAttribute('aria-hidden', 'true')) {
        banner.classList.remove(HAS_PROMOS_CLASS);
        // Stop observing after dimissed
        promosObserver.disconnect();
    }
};
var promosObserver = new MutationObserver(promosHiddenCallback);

// EVENT HANDLERS
// Remove animating class after entrance
banner.addEventListener('animationend', function () {
    banner.classList.remove(consts.IS_ANIMATING_CLASS);
});

// Hide modal on overlay click
modalWrap.addEventListener('click', function (event) {
    // ignore clicks on modal
    if (modalContent.contains(event.target)) return true;

    // hide on modal background click
    if (body.classList.contains(consts.HAS_MODAL_CLASS)) {
        hideModal();
    }
});

// Hide banner on key press
body.addEventListener('keydown', function (event) {
    // Ignore on homepage where the notification isn't in the way
    if (!isSerp) return;

    // ignore if banner is animating
    if (banner.classList.contains(consts.IS_ANIMATING_CLASS)) return;

    // Ignore if banner is dismissed
    if (!body.classList.contains(consts.HAS_BANNER_CLASS)) return;

    // Hide if escape key pressed
    if (event.code.indexOf('Key') !== -1 || event.code.indexOf('Digit') !== -1 || event.code.indexOf('Numpad') !== -1) {
        hideBanner();
    }
});

// Banner Learn More Click
bannerMore.addEventListener('click', function (event) {
    body.classList.add(consts.HAS_MODAL_CLASS, consts.BLUR_CLASS);
    modal.classList.remove(consts.HIDDEN_CLASS);
    _firePixel(consts.BANNER_CLICK);
});

// Banner Close Click
bannerClose.addEventListener('click', function (event) {
    hideBanner({ disable: true });
});

// Modal Close Click
modalClose.addEventListener('click', function (event) {
    hideBanner();
});

// Modal CTA Click
modalButton.addEventListener('click', function (event) {
    _firePixel(consts.MODAL_CLICK);
});

// Modal Do-Not-Remind-Me Click
modalDontRemind.addEventListener('click', function (event) {
    hideBanner({ disable: true, fromModal: true });
});

// Hide banner
function hideBanner(ops) {
    hideModal();
    // remove elements from DOM
    modal.remove();
    banner.remove();
    body.classList.remove(consts.HAS_BANNER_CLASS);

    // Disable permananetly
    if (ops && ops.disable) {
        var pixelOps = ops.fromModal ? { s: 'modal' } : {};
        // Disables banner via Banner.es6.js
        _firePixel(consts.BANNER_DISMISS, pixelOps);
    }
}

// Hide Modal
function hideModal() {
    body.classList.remove(consts.HAS_MODAL_CLASS, consts.BLUR_CLASS);
    modal.classList.add(consts.HIDDEN_CLASS);
}

function _firePixel(id, ops) {
    var defaultOps = { p: isSerp ? 'serp' : 'home' };
    var pixelOps = Object.assign(defaultOps, ops);
    chrome.runtime.sendMessage({ bannerPixel: true, pixelArgs: [id, pixelOps] });
}

// DOM INJECTION
function updateDOM() {
    if (window.location.pathname === '/search') {
        var url = new URL(window.location.href);
        var query = url.searchParams.get('q');

        isSerp = true;

        // Adjust copy for SERP
        bannerTitle.innerHTML = bannerTitle.innerHTML.replace('can', 'may').replace('searches', 'search');
        modalButton.href += '?q=' + query;
    }

    if (promos) {
        // Start observing the target node for configured mutations
        promosObserver.observe(promos, promosConfig);
        banner.classList.add(HAS_PROMOS_CLASS);
    }

    // Insert Banner
    body.insertAdjacentElement('beforeend', banner);
    _firePixel(consts.BANNER_IMPRESSION);

    // Insert Modal
    body.insertAdjacentElement('beforeend', modal);
    body.classList.add(consts.HAS_BANNER_CLASS);
}

var lang = document.documentElement.lang.split('-')[0];

// Skip if DDG banner already in DOM
if (!document.getElementById(consts.BANNER_ID) || !document.getElementById(consts.MODAL_ID) || lang !== 'en') {
    updateDOM();
}

},{"./bannerTemplate.es6":1,"./consts.es6":2,"./modalTemplate.es6":4,"./utils.es6":5}],4:[function(require,module,exports){
'use strict';

var consts = require('./consts.es6');
var id = consts.MODAL_ID;

var logoUrl = chrome.runtime.getURL('img/banner/logo-round.svg');

module.exports = '\n<div class="' + id + '-overlay ' + consts.HIDDEN_CLASS + '">\n    <div class="js-' + id + '-wrap ' + id + '-wrap">\n        <div id="' + id + '" class="' + id + '">\n            <img class="js-' + id + '-logo ' + id + '__logo" src="' + logoUrl + '"></img>\n            <h1 class="' + id + '__title">\n                DuckDuckGo can\'t protect you\n                <br>\n                when you search on Google.\n            </h1>\n\n            <p class="' + id + '__text">\n                What\u2019s the harm?\n                <br>\n                Google remembers what you search and uses that data profile to follow you around with ads.\n            </p>\n\n            <a href="https://duckduckgo.com" class="js-' + id + '-btn ' + id + '__btn">\n                Search Privately on DuckDuckGo\n            </a>\n\n            <span class="js-' + id + '-dont-remind ' + id + '__link">\n                Don\u2019t remind me about this again.\n            </span>\n\n            <svg class="js-' + id + '-close ' + id + '__close" width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">\n                ' + consts.CLOSE_ICON + '\n            </svg>\n        </div>\n    </div>\n</div >\n';

},{"./consts.es6":2}],5:[function(require,module,exports){
'use strict';

function isGoogleSerp() {
    return document.URL.indexOf('/search') !== -1;
}

// Create HTML element from string
function htmlToElement(htmlString) {
    var template = document.createElement('template');
    // Never return a text node of whitespace as the result
    var html = htmlString.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

module.exports = {
    htmlToElement: htmlToElement,
    isGoogleSerp: isGoogleSerp
};

},{}]},{},[3]);
