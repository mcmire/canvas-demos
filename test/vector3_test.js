
describe('Operations on a vector using another', function() {
  describe('Vec2.add', function () {
    it('adds the second vector to the first one', function () {
      var v1 = Vec2(1,2)
        , v2 = Vec2(2,4)
      Vec2.add(v1, v2)
      assert.equal(v1[0], 3)
      assert.equal(v1[1], 6)
    })
  })
  describe('Vec2.add$', function () {
    it('adds the two vectors and writes the result to a third vector', function () {
      var v1 = Vec2(1,2)
        , v2 = Vec2(2,4)
        , v3 = Vec2(5,5)
      Vec2.add$(v1, v2, v3)
      assert.equal(v3[0], 3)
      assert.equal(v3[1], 6)
    })
  })

  describe('Vec2.sub', function () {
    it('subtracts the second vector from the first one', function () {
      var v1 = Vec2(1,2)
        , v2 = Vec2(2,4)
      Vec2.sub(v1, v2)
      assert.equal(v1[0], -1)
      assert.equal(v1[1], -2)
    })
  })
  describe('Vec2.sub$', function () {
    it('subtracts the two vectors and writes the result to a third vector', function () {
      var v1 = Vec2(1,2)
        , v2 = Vec2(2,4)
        , v3 = Vec2(5,5)
      Vec2.sub$(v1, v2, v3)
      assert.equal(v3[0], -1)
      assert.equal(v3[1], -2)
    })
  })

  describe('Vec2.boundWithin', function () {
    it('modifies the first vector to be bounded inside the second', function () {
      var v = Vec2(10,7)
      Vec2.boundWithin(v, Vec2(5,6))
      assert.equal(v[0], 5)
      assert.equal(v[1], 6)
    })

    it('does not modify the first vector if it is already inside the second', function () {
      var v = Vec2(1,2)
      Vec2.boundWithin(v, Vec2(5,6))
      assert.equal(v[0], 1)
      assert.equal(v[1], 2)
    })
  })
})

describe('Calculations on two vectors', function () {
  describe('Vec2.dist', function () {
    it('calculates the distance between the two vectors, returning a new vector', function () {
      var v1 = Vec2(2,2)
        , v2 = Vec2(5,6)
        , v3 = Vec2.dist(v1, v2)
      assert.equal(v3, 5)
    })
  })

  describe('Vec2.slopeBetween', function () {
    it("returns the slope between the two vectors as though they're points", function () {
      var v1 = Vec2(0,0)
        , v2 = Vec2(1,3)
        , slope = Vec2.slopeBetween(v1, v2)
      assert.equal(slope, 3)
    })
  })
})

describe('Operations on one vector', function () {
  describe('Vec2.mul', function () {
    it('scales up the vector by the scalar', function () {
      var v = Vec2(1,2)
      Vec2.mul(v, 5)
      assert.equal(v[0], 5)
      assert.equal(v[1], 10)
    })
  })
  describe('Vec2.mul$', function () {
    it('scales up the vector, writing the result to a second vector', function () {
      var v1 = Vec2(1,2)
        , v2 = Vec2(2,4)
      Vec2.mul$(v1, 5, v2)
      assert.equal(v2[0], 5)
      assert.equal(v2[1], 10)
    })
  })

  describe('Vec2.div', function () {
    it('scales down the vector by the scalar', function () {
      var v = Vec2(5,10)
      Vec2.div(v, 5)
      assert.equal(v[0], 1)
      assert.equal(v[1], 2)
    })
  })
  describe('Vec2.div$', function () {
    it('scales down the vector, writing the result to a second vector', function () {
      var v1 = Vec2(5,10)
        , v2 = Vec2(2,4)
      Vec2.div$(v1, 5, v2)
      assert.equal(v2[0], 1)
      assert.equal(v2[1], 2)
    })
  })

  describe('Vec2.invert', function () {
    it("reverses both components of the vector", function () {
      var v
      v = Vec2(3,5)
      Vec2.invert(v)
      assert.equal(v[0], -3)
      assert.equal(v[1], -5)

      v = Vec2(-3,5)
      Vec2.invert(v)
      assert.equal(v[0], 3)
      assert.equal(v[1], -5)

      v = Vec2(3,-5)
      Vec2.invert(v)
      assert.equal(v[0], -3)
      assert.equal(v[1], 5)
    })
  })
  describe('Vec2.invert$', function () {
    it("reverses both components of the vector, writing the result to a second vector", function () {
      var v, v2
      v2 = Vec2(-1,4)

      v = Vec2(3,5)
      Vec2.invert$(v, v2)
      assert.equal(v2[0], -3)
      assert.equal(v2[1], -5)

      v = Vec2(-3,5)
      Vec2.invert$(v, v2)
      assert.equal(v2[0], 3)
      assert.equal(v2[1], -5)

      v = Vec2(3,-5)
      Vec2.invert$(v, v2)
      assert.equal(v2[0], -3)
      assert.equal(v2[1], 5)
    })
  })
})

describe('Calculations on one vector', function () {
  describe('Vec2.mag', function () {
    it('returns the length of the vector', function () {
      var v = Vec2(3,4)
        , mag = Vec2.mag(v)
      assert.equal(mag, 5)
    })
  })

  describe('Vec2.slope', function () {
    it("returns the slope of the vector", function () {
      var v = Vec2(1,3)
        , slope = Vec2.slope(v)
      assert.equal(slope, 3)
    })
  })

  describe('Vec2.angle', function() {
    it("returns the right value for a 1st-quadrant vector", function() {
      var v = Vec2(1,1)
        , angle = Vec2.angle(v)
      // 1-1-1 triangle: π/4
      assert.equal(angle, 0.25 * Math.PI)
    })
    it("rotates the angle around for a 2nd-quadrant vector", function() {
      var v = Vec2(-1,1)
        , angle = Vec2.angle(v)
      // 1-1-1 triangle (flipped X-wise): π - π/4 or 3π/4
      assert.equal(angle, 0.75 * Math.PI)
    })
    it("rotates the angle around for a 3rd-quadrant vector", function() {
      var v = Vec2(-1,-1)
        , angle = Vec2.angle(v)
      // 1-1-1 triangle (flipped X-wise and Y-wise): π + π/4 or 5π/4
      assert.equal(angle, 1.25 * Math.PI)
    })
    it("doesn't rotate the angle around for a 4rd-quadrant vector", function() {
      var v = Vec2(1,-1)
        , angle = Vec2.angle(v)
      // 1-1-1 triangle (flipped Y-wise): -π/4
      assert.equal(angle, -0.25 * Math.PI)
    })
    it("returns pi/2 if x is 0 and y is positive", function() {
      var v = Vec2(0,1)
        , angle = Vec2.angle(v)
      assert.equal(angle, Math.PI / 2)
    })
    it("returns -pi/2 if x is 0 and y is negative", function() {
      var v = Vec2(0,-1)
        , angle = Vec2.angle(v)
      assert.equal(angle, -Math.PI / 2)
    })
  })
})

