var Boid = Class.extend({
  init: function(boidColl, options) {
    this.boidColl = boidColl;
    this.canvas = boidColl.canvas;
    this.cxt = this.canvas.cxt;
    this.options = options;
    this.width = options.width;
    this.height = options.height;
    this.pos = options.pos || this.canvas.randomPos(this.width, this.height);
    this.vel = options.vel || this.canvas.randomVel();
    this.index = options.index;
  },
  aim: function() {
    var vel = this.boidColl.applyRules(this);
    this.vel = Vector.add(this.vel, vel);
    //this.vel = Vector.limit(this.vel, [Boid.maxSpeed, Boid.maxSpeed]);
  },
  move: function() {
    this.pos = Vector.add(this.pos, this.vel);

    /*
    debug("vel: " + this.vel);
    if (this.lastpos) {
      this.cxt.save();
      this.cxt.beginPath();
      this.cxt.moveTo(this.lastpos[0], this.lastpos[1]);
      this.cxt.lineTo(this.pos[0], this.pos[1]);
      this.cxt.closePath();
      this.cxt.strokeStyle = "blue";
      this.cxt.stroke();
      this.cxt.restore();
    }
    */

    /*
    //if (boid.index == 0) {

      this.cxt.save();
      this.cxt.beginPath();
      this.cxt.moveTo(this.pos[0], this.pos[1]);
      this.cxt.lineTo(this.pos[0] - this.vel[0], this.pos[1] - this.vel[1]);
      this.cxt.closePath();
      this.cxt.strokeStyle = "blue";
      this.cxt.stroke();
      this.cxt.restore();
    //}
    */

    this.lastpos = this.pos;
  },
  draw: function() {
    this.move();
    this.drawShape();
  },
  drawShape: function() {
    this.cxt.save();
    this.cxt.fillStyle = (this.index == 0) ? "red" : "black";
    this.cxt.beginPath();
    this.cxt.translate(this.pos[0], this.pos[1])
    var theta = Vector.angle(this.vel);
    this.cxt.rotate(theta);
    this.cxt.triangle(0, 0, this.width, this.height);
    this.cxt.closePath();
    this.cxt.fill();
    this.cxt.restore();
    /*
    this.cxt.font = "bold 12px sans-serif";
    this.cxt.fillText(this.index + " (" + this.pos[0] + ", " + this.pos[1] + ")", this.pos[0] - 30, this.pos[1] - 15)
    */
  }
})
$.extend(Boid, {
  size: [3, 3],
  maxSpeed: 5//,
  //containmentLimit: 40,
  //containmentForce: 2
})

var BoidCollection = {
  Methods: {
    draw: function() {
      // In real life, all boids make a decision on where they'll move next *at the same time*
      // This fixes the case where the distance between boid A and B is not the same as
      // the distance between B and A when in fact their distances *are* the same
      for (var i=0; i<this.length; i++) {
        this[i].aim();
      }
      for (var i=0; i<this.length; i++) {
        this[i].draw();
      }
    },
    applyRules: function(boid) {
      //var cohesionVel = this.cohesionRule(boid);
      //debug("cohesionVel: " + cohesionVel);
      var separationVel = this.separationRule(boid);
      debug("separationVel: " + separationVel);
      //var alignmentVel = this.alignmentRule(boid);
      //debug("alignmentVel: " + alignmentVel);
      return Vector.add(
        //cohesionVel,
        separationVel//,
        //alignmentVel
      );
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
      var n = this.length;
      var j = 0;
      for (var i=0; i<n; i++) {
        var b = this[i];
        if (b == boid) continue;
        sum = Vector.add(sum, b.pos);
        j++;
      }
      // The avg is the centroid
      var avg = Vector.divide(sum, j);
      // The diff is the line pointing from me to the centroid
      var diff = Vector.subtract(avg, boid.pos);
      // So, my displacement vector is a small movement toward the centroid
      var vector = Vector.divide(diff, 100);
      return vector;
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
      var vector = [0, 0];
      var kr = BoidCollection.sepDistLimit;
      var kv = BoidCollection.sepVelLimit;
      for (var i=0; i<this.length; i++) {
        var b = this[i];
        if (b == boid) continue;
        // Distance here is a scalar, the length of the line from me to you
        var r1 = Vector.distance(b.pos, boid.pos);
        if (r1 < kr) {
          // There is a stronger force when I am nearer to you and a weaker force when I am farther
          var a = 1/20;
          var r2 = (kr - r1) / Math.pow((a * r1) + Math.sqrt(kr / kv), 2);
          // Basically we want to scale the vector between me and you down to m.
          // This is just derived from the pythagorean theorem + the slope formula
          //  given r and m solving for x and y.
          //
          // This is just a quicker way of saying something like:
          //
          //   Vector.multiply(Vector.normalize(Vector.subtract(b.pos, boid.pos)), m)
          //
          // FIXME: This still isn't working -- all boids are shifting left -- x always ends up being negative
          var m = r2 / r1;
          var x1 = b.pos[0] - boid.pos[0];
          var y1 = b.pos[1] - boid.pos[1];
          var x2 = x1 * m;
          var y2 = y1 * m;
          var v = [x2, y2];
          /*
          var v;
          if (boid.pos[0] == b.pos[0]) {
            var x = 0;
            var y = r2;
            if (boid.vel[1] < 0) y *= -1;
            v = [x, y];
          } else {
            var m = Vector.slope(boid.pos, b.pos);
            var x = Math.sqrt((r2*r2) / (m*m + 1));
            if (boid.vel[0] < 0) x *= -1;
            var y = m * x;
            v = [x, y];
          }
          */
          /*
          if (boid.index == 0) {
          */
            debug("<b>boid.index: " + boid.index + "</b>")
            debug("b.index: " + b.index);
            debug("r1: " + r1);
            debug("r2: (" + kr + " - " + r1 + ") / Math.pow((" + a + " * " + r1 + ") + Math.sqrt(" + kr + " / " + kv + ")), 2) = " + r2);
            debug("m: " + m);
            debug("v: " + v);
          /*
          }
          */
          // if there are multiple boids within proximity, I will back away from their positions collectively
          vector = Vector.subtract(vector, v);
        }
      }
      /*
      if (boid.index == 0) {
        debug("vector: " + vector);
        /*
        this.cxt.beginPath();
        var theta = Vector.angle(Vector.subtract([x,y], boid.pos));
        this.cxt.rotate(theta);
        this.cxt.triangle(boid.pos[0], boid.pos[0], 3, 3);
        this.cxt.closePath();
        this.cxt.fill();
        *\/
      }
      */
      return vector;
    },
    //
    // Alignment: Boids try to match velocity with near boids.
    //
    // This is similar to Rule 1, however instead of averaging the positions of the other
    // boids we average the velocities. We calculate a 'perceived velocity', then add a
    // small portion to the boid's current velocity.
    //
    alignmentRule: function(boid) {
      var sum = [0, 0];
      var j = 0;
      for (var i=0; i<this.length; i++) {
        var b = this[i];
        if (b == boid) continue;
        sum = Vector.add(sum, b.vel);
        j++;
      }
      // The avg velocity (direction + heading) out of every boid but me
      var avg = Vector.divide(sum, j);
      // The diff is the line pointing from me to the new velocity
      var diff = Vector.subtract(avg, boid.vel);
      // So, my new velocity is a small movement toward the avg velocity
      var vector = Vector.divide(diff, 8);
      return vector;
    }
  },
  create: function(canvas, length) {
    var coll = [];
    coll.canvas = canvas;
    coll.cxt = canvas.cxt;
    /*
    for (var i=0; i<length; i++) {
      var boid = new Boid(coll, {width: 5, height: 8, index: i});
      coll.push(boid);
    }
    */
    coll.push( new Boid(coll, {width: 5, height: 8, index: 0, pos: [50, 200], vel: [5, 0]}) )
    coll.push( new Boid(coll, {width: 5, height: 8, index: 1, pos: [350, 200],  vel: [-5, 0]}) )
    coll.push( new Boid(coll, {width: 5, height: 8, index: 2, pos: [600, 100], vel: [0, 5]}) )
    coll.push( new Boid(coll, {width: 5, height: 8, index: 3, pos: [600, 400], vel: [0, -5]}) )
    $.extend(coll, BoidCollection.Methods);
    return coll;
  },
  sepDistLimit: 100,
  sepVelLimit: 5
};

var BoidsCanvas = Canvas.extend({
  init: function(id) {
    this._super(id);
    this.boidColl = BoidCollection.create(this, 5);
  },
  draw: function() {
    this._super();
    this.boidColl.draw();
  }
})

Collision.mixin({
  canvasClass: BoidsCanvas,
  objectClasses: [Boid]
})

$(function() {
  var canvas = new BoidsCanvas("#canvas");
})