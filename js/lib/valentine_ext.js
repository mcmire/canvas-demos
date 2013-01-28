
// Zip together multiple lists into a single array -- elements that share
// an index go together.
// Taken from Underscore
$.v.zip = function () {
  var args = Array.prototype.slice.call(arguments)
  var length = Math.max.apply(null, $.v.pluck(args, 'length'))
  var results = new Array(length)
  for (var i = 0; i < length; i++) {
    results[i] = $.v.pluck(args, "" + i)
  }
  return results
}
