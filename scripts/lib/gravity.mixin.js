var Gravity = {
  mixin: function(args) {
    args.canvasClass.prototype.objectGravity = function(obj) {
      var newvel = obj.vel.slice(0);
      var balls = args.objects.call(this);
      $.each(balls, function() {
        if (this == obj) return;
        var f = this.gravityForce(obj);
        newvel = Vector.add(newvel, f);
      })
      newvel = Vector.limit(newvel, [20, 20]);
      var newpos = Vector.add(obj.pos, newvel);
      return [newpos, newvel];
    }
    
    $.each(args.objectClasses, function(i, klass) {
      klass.prototype.init = (function(original) {
        return function() {
          original.apply(this, arguments);
          this.mass = this.options.mass;
          this.forceDirection = (this.options.type == "repulsive") ? -1 : 1;
        }
      })(klass.prototype.init);
      
      klass.prototype.draw = (function(original) {
        return function() {
          var vectors = this.canvas.objectGravity(this);
          this.pos = vectors[0];
          this.vel = vectors[1];
          original.apply(this, arguments);
        }
      })(klass.prototype.draw);
      
      // FAIL: If this mass is smaller, then the gforce is smaller
      // Is that supposed to happen?
      klass.prototype.gravityForce = function(obj) {
        var G = 6.67428 * Math.pow(10, -11)
        var r = Vector.distance(this.pos, obj.pos);
        var F = this.forceDirection * G * (this.mass * obj.mass) / Math.pow(r, 2);
        // http://www.richardsimoes.com/gravity.html
        var Fx = (this.pos[0] - obj.pos[0]) / r * F;
        var Fy = (this.pos[1] - obj.pos[1]) / r * F;
        return [Fx, Fy];
      }
    })
  }
};