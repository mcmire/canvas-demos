(function() {
  describe("Vector", function() {
    $.each(["add", "plus"], function(i, method) {
      describe("." + (method), function() {
        it("returns the addition of the given vectors as a new vector", function() {
          return expect($V[method]($V(1, 2), [3, 4], [5, 6])).toEqual($V(9, 12));
        });
        return it("also works if none of the arguments are $Vs", function() {
          return expect($V[method]([1, 2], [3, 4], [5, 6])).toEqual($V(9, 12));
        });
      });
      return describe("#" + (method), function() {
        return it("returns the addition of me and the given vectors as a new vector", function() {
          return expect($V(1, 2)[method]([3, 4], [5, 6])).toEqual($V(9, 12));
        });
      });
    });
    $.each(["subtract", "minus"], function(i, method) {
      describe("." + (method), function() {
        it("returns the difference of the given vectors as a new vector", function() {
          return expect($V[method]($V(1, 2), [3, 4], [5, 6])).toEqual($V(-7, -8));
        });
        return it("also works if none of the arguments are $Vs", function() {
          return expect($V[method]([1, 2], [3, 4], [5, 6])).toEqual($V(-7, -8));
        });
      });
      return describe("#" + (method), function() {
        return it("returns the difference of me and the given vectors as a new vector", function() {
          return expect($V(1, 2)[method]([3, 4], [5, 6])).toEqual($V(-7, -8));
        });
      });
    });
    $.each(["multiply", "times"], function(i, method) {
      describe("." + (method), function() {
        it("returns the product of the given vectors as a new vector", function() {
          return expect($V[method]($V(1, 2), [3, 4], [5, 6])).toEqual($V(15, 48));
        });
        return it("also works if none of the arguments are $Vs", function() {
          return expect($V[method]([1, 2], [3, 4], [5, 6])).toEqual($V(15, 48));
        });
      });
      return describe("#" + (method), function() {
        return it("returns the product of me and the given vectors as a new vector", function() {
          return expect($V(1, 2)[method]([3, 4], [5, 6])).toEqual($V(15, 48));
        });
      });
    });
    $.each(["divide", "over"], function(i, method) {
      describe("." + (method), function() {
        it("returns the quotient of the given vectors as a new vector", function() {
          return expect($V[method]($V(48, 144), [2, 8], [12, 2])).toEqual($V(2, 9));
        });
        return it("also works if none of the arguments are $Vs", function() {
          return expect($V[method]([48, 144], [2, 8], [12, 2])).toEqual($V(2, 9));
        });
      });
      return describe("#" + (method), function() {
        return it("returns the quotient of me and the given vectors as a new vector", function() {
          return expect($V(48, 144)[method]([2, 8], [12, 2])).toEqual($V(2, 9));
        });
      });
    });
    describe("distance", function() {
      it("returns a scalar value representing the distance between two points in 2D space", function() {
        return expect($V.distance($V(2, 2), [5, 6])).toEqual(5);
      });
      return it("returns a scalar value representing the distance between two points in 3D space", function() {
        return expect($V.distance($V(1, 1, 1), [1, 4, 5])).toEqual(5);
      });
    });
    describe("#distance", function() {
      it("returns a scalar value representing the distance between me and another point in 2D space", function() {
        return expect($V(2, 2).distance([5, 6])).toEqual(5);
      });
      return it("returns a scalar value representing the distance between me and another point in 3D space", function() {
        return expect($V(1, 1, 1).distance([1, 4, 5])).toEqual(5);
      });
    });
    describe(".magnitude", function() {
      it("returns a scalar value representing the length of the given 2D vector", function() {
        return expect($V.magnitude([3, 4])).toEqual(5);
      });
      return it("returns a scalar value representing the length of the given 3D vector", function() {
        return expect($V.magnitude([0, 3, 4])).toEqual(5);
      });
    });
    describe('#magnitude', function() {
      it("returns a scalar value representing my length as a 2D vector", function() {
        return expect($V(3, 4).magnitude()).toEqual(5);
      });
      return it("returns a scalar value representing my length as a 3D vector", function() {
        return expect($V(0, 3, 4).magnitude()).toEqual(5);
      });
    });
    describe(".slope", function() {
      it("returns a scalar value representing the slope between the two given vectors", function() {
        return expect($V.slope($V(0, 0), [1, 3])).toEqual(3);
      });
      return it("returns the slope of the given vector, if only given one argument", function() {
        return expect($V.slope([1, 3])).toEqual(3);
      });
    });
    describe("#slope", function() {
      it("returns a scalar value representing the slope between me and another vector", function() {
        return expect($V(0, 0).slope([1, 3])).toEqual(3);
      });
      return it("returns the slope of the given vector, if not given any arguments", function() {
        return expect($V(1, 3).slope()).toEqual(3);
      });
    });
    describe(".invert", function() {
      it("returns a vector where the signs of all numbers are flipped", function() {
        return expect($V.invert([1, 3])).toEqual($V(-1, -3));
      });
      return it("also works for a 3D vector", function() {
        return expect($V.invert([1, -3, 8])).toEqual($V(-1, 3, -8));
      });
    });
    describe("#invert", function() {
      it("returns a vector where the signs of all my numbers are flipped", function() {
        return expect($V(1, 3).invert()).toEqual($V(-1, -3));
      });
      return it("also works if I am a 3D vector", function() {
        return expect($V(1, -3, 8).invert()).toEqual($V(-1, 3, -8));
      });
    });
    describe('.limit', function() {
      it("returns a copy of the first vector that's bounded by the second", function() {
        return expect($V.limit([10, 7], [5, 6])).toEqual($V(5, 6));
      });
      return it("returns the same vector as the first if it's already inside the bound", function() {
        return expect($V.limit([1, 2], [5, 6])).toEqual($V(1, 2));
      });
    });
    describe('#limit', function() {
      it("returns a copy of me that's bounded by the given vector", function() {
        return expect($V(10, 7).limit([5, 6])).toEqual($V(5, 6));
      });
      return it("returns the same vector as me if I'm already inside the bound", function() {
        return expect($V(1, 2).limit([5, 6])).toEqual($V(1, 2));
      });
    });
    describe('.angle', function() {
      it("returns a scalar value representing the angle of the given vector", function() {
        return expect($V.angle([1, 1])).toEqual(Math.PI / 4);
      });
      it("rotates the angle around if x is negative and y is positive", function() {
        return expect($V.angle([-1, 1])).toEqual(3 / 4 * Math.PI);
      });
      it("rotates the angle around if x is negative and y is negative", function() {
        return expect($V.angle([-1, -1])).toEqual(5 / 4 * Math.PI);
      });
      it("returns pi/2 if x is 0 and y is positive", function() {
        return expect($V.angle([0, 1])).toEqual(Math.PI / 2);
      });
      return it("returns -pi/2 if x is 0 and y is negative", function() {
        return expect($V.angle([0, -1])).toEqual(-Math.PI / 2);
      });
    });
    describe('#angle', function() {
      it("returns a scalar value representing my angle", function() {
        return expect($V(1, 1).angle()).toEqual(Math.PI / 4);
      });
      it("rotates the angle around if my x is negative and y is positive", function() {
        return expect($V(-1, 1).angle()).toEqual(3 / 4 * Math.PI);
      });
      it("rotates the angle around if my x is negative and y is negative", function() {
        return expect($V(-1, -1).angle()).toEqual(5 / 4 * Math.PI);
      });
      it("returns pi/2 if x is 0 and my y is positive", function() {
        return expect($V(0, 1).angle()).toEqual(Math.PI / 2);
      });
      return it("returns -pi/2 if x is 0 and my y is negative", function() {
        return expect($V(0, -1).angle()).toEqual(-Math.PI / 2);
      });
    });
    describe('.isBeyond', function() {
      it("returns true if the first given vector is further in the first quadrant than the second vector", function() {
        return expect($V.isBeyond([2, 2], [1, 1])).toBeTruthy();
      });
      return it("returns false if the first given vector is not further in the first quadrant than the second vector", function() {
        return expect($V.isBeyond([1, 1], [2, 2])).toBeFalsy();
      });
    });
    return describe('#isBeyond', function() {
      it("returns true if I am further in the first quadrant than the given vector", function() {
        return expect($V(2, 2).isBeyond([1, 1])).toBeTruthy();
      });
      return it("returns false if I am not further in the first quadrant than the given vector", function() {
        return expect($V(1, 1).isBeyond([2, 2])).toBeFalsy();
      });
    });
  });
}).call(this);
