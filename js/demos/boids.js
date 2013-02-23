
'use strict';

(function() {
  var Boid, BoidCollection, canvas, boids

  Boid = P(CanvasObject, function (proto, uber, klass) {
    klass.maxSpeed = 5
    return {
      setOptions: function(options) {
        uber.setOptions.call(this, options)
        this.index = options.index
      },

      update: function (t, dt) {
        this.boidAcc = this.parent.calculateBoidAcc(boid)
      },

      accelerationAt: function(newState, t) {
        this.parent.applyRulesTo(this, newState, t)
      },

      render: function() {
        var color
        color = (this.index == 0) ? "red" : "black"
        this.canvas.triangle(this.pos[0], this.pos[1], this.width, this.height, {
          rotate: Vec2.angle(this.vel),
          fill: color
        })
      }
    }
  })

  BoidCollection = P(DrawableCollection, function () {
    return {
      sepDistLimit: 50,
      sepVelLimit: 5,

      redraw: function () {
        var len, i
        len = this.objects.length
        // In real life, all boids make a decision on where they'll move next
        // *at the same time* This fixes the case where the distance between
        // boid A and B is not the same as the distance between B and A when in
        // fact their distances *are* the same
        for (i = 0; i < len; i++) {
          this.objects[i].setVel()
        }
        for (i = 0; i < len; i++) {
          this.objects[i].setPos()
          this.objects[i].render()
        }
      },

      applyRulesTo: function (boid) {
        var deltaAcc = Vec2(0,0)
        this._applyCohesionRule(boid, deltaAcc)
        this._applySeparationRule(boid, deltaAcc)
        this._applyAlignmentRule(boid, deltaAcc)
      },

      // Cohesion: Boids try to fly towards the center of mass of neighboring
      // boids.
      //
      // The "center of mass" here, though, is actually the perceived center,
      // because when a boid is trying to figure out where the center is,
      // though, it's not going to include itself (since it can't see itself).
      //
      _applyCohesionRule: function (boid, deltaAcc) {
        var i, len, numNearBoids, v, w, dist
        // Calculate the center of nearby boids
        i = 0
        j = 0
        len = this.objects.length
        numNearBoids = 0
        w = Vec2(0,0)
        while (i < len) {
          v = Vec2(0,0)
          if (this.objects[i] !== boid) {
            Vec2.sub(boid.pos, this.objects[i].pos, v)
            dist = Vec2.mag(v)
            if (v <= 40) {
              Vec2.add(w, this.objects[i].pos)
              numNearBoids++
            }
          }
          i++
        }
        Vec2.div(w, numNearBoids)
        // The diff is the line pointing from me to the centroid
        Vec2.sub(w, boid.pos)
        // So, my displacement vector is a small movement toward the centroid
        Vec2.div(w, 100)
        // Apply the rule
        Vec2.add(deltaAcc, w)
      },

      // Separation: Boids try to keep a small distance away from other objects
      // (including other boids).
      //
      // If we didn't have this here, the boids would collide with each other.
      // In order to prevent this, we simply look at each boid, and if it's
      // within a certain range of another boid, we start to move it as far away
      // again as it already is (with a smooth acceleration).
      //
      // It's worth noting that this rule will apply doubly -- if two boids are
      // within the same disallowed range, both will back away from each other.
      //
      _applySeparationRule: function (boid) {
        var v1, kr, kv, i
        v1 = Vec2(0,0)
        kr = this.sepDistLimit
        kv = this.sepVelLimit
        for (i = 0, len = this.objects.length; i < len; i++) {
          var r1, a, r2, m, v2
          v2 = Vec2(0,0)
          if (this.objects[i] === boid) continue
          // Distance here is a scalar, the length of the line from me to you
          r1 = Vec2.dist(this.objects[i].pos, boid.pos)
          if (r1 < kr) {
            // There is a stronger force when I am nearer to you and a weaker
            // force when I am farther
            a = 0.05
            r2 = (kr - r1) / Math.pow((a * r1) + Math.sqrt(kr / kv), 2)
            // Basically we want to scale the vector between me and you down to
            // m. This is just derived from the triangle similarity rule (all
            // sides of a similar triangle are in proportion).
            m = r2 / r1
            Vec2.sub(this.objects[i].pos, boid.pos, v2)
            Vec2.mul(v2, m)
            // If there are multiple boids within proximity, I will back away
            // from their positions collectively
            Vec2.sub(v1, v2)
          }
        }
        // Apply the rule
        Vec2.add(boid.vel, v1)
      },

      // Alignment: Boids try to match velocity with near boids.
      //
      // This is similar to Rule 1, however instead of averaging the positions
      // of the other boids we average the velocities. We calculate a 'perceived
      // velocity', then add a small portion to the boid's current velocity.
      //
      _applyAlignmentRule: function (boid) {
        var v, i, j
        v = Vec2(0,0)
        for (i = 0, j = 0, len = this.objects.length; i < len; i++) {
          if (this.objects[i] === boid) continue
          Vec2.add(v, this.objects[i].vel)
          j++
        }
        // The avg velocity (direction + heading) out of every boid but me
        Vec2.div(v, j)
        // The diff is the line pointing from me to the new velocity
        Vec2.sub(v, boid.vel)
        // So, my new velocity is a small movement toward the avg velocity
        Vec2.div(v, 8)
        // Apply the rule
        Vec2.add(boid.vel, v)
      }
    }
  })

  //---

  canvas = Canvas("#wrapper", {
    width: 800,
    height: 600,
    fps: 30//,
    //trackFps: true,
    //showClock: true
  })
  boids = canvas.buildObjectCollection(BoidCollection)
  for (var i = 0; i < 60; i++) {
    boids.addObject(Boid, {width: 8, height: 6, index: i})
  }

  window.canvas = canvas
})()

