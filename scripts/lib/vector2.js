var Vector = (function() {
  var Vector = Array.extend({});
  
  function coerce(v, n) {
    if ($.isArray(v)) {
      return v;
    } else {
      var vectors = [];
      for (var i=0; i<n; i++) vectors.push(v);
      return vectors;
    }
  }
  function normalizeList(vectors) {
    return _.map(vectors, function(vec, i) {
      if (typeof vec == 'number') {
        return coerce(vec, vectors[0].length);
      } else {
        return vec;
      }
    })
  }
  
  function makeFunction(operator, initialValue) {
    var injector = new Function("acc", "v", "return acc " + operator + " v");
    return function() {
      var vectors = normalizeList(arguments);
      var zipped = _.zip.apply(this, vectors);
      var coords = _.map(zipped, function(v) {
        var args = [v, injector];
        if (initialValue !== undefined) args.push(initialValue);
        return _.inject.apply(_, args);
      });
      return new Vector(coords);
    }
  }
  
  var methods = {};
  methods.add = methods.plus = makeFunction("+");
  methods.subtract = methods.minus = makeFunction("-");
  methods.multiply = methods.times = makeFunction("*");
  methods.divide = methods.over = makeFunction("/");
  methods.distance = function(v1, v2) {
    //var axes = _.zip(v1, v2);
    //var sum = _.inject(axes, function(sum, axis) { return sum + Math.pow(axis[1] - axis[0], 2) }, 0);
    //return Math.sqrt(sum);
    return Vector.subtract(v2, v1).magnitude();
  }
  methods.magnitude = function(v) {
    var sum = _.inject(v, function(sum, a) { return sum + Math.pow(a, 2) }, 0);
    return Math.sqrt(sum);
  }
  // Note that this is only a 2D concept, so no need to abstract this
  methods.slope = function() {
    if (arguments.length == 1) {
      return arguments[0][1] / arguments[0][0];
    } else {
      return (arguments[1][1] - arguments[0][1]) / (arguments[1][0] - arguments[0][0]);
    }
  }
  methods.invert = function(v) {
    return Vector.multiply(v, -1);
  }
  methods.limit = function(v1, v2) {
    var v1 = v1.slice(); // dupe the array
    for (var i=0; i<v1.length; i++) {
      if (v1[i] > 0) {
        if (v1[i] > v2[i]) v1[i] = v2[i];
      } else if (v1[i] < 0) {
        if (v1[i] < -v2[i]) v1[i] = -v2[i];
      }
    }
    return new Vector(v1);
  }
  methods.angle = function(v) {
    var slope = v[1] / v[0];
    var theta = 0;
    if (v[0] == 0) {
      // piping the slope into atan would cause a division by zero error
      // so we'll just pick these ourselves
      if (v[1] > 0) {
        theta = Math.PI / 2;
      } else if (v[1] < 0) {
        theta = -Math.PI / 2;
      }
    } else {
      theta = Math.atan(slope);
      // atan's domain is -pi/2 to pi/2
      // so if the x-value is negative, we need to rotate the angle around
      if (v[0] < 0) theta += Math.PI;
    }
    return theta;
  }
  methods.isBeyond = function(v1, v2) {
    return _(v1).chain()
      .zip(v2)
      .any(function(pair) { return pair[0] > pair[1] })
    .value();
  }
  
  // Make class and instance method versions of the above methods
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