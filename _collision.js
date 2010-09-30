var Collision = {
  mixin: function(args) {
    args.canvasClass.prototype.collision = function(obj) {
      /* Calculate new displacement */

      var bb = this.bounds();
      // Go ahead and calculate new position based on present velocity
      // even if it goes past the bound
      var newpos = Vector.add(obj.pos, obj.vel);
      var ob = obj.bounds(newpos);

      // The distance the object is past the bound
      var dxa = (bb[0][0] - ob[0][0]);
      var dxb = (ob[0][1] - bb[0][1]);
      var dya = (bb[1][0] - ob[1][0]);
      var dyb = (ob[1][1] - bb[1][1]);
      var velslope = (obj.vel[1] / obj.vel[0]);

      // If the position did cross over a bound, back up the object by a portion
      // of the velocity which will put the object exactly touching the bound
      if (dxa > 0) {
        newpos[0] += dxa;
        newpos[1] += dxa * velslope;
      }
      else if (dxb > 0) {
        newpos[0] -= dxb;
        newpos[1] -= dxb * velslope;
      }
      else if (dya > 0) {
        newpos[1] += dya;
        newpos[0] += dya / velslope;
      }
      else if (dyb > 0) {
        newpos[1] -= dyb;
        newpos[0] -= dyb / velslope;
      }

      /* Calculate new velocity which will apply for animation steps after the object
         hitting the bound */

      // We have to separate this from the above logic since pos + vel alone may end up
      // hitting the bound in which case none of the above logic has been executed
      if (dxa > 0 || dxb > 0 || dya > 0 || dyb > 0) {
        ob = obj.bounds(newpos);
      }
      var newvel = obj.vel.slice(0);
      if (ob[0][0] == bb[0][0] || ob[0][1] == bb[0][1]) newvel[0] = newvel[0] * -1;
      if (ob[1][0] == bb[1][0] || ob[1][1] == bb[1][1]) newvel[1] = newvel[1] * -1;

      return [newpos, newvel];
    };
    
    $.each(args.objectClasses, function(i, klass) {
      klass.prototype.draw = (function(original) {
        return function() {
          var vectors = this.canvas.collision(this);
          this.pos = vectors[0];
          this.vel = vectors[1];
          original.apply(this, arguments);
        }
      })(this.prototype.draw);
      
      klass.prototype.bounds = function(pos) { // x1, x2, y1, y2
        var pos = pos || this.pos;
        return [
          [pos[0] - this.width/2, pos[0] + this.width/2],
          [pos[1] - this.height/2, pos[1] + this.height/2]
        ]
      }
    });
  }
}