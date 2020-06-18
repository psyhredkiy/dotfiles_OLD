/**
 * ToggleJS Chrome extension
 * -------------------------
 * This file contains a background script which handles extension-level functionality.
 */

var ToggleJSApplication = {

  triggerWin: null,
  urlPattern: 'http://*',

  init: function() {
    var self = this;
    self.updateIcon(function() {
      chrome.browserAction.onClicked.addListener(self.toggleState.bind(self));
      chrome.windows.onFocusChanged.addListener(self.onWinFocusChanged.bind(self));
    });
  },

  getConfig: function(cb) {
    chrome.storage.sync.get(function(config) {
      self.config = config;
      cb(self.config);
    });
  },

  getState: function(incognito, callback) {
    var self = this,
        data = {
          'primaryUrl': self.urlPattern,
          'incognito': incognito || false
        };

    chrome.contentSettings.javascript.get(data, function(state) {
      state.enabled = (state.setting === 'allow');
      if (typeof callback === 'function') callback(state);
    });
  },

  setState: function(incognito, enabled, callback) {
    var self = this,
        data = {
          'primaryPattern': '<all_urls>',
          'setting': (enabled) ? 'allow' : 'block',
          'scope': (incognito === true) ? 'incognito_session_only' : 'regular'
        };

    chrome.contentSettings.javascript.set(data, function() {
      self.updateIcon();
      if (typeof callback === 'function') callback();
    });
  },

  toggleState: function() {
    var self = this;
    chrome.windows.getCurrent(function(win) {
      self.triggerWin = win;
      self.getState(win.incognito, function(state) {
        self.setState(win.incognito, !state.enabled, function() {
          self.reloadCurrentTab();
        });
      });
    });
  },

  onWinFocusChanged: function() {
    var self = this;
    chrome.windows.getCurrent(function(win) {
      self.triggerWin = win;
      self.updateIcon();
    });
  },

  reloadCurrentTab: function() {
    const self = this;
    self.getConfig(function(cfg) {
      if (cfg.norefresh === true) return;
      chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.reload(tab.id);
      });
    });
  },

  updateIcon: function(callback) {
    var self = this,
        incognito = (self.triggerWin && self.triggerWin.incognito) || false;

    self.getState(incognito, function(state) {
      if (state.enabled) {
        chrome.browserAction.setIcon({path: 'icons/38-on.png'});
        chrome.browserAction.setTitle({title: 'JavaScript is enabled'});
      }
      else {
        chrome.browserAction.setIcon({path: 'icons/38-off.png'});
        chrome.browserAction.setTitle({title: 'JavaScript is disabled'});
      }

      if (typeof callback === 'function') callback();
    });
  }

};

ToggleJSApplication.init();
