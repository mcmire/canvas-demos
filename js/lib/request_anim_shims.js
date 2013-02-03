
'use strict';

(function() {
  var fallbackCancelRequestAnimationFrame,
      fallbackRequestAnimationFrame,
      nativeCancelRequestAnimationFrame,
      nativeRequestAnimationFrame

  nativeRequestAnimationFrame = (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame
  )

  nativeCancelRequestAnimationFrame = (
    window.cancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame
  )

  window.requestAnimFrame = nativeRequestAnimationFrame

  window.cancelRequestAnimFrame = nativeCancelRequestAnimationFrame

  window.requestInterval = function(fn, delay) {
    var doLoop, start, handle
    if (!(nativeRequestAnimationFrame && nativeCancelRequestAnimationFrame)) {
      return setInterval(fn, delay)
    }
    start = new Date().getTime()
    handle = new Object()
    doLoop = function() {
      var current, delta
      current = new Date().getTime()
      delta = current - start
      if (delta >= delay) {
        fn()
        start = new Date().getTime()
      }
      handle.value = requestAnimFrame(doLoop)
    }
    handle.value = requestAnimFrame(doLoop)
    return handle
  }

  window.clearRequestInterval = function(handle) {
    var fn
    if (fn = nativeCancelRequestAnimationFrame) {
      return fn(handle.value)
    } else {
      return clearInterval(handle)
    }
  }

})()

