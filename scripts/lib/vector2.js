var Vector = (function() {
  // http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/
  function Vector() {
    var arr = [ ];
    arr.push.apply(arr, arguments);
    arr.__proto__ = Vector.prototype;
    return arr;
  }
  Vector.prototype = new Array;
  
  function makeFunction(operator) {
    var initial = (operator == "*" || operator == "/") ? 1 : 0
    var tpl = "\
  return _.zip.apply(this, arguments).map(function(vec) {\n\
    return _.inject(vec, function(sum,v) { sum = sum " + operator + " v; return sum }, " + initial + ")\n\
  })\
    ";
    return new Function(tpl);
  }
  
  var methods = {};
  methods.add = methods.plus = makeFunction("+");
  methods.subtract = methods.minus = makeFunction("-");
  methods.multiply = methods.times = makeFunction("*");
  methods.divide = methods.over = makeFunction("/");
  
  $.each(methods, function(method, func) {
    Vector[method] = func;
    Vector.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(this);
      return func.apply(this, args);
    }
  })
  
  return Vector;
})()