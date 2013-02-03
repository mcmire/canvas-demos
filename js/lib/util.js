
'use strict';

window.util = (function () {
  var util = {},
      rand = {},
      arr = {},
      fn = {}

  // Return a number from 0..max, or min..max
  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random
  rand.int = function () {
    var min = 0
      , max = 0
    if (arguments.length == 2) {
      min = arguments[0]
      max = arguments[1]
    } else {
      max = arguments[0]
    }
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Allows you to call a constructor with a variable number of arguments
  // http://stackoverflow.com/questions/1959247/javascript-apply-on-constructor-throwing-malformed-formal-parameter
  fn.splat = function(cons, args) {
    var func = function() { cons.apply(this, arguments[0]) }
    func.prototype = cons.prototype
    return new func(args)
  }

  arr.sum = function(array) {
    return $.v.reduce(array, function(s,v) { s += v; s }, 0)
  }

  util.rand = rand
  util.arr = arr
  util.fn = fn

  return util
})()
