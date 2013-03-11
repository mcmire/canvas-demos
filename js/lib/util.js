
'use strict';

yorp.util = {}

yorp.util.math = yorp.math = (function () {
  var math = {}

  math.TAU = Math.PI * 2

  math.lerp = function (v1, v2, alpha) {
    return (v1 * (1 - alpha)) + (v2 * alpha)
  }

  math.floor = function (v, minValue) {
    if (v > 0 && v <= minValue) { v = 0 }
    if (v < 0 && v >= -minValue) { v = 0 }
    return v
  }

  math.normalize = function (n) {
    return n / Math.abs(n)
  }

  return math
})()

yorp.util.rand = yorp.rand = (function () {
  var rand = {}

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

  return rand
})()

yorp.util.arr = yorp.arr = (function () {
  var arr = {}

  arr.sum = function(array) {
    return $.v.reduce(array, function(s,v) { s += v; s }, 0)
  }

  return arr
})()

