var LOGGING = true;

Function.prototype.bind = function(self) {
  var func = this;
  return function() { func.apply(self, arguments) }
}
Math.rand = function() {
  var min = 0, max = 0;
  if (arguments.length == 2) {
    min = arguments[0];
    max = arguments[1];
  } else {
    max = arguments[0];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function log(msg) {
  if (LOGGING) console.log(msg);
}