describe("Vector", function() {
  $.each(["add", "plus"], function(i, method) {
    var args = [ (new Vector(1, 2)), [3, 4], [5, 6] ]
    var expected = new Vector(9, 12);
    describe("."+method, function() {
      it("returns the addition of the given vectors as a new vector", function() {
        var actual = Vector[method].apply(Vector, args);
        expect(actual).toEqual(expected);
      })
    })
    describe("#"+method, function() {
      it("returns the addition of me and the given vectors as a new vector", function() {
        var first = args[0];
        var actual = first[method].apply(first, args.slice(1));
        expect(actual).toEqual(expected);
      })
    })
  })
  
  $.each(["subtract", "minus"], function(i, method) {
    var args = [ (new Vector(1, 2)), [3, 4], [5, 6] ]
    var expected = new Vector(-7, -8);
    describe("."+method, function() {
      it("returns the difference of the given vectors as a new vector", function() {
        var actual = Vector[method].apply(Vector, args);
        expect(actual).toEqual(expected);
      })
    })
    describe("#"+method, function() {
      it("returns the difference of me and the given vectors as a new vector", function() {
        var first = args[0];
        var actual = first[method].apply(first, args.slice(1));
        expect(actual).toEqual(expected);
      })
    })
  })
  
  $.each(["multiply", "times"], function(i, method) {
    var args = [ (new Vector(1, 2)), [3, 4], [5, 6] ]
    var expected = new Vector(15, 48);
    describe("."+method, function() {
      it("returns the product of the given vectors as a new vector", function() {
        var actual = Vector[method].apply(Vector, args);
        expect(actual).toEqual(expected);
      })
    })
    describe("#"+method, function() {
      it("returns the product of me and the given vectors as a new vector", function() {
        var first = args[0];
        var actual = first[method].apply(first, args.slice(1));
        expect(actual).toEqual(expected);
      })
    })
  })
  
  $.each(["divide", "over"], function(i, method) {
    var args = [ (new Vector(48, 144)), [2, 8], [12, 2] ]
    var expected = new Vector(2, 9);
    describe("."+method, function() {
      it("returns the quotient of the given vectors as a new vector", function() {
        var actual = Vector[method].apply(Vector, args);
        expect(actual).toEqual(expected);
      })
    })
    describe("#"+method, function() {
      it("returns the quotient of me and the given vectors as a new vector", function() {
        var first = args[0];
        var actual = first[method].apply(first, args.slice(1));
        expect(actual).toEqual(expected);
      })
    })
  })
  
  describe(".distance", function() {
    it("returns a scalar value representing the distance between two points in 2D space", function() {
      var actual = Vector.distance((new Vector(2, 2)), [5, 6])
      expect(actual).toEqual(5);
    })
    it("returns a scalar value representing the distance between two points in 3D space", function() {
      var actual = Vector.distance((new Vector(1, 1, 1)), [1, 4, 5])
      expect(actual).toEqual(5);
    })
  });
  describe("#distance", function() {
    it("returns a scalar value representing the distance between me and another point in 2D space", function() {
      var actual = (new Vector(2, 2)).distance([5, 6])
      expect(actual).toEqual(5);
    })
    it("returns a scalar value representing the distance between me and another point in 3D space", function() {
      var actual = (new Vector(1, 1, 1)).distance([1, 4, 5])
      expect(actual).toEqual(5);
    })
  });
  
  describe(".magnitude", function() {
    it("returns a scalar value representing the length of the given 2D vector", function() {
      var actual = Vector.magnitude([3, 4])
      expect(actual).toEqual(5);
    })
    it("returns a scalar value representing the length of the given 3D vector", function() {
      var actual = Vector.magnitude([0, 3, 4])
      expect(actual).toEqual(5);
    })
  });
  describe(".magnitude", function() {
    it("returns a scalar value representing my length as a 2D vector", function() {
      var actual = (new Vector(3, 4)).magnitude()
      expect(actual).toEqual(5);
    })
    it("returns a scalar value representing my length as a 3D vector", function() {
      var actual = (new Vector(0, 3, 4)).magnitude()
      expect(actual).toEqual(5);
    })
  });
  
  describe(".slope", function() {
    it("returns a scalar value representing the slope between the two given vectors", function() {
      var actual = Vector.slope((new Vector(0, 0)), [1, 3])
      expect(actual).toEqual(3);
    })
    it("returns the slope of the given vector, if only given one argument", function() {
      var actual = Vector.slope([1, 3])
      expect(actual).toEqual(3);
    })
  });
  describe("#slope", function() {
    it("returns a scalar value representing the slope between me and another vector", function() {
      var actual = (new Vector(0, 0)).slope([1, 3])
      expect(actual).toEqual(3);
    })
    it("returns the slope of the given vector, if not given any arguments", function() {
      var actual = (new Vector(1, 3)).slope()
      expect(actual).toEqual(3);
    })
  });
  
  describe(".invert", function() {
    it("returns a vector where the signs of all numbers are flipped", function() {
      var actual = Vector.invert([1, 3]);
      var expected = new Vector(-1, -3);
      expect(actual).toEqual(expected);
    })
    it("also works for a 3D vector", function() {
      var actual = Vector.invert([1, -3, 8]);
      var expected = new Vector(-1, 3, -8);
      expect(actual).toEqual(expected);
    })
  });
  
  describe('.limit', function() {
    it("returns a copy of the first vector that's bounded by the second", function() {
      var actual = Vector.limit([10, 7], [5, 6]);
      var expected = new Vector(5, 6);
      expect(actual).toEqual(expected);
    })
    it("returns the same vector as the first if it's already inside the bound", function() {
      var actual = Vector.limit([1, 2], [5, 6]);
      var expected = new Vector(1, 2);
      expect(actual).toEqual(expected);
    })
  })
  describe('#limit', function() {
    it("returns a copy of me that's bounded by the given vector", function() {
      var actual = (new Vector(10, 7)).limit([5, 6]);
      var expected = new Vector(5, 6);
      expect(actual).toEqual(expected);
    })
    it("returns the same vector as me if I'm already inside the bound", function() {
      var actual = (new Vector(1, 2)).limit([5, 6]);
      var expected = new Vector(1, 2);
      expect(actual).toEqual(expected);
    })
  })
  
  describe('.angle', function() {
    it("returns a scalar value representing the angle of the given vector", function() {
      var actual = Vector.angle([1, 1]);
      var expected = Math.PI / 4;
      expect(actual).toEqual(expected);
    })
    it("rotates the angle around if x is negative and y is positive", function() {
      var actual = Vector.angle([-1, 1]);
      var expected = (3/4) * Math.PI;
      expect(actual).toEqual(expected);
    })
    it("rotates the angle around if x is negative and y is negative", function() {
      var actual = Vector.angle([-1, -1]);
      var expected = (5/4) * Math.PI;
      expect(actual).toEqual(expected);
    })
    it("returns pi/2 if x is 0 and y is positive", function() {
      var actual = Vector.angle([0, 1]);
      var expected = Math.PI / 2;
      expect(actual).toEqual(expected);
    })
    it("returns -pi/2 if x is 0 and y is negative", function() {
      var actual = Vector.angle([0, -1]);
      var expected = - Math.PI / 2;
      expect(actual).toEqual(expected);
    })
  })
  
  describe('.isBeyond', function() {
    it("returns true if the first given vector is further in the first quadrant than the second vector", function() {
      var actual = Vector.isBeyond([2, 2], [1, 1]);
      expect(actual).toBeTruthy();
    })
    it("returns false if the first given vector is not further in the first quadrant than the second vector", function() {
      var actual = Vector.isBeyond([1, 1], [2, 2]);
      expect(actual).toBeFalsy();
    })
  })
});