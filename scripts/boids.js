(function() {
  var init = function() {
    
    var BoidsCanvas = Canvas.extend();
    
    var Boid = Shape.extend({
      setOptions: function(options) {
        this._super(options);
        this.index = options.index;
      },
      //defaultPosition: function() {
      //  return new Vector(100, 100);
      //},
      //defaultVelocity: function() {
      //  return new Vector(2, 2);
      //},
      width: function() {
        return this.options.width;
      },
      height: function() {
        return this.options.height;
      },
      setAcc: function() {
        // do nothing for right now
      },
      setVel: function() {
        var vel = this.parent.applyRules(this);
        this.vel = Vector.add(this.vel, vel);
        //this.vel = Vector.limit(this.vel, [Boid.maxSpeed, Boid.maxSpeed]);
      },
      drawShape: function() {
        var color = (this.index == 0) ? "red" : "black";
        this.cxt.triangle(this.pos[0], this.pos[1], this.width(), this.height(), {
          rotate: this.vel.angle(),
          fill: color
        });
      }
    },
    {
      maxSpeed: 5
    })

    Collision.mixin({
      canvasClass: BoidsCanvas,
      objectClasses: [Boid]
    })

    var canvas = window.canvas = new BoidsCanvas("#wrapper", {
      width: 800,
      height: 600,
      fps: 30//,
      //trackFps: true,
      //showClock: true
    });
    canvas.objects.addMany(60, Boid, function(i) { return {width: 8, height: 6, index: i} });
    $.extend(canvas.objects, {
      sepDistLimit: 50,
      sepVelLimit: 5,
      redraw: function() {
        // In real life, all boids make a decision on where they'll move next *at the same time*
        // This fixes the case where the distance between boid A and B is not the same as
        // the distance between B and A when in fact their distances *are* the same
        $.each(this, function(i, boid) { boid.setVel() })
        $.each(this, function(i, boid) { boid.setPos(); boid.drawShape() })
      },
      applyRules: function(boid) {
        var cohesionVel = this.cohesionRule(boid);
        //debug("cohesionVel: " + cohesionVel);
        var separationVel = this.separationRule(boid);
        //debug("separationVel: " + separationVel);
        var alignmentVel = this.alignmentRule(boid);
        //debug("alignmentVel: " + alignmentVel);
        return Vector.add(
          cohesionVel,
          separationVel,
          alignmentVel
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
        var sum = new Vector(0, 0);
        var j = 0;
        $.each(this, function(i, b) {
          if (b == boid) return;
          sum = Vector.add(sum, b.pos);
          j++;
        })
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
        var vector = new Vector(0, 0);
        var kr = this.sepDistLimit;
        var kv = this.sepVelLimit;
        $.each(this, function(i, b) {
          if (b == boid) return;
          // Distance here is a scalar, the length of the line from me to you
          var r1 = Vector.distance(b.pos, boid.pos);
          if (r1 < kr) {
            // There is a stronger force when I am nearer to you and a weaker force when I am farther
            var a = 0.05;
            var r2 = (kr - r1) / Math.pow((a * r1) + Math.sqrt(kr / kv), 2);
            // Basically we want to scale the vector between me and you down to m.
            // This is just derived from the triangle similarity rule (all sides of a similar
            // triangle are in proportion).
            var m = r2 / r1;
            var v = Vector.multiply(Vector.subtract(b.pos, boid.pos), m);
            // If there are multiple boids within proximity, I will back away from their positions collectively
            vector = Vector.subtract(vector, v);
          }
        });
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
        var sum = new Vector(0, 0);
        var j = 0;
        $.each(this, function(i, b) {
          if (b == boid) return;
          sum = Vector.add(sum, b.vel);
          j++;
        });
        // The avg velocity (direction + heading) out of every boid but me
        var avg = Vector.divide(sum, j);
        // The diff is the line pointing from me to the new velocity
        var diff = Vector.subtract(avg, boid.vel);
        // So, my new velocity is a small movement toward the avg velocity
        var vector = Vector.divide(diff, 8);
        return vector;
      }
    })
    
  }; // end init

  // Require dependencies, load the real code
  var deps = [
    "order!scripts/lib/shape.js",
    "order!scripts/lib/collision.mixin.js"
  ];
  deps = baseDeps.concat(deps);
  require(baseConfig, deps, init);
})()