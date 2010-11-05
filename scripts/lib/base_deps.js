/*
var require = (function(require) {
*/
  var baseDeps = [
    "order!scripts/vendor/underscore.js",
    "order!scripts/lib/underscore_patches.js",
    "order!scripts/vendor/inheritance.js",
    "order!scripts/lib/utils.js",
    "order!scripts/lib/logging.js",
    "order!scripts/lib/vector2.js",
    "order!scripts/lib/drawable.js",
    "order!scripts/lib/drawable_collection.js",
    "order!scripts/lib/canvas.js"
  ];
  var baseConfig = {
    //urlArgs: "version=" + (new Date()).getTime()
  };
/*
  var func = function(config, deps, callback) {
    if ($.isArray(config)) {
      // dependencies are first
      callback = deps;
      deps = config;
      config = {};
    }
    deps = baseDeps.concat(config);
    config = $.extend(config, baseConfig);
    return require(config, deps, callback);
  }
  for (p in require) func[p] = require[p];
  return func;
})(require);
*/