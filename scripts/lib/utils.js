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

/*
// http://javascriptweblog.wordpress.com/2010/04/05/curry-cooking-up-tastier-functions/
Function.prototype.curry = function() {
  if (arguments.length == 0) return this;
  var original = this;
  var args = $.makeArray(arguments);
  return function() {
    // Call the function we are currying with the arguments given to the curry function
    // plus the ones that will be given to this new function (in the future).
    return original.apply(this, args.concat($.makeArray(arguments)));
  }
}

// Make it so we can create a subclass of Array
Array.extend = Class.extend;
*/