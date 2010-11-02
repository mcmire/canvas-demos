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

function NotImplementedError(message) {
  this.message = message;
}
NotImplementedError.prototype.toString = function() {
  return "NotImplementedError: " + this.message;
}

// Allows you to call a constructor with a variable number of arguments
// http://stackoverflow.com/questions/1959247/javascript-apply-on-constructor-throwing-malformed-formal-parameter
Function.splat = function(cons, args) {
  var func = function() { cons.apply(this, arguments[0]) };
  func.prototype = cons.prototype;
  return new func(args);
}

/*
// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/
// Note that this doesn't work in IE < 8 but I don't really care
Array.subclass = function() {
  var func = function() {
    // Accept an array or a list of values as the arguments
    var args = ($.isArray(arguments[0]) ? arguments[0] : arguments)
    var arr = [ ];
    arr.push.apply(arr, args);
    arr.__proto__ = arguments.callee.prototype;
    return arr;
  }
  func.prototype = new Array;
  return func;
}
*/