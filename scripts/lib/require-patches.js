/*
require.attach = (function() {
  var oldAttach = require.attach;
  return function(url, contextName, moduleName, callback, type) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + 'bust=' + (new Date()).getTime();
    return oldAttach.call(require, url, contextName, moduleName, callback, type);
  };
})();
*/