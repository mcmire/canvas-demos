
// The idea for the third argument to the operations comes from:
// http://media.tojicode.com/sfjs-vectors/#31

var Vec2 = function (x, y) {
  // TODO: Use a Int16Array?
  return [x, y]
}

// Operations on a vector using another

Vec2.add = Vec2.add$ = function (v1, v2, out) {
  if (!out) out = v1
  out[0] = v1[0] + v2[0]
  out[1] = v1[1] + v2[1]
}

Vec2.sub = Vec2.sub$ = function (v1, v2, out) {
  if (!out) out = v1
  out[0] = v1[0] - v2[0]
  out[1] = v1[1] - v2[1]
}

Vec2.boundWithin = function (v1, v2) {
  // assume that both v1 and v2 are in the first quadrant
  if (v1[0] > 0 && v1[0] > v2[0]) {
    v1[0] = v2[0]
  }
  if (v1[1] > 0 && v1[1] > v2[1]) {
    v1[1] = v2[1]
  }
}

// Calculations on two vectors

Vec2.dist = function (v1, v2) {
  var v = Vec2(0,0)
  Vec2.sub$(v2, v1, v)
  return Vec2.mag(v)
}

Vec2.slopeBetween = function (v1, v2) {
  return (v2[1] - v1[1]) / (v2[0] - v1[0])
}

// Operations on one vector

Vec2.mul = Vec2.mul$ = function (v, s, out) {
  if (!out) out = v
  out[0] = v[0] * s
  out[1] = v[1] * s
}

Vec2.div = Vec2.div$ = function (v, s, out) {
  if (!out) out = v
  out[0] = v[0] / s
  out[1] = v[1] / s
}

Vec2.invert = Vec2.invert$ = function (v, out) {
  if (!out) out = v
  out[0] = -v[0]
  out[1] = -v[1]
}

// Calculations on one vector

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

