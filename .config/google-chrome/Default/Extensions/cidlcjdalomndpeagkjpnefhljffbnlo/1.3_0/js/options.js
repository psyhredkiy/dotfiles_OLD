function load() {
  chrome.storage.sync.get(function(config) {
    Object.keys(config).forEach(function(k) {
      document.querySelector('[data-storage-key="' + k + '"]').checked = config[k];
    });
  });
}

function update(config) {
  chrome.storage.sync.set(config, function() {
  });
}

function init() {
  load();

  document.getElementById('opts-container').addEventListener('click', function(evt) {
    var el = evt.target;
    var key = el.getAttribute('data-storage-key');
    if (key) {
      var checked = el.checked;
      var obj = {[key]: checked};
      update(obj);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
