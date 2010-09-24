var Boid = function(boidColl) {
  this.boidColl = boidColl;
  this.canvas = boidColl.canvas;
  this.cxt = boidColl.cxt;
  this.pos = [
    Math.rand(this.canvas.canvasElement.width),
    Math.rand(this.canvas.canvasElement.height)
  ];
  this.disp = [Math.rand(-10, 10), Math.rand(-10, 10)];
}
$.extend(Boid, {
  size: [3, 3],
  maxSpeed: 5,
  containmentLimit: 40,
  containmentForce: 2
})
Boid.size = [3, 3];
$.extend(Boid.prototype, {
  draw: function() {
    var v1 = this.boidColl.applyRules(this);
    var v2 = this.containment(this);
    this.disp = Vector.add(this.disp, v1, v2);
    //this.disp = this.limitVelocity(this.disp);
    this.pos = Vector.add(this.pos, this.disp);
    this.cxt.fillRect(this.pos[0], this.pos[1], Boid.size[0], Boid.size[1]);
  },
  limitVelocity: function(v) {
    var m = Vector.magnitude(v),
        k = Boid.maxSpeed;
    if (m > k) {
      return [k * (v[0] / m), k * (v[1] / m)];
    } else {
      return v;
    }
  },
  containmentRule: function() {
    var x = this.pos[0],
        y = this.pos[1];
    var xa = 0,
        ya = 0,
        xb = this.canvas.canvasElement.width,
        yb = this.canvas.canvasElement.height;
    var k = Boid.containmentLimit;
    var f = Boid.containmentForce;
    
    var v = [0, 0];
    
    // smooth repulsion:
    // * at |x - p| = k, factor = 0
    // * at |x - p| = 0, factor = 1
    // so, force in x direction is ((k - |x - p|) / k)
    
    var dxa = x, dxb = (xb - x),
        dya = y, dyb = (yb - y);
    
    if (dxa < k) {
      var xr = f * ((k - dxa) / k);
      v[0] = xr;
    }
    else if (dxb < k) {
      var xr = f * ((k - dxb) / k);
      v[0] = -xr;
    }
    
    if (dya < k) {
      var yr = f * ((k - dya) / k);
      v[1] = yr;
    }
    else if (dyb < k) {
      var yr = f * ((k - dyb) / k);
      v[1] = -yr;
    }
    
    return v;
  }
})

var BoidCollection = function(canvas, length) {
  this.canvas = canvas;
  this.cxt = canvas.cxt;
  this.boids = [];
  for (var i=0; i<length; i++) this.boids.push(new Boid(this));
}
$.extend(BoidCollection, {
  separationLimit: 20
})
$.extend(BoidCollection.prototype, {
  draw: function() {
    for (var i=0; i<this.boids.length; i++) this.boids[i].draw();
  },
  applyRules: function(boid) {
    var cohesionDisp = this.cohesionRule(boid);
    var separationDisp = this.separationRule(boid);
    var alignmentDisp = this.alignmentRule(boid);
    return Vector.add(cohesionDisp, separationDisp, alignmentDisp);
  },
  //
  // Cohesion: Boids try to fly towards the center of mass of neighboring boids.
  //
  // The "center of mass" here, though, is actually the perceived center, because when a boid is
  // trying to figure out where the center is, though, it's not going to include itself (since it
  // can't see itself).
  //
  cohesionRule: function(boid) {
    var sum = [0, 0];
    var n = this.boids.length;
    var j = 0;
    for (var i=0; i<n; i++) {
      var b = this.boids[i];
      if (b == boid) continue;
      sum = Vector.add(sum, b.pos);
      j++;
    }
    // the avg is the centroid
    var avg = Vector.divide(sum, j);
    // the diff is the line pointing from me to the centroid
    var diff = Vector.subtract(avg, boid.pos);
    // so, my displacement vector is a small movement toward the centroid
    var v = Vector.divide(diff, 100);
    return v;
  },
  //
  // Separation: Boids try to keep a small distance away from other objects (including other boids).
  //
  // If we didn't have this here, the boids would collide with each other. In order to prevent this,
  // we simply look at each boid, and if it's within a certain range of another boid, we start to
  // move it as far away again as it already is (with a smooth acceleration).
  //
  // It's worth noting that this rule will apply doubly -- if two boids are within the same
  // disallowed range, both will back away from each other.
  //
  separationRule: function(boid) {
    var v = [0, 0];
    var k = BoidCollection.separationLimit;
    for (var i=0; i<this.boids.length; i++) {
      var b = this.boids[i];
      if (b == boid) continue;
      // distance here is a scalar, the length of the line from me to you
      var dist = Vector.distance(b.pos, boid.pos);
      if (dist < k) {
        // the diff is the line pointing from you to me
        var diff = Vector.subtract(boid.pos, b.pos);
        // there is a stronger force when I am nearer to you and a weaker force when I am farther
        // at dist = 0, factor = 1
        // at dist = k, factor = 0
        var 
        // if there are multiple boids within proximity, I will back away from their positions collectively
        v = Vector.add(v, diff);
      }
    }
    return v;
  },
  // Rule 3: Boids try to match velocity with near boids.
  // This is similar to Rule 1, however instead of averaging the positions of the other boids we
  // average the velocities. We calculate a 'perceived velocity', then add a small portion
  // (about an eighth) to the boid's current velocity.
  alignmentRule: function(boid) {
    var totalVelocity = [0, 0];
    for (var i=0; i<this.boids.length; i++) {
      var b = this.boids[i];
      if (b == boid) continue;
      totalVelocity = Vector.add(totalVelocity, b.disp);
    }
    var avgVelocity = Vector.divide(totalVelocity, this.boids.length - 1);
    var difference = Vector.subtract(avgVelocity, boid.disp);
    var displacement = Vector.divide(difference, 8);
    return displacement;
  }
})

var BoidsCanvas = Canvas.extend({
  init: function(id) {
    this._super(id);
    this.boidColl = new BoidCollection(this, 100);
  },
  draw: function() {
    this._super();
    this.boidColl.draw();
  }
})

$(function() {
  var canvas = new BoidsCanvas("#canvas");
})