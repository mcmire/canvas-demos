describe "Vector", ->

  $.each ["add", "plus"], (i, method) ->
    describe ".#{method}", ->
      it "returns the addition of the given vectors as a new vector", ->
        expect( $V[method] $V(1,2), [3,4], [5,6] ) .
        toEqual( $V(9,12) )
      it "also works if none of the arguments are $Vs", ->
        expect( $V[method] [1,2], [3,4], [5,6] ) .
        toEqual( $V(9,12) )
    describe "##{method}", ->
      it "returns the addition of me and the given vectors as a new vector", ->
        expect( $V(1,2)[method] [3,4], [5,6] ).
        toEqual( $V(9,12) )
  
  $.each ["subtract", "minus"], (i, method) ->
    describe ".#{method}", ->
      it "returns the difference of the given vectors as a new vector", ->
        expect( $V[method] $V(1,2), [3,4], [5,6] ) .
        toEqual( $V(-7,-8) )
      it "also works if none of the arguments are $Vs", ->
        expect( $V[method] [1,2], [3,4], [5,6] ) .
        toEqual( $V(-7,-8) )
    describe "##{method}", ->
      it "returns the difference of me and the given vectors as a new vector", ->
        expect( $V(1,2)[method] [3,4], [5,6] ) .
        toEqual( $V(-7,-8) )
        
  $.each ["multiply", "times"], (i, method) ->
    describe ".#{method}", ->
      it "returns the product of the given vectors as a new vector", ->
        expect( $V[method] $V(1,2), [3,4], [5,6] ) .
        toEqual( $V(15,48) )
      it "also works if none of the arguments are $Vs", ->
        expect( $V[method] [1,2], [3,4], [5,6] ) .
        toEqual( $V(15,48) )
    describe "##{method}", ->
      it "returns the product of me and the given vectors as a new vector", ->
        expect( $V(1,2)[method] [3,4], [5,6] ) .
        toEqual( $V(15,48) )
        
  $.each ["divide", "over"], (i, method) ->
    describe ".#{method}", ->
      it "returns the quotient of the given vectors as a new vector", ->
        expect( $V[method] $V(48,144), [2,8], [12,2] ) .
        toEqual( $V(2,9) )
      it "also works if none of the arguments are $Vs", ->
        expect( $V[method] [48,144], [2,8], [12,2] ) .
        toEqual( $V(2,9) )
    describe "##{method}", ->
      it "returns the quotient of me and the given vectors as a new vector", ->
        expect( $V(48,144)[method] [2,8], [12,2] ) .
        toEqual( $V(2,9) )
        
  describe "distance", ->
    it "returns a scalar value representing the distance between two points in 2D space", ->
      expect( $V.distance $V(2,2), [5,6] ).toEqual(5)
    it "returns a scalar value representing the distance between two points in 3D space", ->
      expect( $V.distance $V(1, 1, 1), [1, 4, 5] ).toEqual(5)
  describe "#distance", ->
    it "returns a scalar value representing the distance between me and another point in 2D space", ->
      expect( $V(2,2).distance [5,6] ).toEqual(5)
    it "returns a scalar value representing the distance between me and another point in 3D space", ->
      expect( $V(1, 1, 1).distance [1, 4, 5] ).toEqual(5)
      
  describe ".magnitude", ->
    it "returns a scalar value representing the length of the given 2D vector", ->
      expect( $V.magnitude [3,4] ).toEqual(5)
    it "returns a scalar value representing the length of the given 3D vector", ->
      expect( $V.magnitude [0, 3, 4] ).toEqual(5)
  describe '#magnitude', ->
    it "returns a scalar value representing my length as a 2D vector", ->
      expect( $V(3,4).magnitude() ).toEqual(5)
    it "returns a scalar value representing my length as a 3D vector", ->
      expect( $V(0, 3, 4).magnitude() ).toEqual(5)
      
  describe ".slope", ->
    it "returns a scalar value representing the slope between the two given vectors", ->
      expect( $V.slope $V(0,0), [1,3] ).toEqual(3)
    it "returns the slope of the given vector, if only given one argument", ->
      expect( $V.slope [1,3] ).toEqual(3)
  describe "#slope", ->
    it "returns a scalar value representing the slope between me and another vector", ->
      expect( $V(0,0).slope [1,3] ).toEqual(3)
    it "returns the slope of the given vector, if not given any arguments", ->
      expect( $V(1,3).slope() ).toEqual(3)
      
  describe ".invert", ->
    it "returns a vector where the signs of all numbers are flipped", ->
      expect( $V.invert [1,3] ).toEqual( $V(-1,-3) )
    it "also works for a 3D vector", ->
      expect( $V.invert [1, -3, 8] ).toEqual( $V(-1, 3, -8) )
  describe "#invert", ->
    it "returns a vector where the signs of all my numbers are flipped", ->
      expect( $V(1,3).invert() ).toEqual( $V(-1,-3) )
    it "also works if I am a 3D vector", ->
      expect( $V(1, -3, 8).invert() ).toEqual( $V(-1, 3, -8) )
      
  describe '.limit', ->
    it "returns a copy of the first vector that's bounded by the second", ->
      expect( $V.limit [10,7], [5,6] ).toEqual( $V(5,6) )
    it "returns the same vector as the first if it's already inside the bound", ->
      expect( $V.limit [1,2], [5,6] ).toEqual( $V(1,2) )
  describe '#limit', ->
    it "returns a copy of me that's bounded by the given vector", ->
      expect( $V(10,7).limit [5,6] ).toEqual( $V(5,6) )
    it "returns the same vector as me if I'm already inside the bound", ->
      expect( $V(1,2).limit [5,6] ).toEqual( $V(1,2) )
      
  describe '.angle', ->
    it "returns a scalar value representing the angle of the given vector", ->
      expect( $V.angle [1,1] ).toEqual(Math.PI / 4)
    it "rotates the angle around if x is negative and y is positive", ->
      expect( $V.angle [-1,1] ).toEqual( 3/4 * Math.PI )
    it "rotates the angle around if x is negative and y is negative", ->
      expect( $V.angle [-1,-1] ).toEqual( 5/4 * Math.PI )
    it "returns pi/2 if x is 0 and y is positive", ->
      expect( $V.angle [0,1] ).toEqual(Math.PI / 2)
    it "returns -pi/2 if x is 0 and y is negative", ->
      expect( $V.angle [0,-1] ).toEqual(-Math.PI / 2)
  describe '#angle', ->
    it "returns a scalar value representing my angle", ->
      expect( $V(1,1).angle() ).toEqual(Math.PI / 4)
    it "rotates the angle around if my x is negative and y is positive", ->
      expect( $V(-1,1).angle() ).toEqual( 3/4 * Math.PI )
    it "rotates the angle around if my x is negative and y is negative", ->
      expect( $V(-1,-1).angle() ).toEqual( 5/4 * Math.PI )
    it "returns pi/2 if x is 0 and my y is positive", ->
      expect( $V(0,1).angle() ).toEqual(Math.PI / 2)
    it "returns -pi/2 if x is 0 and my y is negative", ->
      expect( $V(0,-1).angle() ).toEqual(-Math.PI / 2)
      
  describe '.isBeyond', ->
    it "returns true if the first given vector is further in the first quadrant than the second vector", ->
      expect( $V.isBeyond [2,2], [1,1] ).toBeTruthy()
    it "returns false if the first given vector is not further in the first quadrant than the second vector", ->
      expect( $V.isBeyond [1,1], [2,2] ).toBeFalsy()
  describe '#isBeyond', ->
    it "returns true if I am further in the first quadrant than the given vector", ->
      expect( $V(2,2).isBeyond([1,1]) ).toBeTruthy()
    it "returns false if I am not further in the first quadrant than the given vector", ->
      expect( $V(1,1).isBeyond([2,2]) ).toBeFalsy()