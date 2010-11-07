(function() {
  var __hasProp = Object.prototype.hasOwnProperty;
  window.Vector = (function() {
    var Vector, _i, _ref, coerce, makeFunction, method, methods, normalizeList;
    Vector = Array.extend({});
    coerce = function(v, n) {
      var _i, _result;
      if ($.isArray(v)) {
        return v;
      }
      _result = [];
      for (_i = 1; (1 <= n ? _i <= n : _i >= n); (1 <= n ? _i += 1 : _i -= 1)) {
        _result.push(v);
      }
      return _result;
    };
    normalizeList = function(vectors) {
      var _i, _len, _ref, _result, vec;
      _result = []; _ref = vectors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vec = _ref[_i];
        _result.push(typeof vec === 'number' ? coerce(vec, vectors[0].length) : vec);
      }
      return _result;
    };
    makeFunction = function(operator, initialValue) {
      var injector;
      injector = new Function("acc", "v", "return acc " + operator + " v");
      return function() {
        var _i, _len, _ref, _result, coords, v, vectors, zipped;
        vectors = normalizeList(arguments);
        zipped = _.zip.apply(_, vectors);
        coords = (function() {
          _result = []; _ref = zipped;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            v = _ref[_i];
            _result.push(_.inject.apply(_, [v, injector].concat((function() {
              if (typeof initialValue !== "undefined" && initialValue !== null) {
                return [initialValue];
              }
            })())));
          }
          return _result;
        })();
        return new Vector(coords);
      };
    };
    methods = {
      add: makeFunction("+"),
      subtract: makeFunction("-"),
      multiply: makeFunction("*"),
      divide: makeFunction("/"),
      distance: function(v1, v2) {
        return Vector.subtract(v2, v1).magnitude();
      },
      magnitude: function(v) {
        var _i, _len, _ref, a, sum;
        sum = 0;
        _ref = v;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          a = _ref[_i];
          sum += Math.pow(a, 2);
        }
        return Math.sqrt(sum);
      },
      slope: function() {
        return arguments.length === 1 ? arguments[0][1] / arguments[0][0] : (arguments[1][1] - arguments[0][1]) / (arguments[1][0] - arguments[0][0]);
      },
      invert: function(v) {
        return Vector.multiply(v, -1);
      },
      limit: function(v1, v2) {
        var _ref, i;
        v1 = v1.slice();
        _ref = v1.length;
        for (i = 0; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
          if (v1[i] > 0) {
            if (v1[i] > v2[i]) {
              v1[i] = v2[i];
            }
          } else if (v1[i] < 0) {
            if (v1[i] < -v2[i]) {
              v1[i] = -v2[i];
            }
          }
        }
        return new Vector(v1);
      },
      angle: function(v) {
        var slope, theta;
        slope = v[1] / v[0];
        theta = 0;
        if (v[0] === 0) {
          theta = (function() {
            if (v[1] > 0) {
              return Math.PI / 2;
            } else if (v[1] < 0) {
              return -Math.PI / 2;
            }
          })();
        } else {
          theta = Math.atan(slope);
          if (v[0] < 0) {
            theta += Math.PI;
          }
        }
        return theta;
      },
      isBeyond: function(v1, v2) {
        return _(v1).chain().zip(v2).any(function(pair) {
          return pair[0] > pair[1];
        }).value();
      }
    };
    methods.plus = methods.add;
    methods.minus = methods.subtract;
    methods.times = methods.multiply;
    methods.over = methods.divide;
    _ref = methods;
    for (_i in _ref) {
      if (!__hasProp.call(_ref, _i)) continue;
      (function() {
        var method = _i;
        var func = _ref[_i];
        Vector[method] = func;
        return (Vector.prototype[method] = function() {
          var args;
          args = Array.prototype.slice.call(arguments);
          args.unshift(this);
          return func.apply(this, args);
        });
      })();
    }
    return Vector;
  })();
  window.$V = function() {
    return new window.Vector(Array.prototype.slice.call(arguments));
  };
  $.extend(window.$V, window.Vector);
}).call(this);
