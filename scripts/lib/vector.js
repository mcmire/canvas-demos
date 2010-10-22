var Vector = {};
$.extend(Vector, {
  operators: [
    {name: "add",      code: "m + a",       factory: "accum", type: "arithmetic"},
    {name: "subtract", code: "m - a",       factory: "accum", type: "arithmetic"},
    {name: "multiply", code: "m * a",       factory: "accum", type: "arithmetic"},
    {name: "divide",   code: "m / a",       factory: "accum", type: "arithmetic"},
    {name: "gt",       code: "m > a",       factory: "accum", type: "boolean"},
    {name: "lt",       code: "m < a",       factory: "accum", type: "boolean"},
    {name: "gte",      code: "m >= a",      factory: "accum", type: "boolean"},
    {name: "lte",      code: "m <= a",      factory: "accum", type: "boolean"},
    {name: "eq",       code: "m == a",      factory: "accum", type: "boolean"},
    {name: "abs",      code: "Math.abs(a)", factory: "map"}
  ],
  operatorCodes: {
    accum: function(code) {
      return new Function("m", "a", "return " + code);
    },
    map: function(code) {
      return new Function("a", "return " + code);
    }
  },
  coerce: function(arg, numAxes) {
    if (arg instanceof Array) {
      return arg;
    } else {
      var arr = [];
      for (var i=0; i<numAxes; i++) arr.push(arg);
      return arr;
    }
  },
  functionFactories: {
    accum: function(op, func) {
      return function() {
        var vector = Vector.coerce(arguments[0], 2).slice(0); // dupe the array
        for (var i=1; i<arguments.length; i++) {
          var v = Vector.coerce(arguments[i], 2);
          for (var j=0; j<v.length; j++) vector[j] = func(vector[j], v[j]);
        }
        if (op.type == "boolean") {
          var ret = true;
          for (var i=0; i<vector.length; i++) ret = ret && vector[i];
          return ret;
        } else {
          return vector;
        }
      }
    },
    map: function(op, func) {
      return function(vector) {
        var vector = vector.slice(0); // dupe the array
        for (var i=0; i<vector.length; i++) vector[i] = func(vector[i]);
        return vector;
      }
    }
  },
  distance: function(v1, v2) {
    var xd = v2[0] - v1[0];
    var yd = v2[1] - v1[1];
    return Math.sqrt(xd*xd + yd*yd);
  },
  magnitude: function(v) {
    return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
  },
  slope: function(v1, v2) {
    return (v2[1] - v1[1]) / (v2[0] - v1[0]);
  },
  invert: function(v) {
    return Vector.multiplyConstant(v, -1);
  },
  multiplyConstant: function(vector, c) {
    var vector = vector.slice(0); // dupe the array
    for (var i=0; i<vector.length; i++) vector[i] *= c;
    return vector;
  },
  limit: function(v1, v2) {
    var v1 = v1.slice(0); // dupe the array
    for (var i=0; i<v1.length; i++) {
      if (v1[i] > 0) {
        if (v1[i] > v2[i]) v1[i] = v2[i];
      } else if (v1[i] < 0) {
        if (v1[i] < -v2[i]) v1[i] = -v2[i];
      }
    }
    return v1;
  },
  angle: function(v) {
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
  },
  beyond: function(v1, v2) {
    return (v1[0] > v2[0] || v1[1] > v2[1]);
  }
})
for (var i=0; i<Vector.operators.length; i++) {
  var op = Vector.operators[i];
  var func = Vector.operatorCodes[op.factory](op.code);
  Vector[op.name] = Vector.functionFactories[op.factory](op, func);
}