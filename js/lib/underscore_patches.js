(function(_) {
  _.mixin({
    sum: function(enum) {
      return _.inject(enum, function(s,v) { s += v; s }, 0);
    }/*,
    // Curries an argument to the passed in function. 
    // Optionally you can pass the index where the curried argument should be
    // inserted into the list of arguments. Negative indexes count back from the
    // last argument. (-1 will curry the argument as the last argument, -2, second
    // to last, etc)
    //
    // By default, it is passed as the first argument.
    //
    // Copied from <http://github.com/jiaaro/underscore/raw/4dc8a4e9829552b1f62d3b876c4abaf9bc547158/underscore.js>
    //
    curry: function(fn, arg, pos) {
      pos = pos || 0;
      return function() {
        var args = slice.call(arguments);
        pos = pos < 0 ? args.length + (pos+1) : pos;
        args.splice(pos, 0, arg);
        return fn.apply(this, args);
      };
    }
    */
  })
})(_);