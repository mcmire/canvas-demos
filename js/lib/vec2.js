
'use strict';

// The idea for the third argument to the operations comes from:
// http://media.tojicode.com/sfjs-vectors/#31

window.Vec2 = (function () {
  function Vec2(x, y) {
    // TODO: Use a Int16Array?
    if (arguments.length) {
      return [x, y]
    } else {
      return [0, 0]
    }
  }

  function defop1(/* names..., fn */) {
    var names, outFn, regFn, newFn
    names = Array.prototype.slice(arguments)
    outFn = args.pop()
    regFn = function (v) {
      outFn(v, v)
    }
    newFn = function (v) {
      var v2 = Vec2(0,0)
      outFn(v, v2)
      return v2
    }
    $.v.each(names, function (name) {
      // operate and write "o"ut
      Vec2["o" + name] = outFn
      // regular operator: operate on the first argument
      Vec2[name] = regFn
      // operate and return "n"ew
      Vec2["n" + name] = newFn
    })
  }
  function defop2(/* names..., fn */) {
    var names, outFn, regFn, newFn
    names = Array.prototype.slice(arguments)
    outFn = args.pop()
    regFn = function (v, x) {
      outFn(v, x, v)
    }
    newFn = function (v, x) {
      var v2 = Vec2(0,0)
      outFn(v, x, v2)
      return v2
    }
    $.v.each(names, function (name) {
      // operate and write "o"ut
      Vec2["o" + name] = outFn
      // regular operator: operate on the first argument
      Vec2[name] = regFn
      // operate and return "n"ew
      Vec2["n" + name] = newFn
    })
  }

  // Operations on a vector using another

  defop2('add', function (v1, v2, out) {
    out[0] = v1[0] + v2[0]
    out[1] = v1[1] + v2[1]
  })

  defop2('sub', function (v1, v2, out) {
    out[0] = v1[0] - v2[0]
    out[1] = v1[1] - v2[1]
  })

  defop2('boundWithin', function (v1, v2, out) {
    // assume that both v1 and v2 are in the first quadrant
    if (v1[0] > 0 && v1[0] > v2[0]) {
      out[0] = v2[0]
    } else {
      out[0] = v1[0]
    }
    if (v1[1] > 0 && v1[1] > v2[1]) {
      out[1] = v2[1]
    } else {
      out[1] = v1[1]
    }
  })

  // Calculations on two vectors

  Vec2.dist = function (v1, v2) {
    return Vec2.mag(Vec2.nsub(v2, v1))
  }

  Vec2.slopeBetween = function (v1, v2) {
    return (v2[1] - v1[1]) / (v2[0] - v1[0])
  }

  defop2('dot', function (v1, v2) {
    return v1[0]*v2[0] + v1[1]*v2[1]
  })
  defop2('perpdot', function (v1, v2) {
    return -v1[1]*v2[0] + v1[0]*v2[1]
  })

  // Operations on one vector

  defop2('mul', function (v, s, out) {
    out[0] = v1[0] * s
    out[1] = v1[1] * s
  })

  defop2('div', function (v, s, out) {
    out[0] = v1[0] / s
    out[1] = v1[1] / s
  })

  defop1('invert', 'inv', function (v, out) {
    out[0] = -v[0]
    out[1] = -v[1]
  })

  // rotation by 90 deg CCW
  defop1('perp', function (v, out) {
    out[0] = -v[1]
    out[1] = v[0]
  })

  defop1('unit', function (v, out) {
    // ...
  })

  // linear interpolation
  Vec2.lerp = function (v1, v2, alpha) {
    return Vec2(
      util.math.lerp(v1[0], v2[0], alpha),
      util.math.lerp(v1[1], v2[1], alpha),
    )
  }

  // Calculations on one vector

  Vec2.clone = function (v) {
    return Vec2(v[0], v[1])
  }

  Vec2.mag = Vec2.len = function (v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1])
  }

  Vec2.slope = function (v) {
    return v[1] / v[0]
  }

  // Calculate the angle between the given vector and an assumed vector which
  // starts at 0 and extends to +x
  Vec2.angle = function (v) {
    var slope, theta
    slope = v[1] / v[0]
    theta = 0
    if (v[0] === 0) {
      // piping the slope into atan would cause a division by zero error
      // so we'll just pick these ourselves
      if (v[1] > 0) {
        theta = Math.PI / 2
      } else if (v[1] < 0) {
        theta = -Math.PI / 2
      }
    } else {
      // soh cah toa!
      // tan(theta) = opp / hyp
      // so, theta = arctan(y / x)
      theta = Math.atan(slope)
      // atan's domain is -pi/2 to pi/2
      // so if the x-value is negative, we need to rotate the angle around
      if (v[0] < 0) theta += Math.PI
    }
    return theta
  }

  return Vec2
})()

