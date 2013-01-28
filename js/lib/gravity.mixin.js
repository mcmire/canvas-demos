
'use strict'

var Gravity = {
  mixin: function(args) {
    args.canvasClass.prototype.objectGravity = function(obj) {
      var newvel, balls, newpos
      newvel = obj.vel.slice(0)
      balls = args.objects.call(this)
      $.v.each(balls, function(ball) {
        var f
        if (ball == obj) return
        f = this.gravityForce(obj)
        newvel = Vector.add(newvel, f)
      })
      newvel = Vector.limit(newvel, [20, 20])
      newpos = Vector.add(obj.pos, newvel)
      return [newpos, newvel]
    }

    $.v.each(args.objectClasses, function(klass) {
      klass.prototype.init = (function(original) {
        return function() {
          original.apply(this, arguments)
          this.mass = this.options.mass
          this.forceDirection = (this.options.type == "repulsive") ? -1 : 1
        }
      })(klass.prototype.init)

      klass.prototype.draw = (function(original) {
        return function() {
          var vectors
          vectors = this.canvas.objectGravity(this)
          this.pos = vectors[0]
          this.vel = vectors[1]
          original.apply(this, arguments)
        }
      })(klass.prototype.draw)

      // FAIL: If this mass is smaller, then the gforce is smaller
      // Is that supposed to happen?
      klass.prototype.gravityForce = function(obj) {
        var G, r, F, Fx, Fy
        G = 6.67428 * Math.pow(10, -11)
        r = Vector.distance(this.pos, obj.pos)
        F = this.forceDirection * G * (this.mass * obj.mass) / Math.pow(r, 2)
          // http://www.richardsimoes.com/gravity.html
        Fx = (this.pos[0] - obj.pos[0]) / r * F
        Fy = (this.pos[1] - obj.pos[1]) / r * F
        return [Fx, Fy]
      }
    })
  }
}

