
'use strict';

(function() {
  var repulsion, Ball, canvas, objects

  repulsion = {
    // TODO
    applyTo: function (canvas, obj) {
      var bb, ob, f, newvel, k, dxa, dxb, dya, dyb, velslope, extra, xr, newpos

      // Smooth repulsion:
      // * at |x - p| = k, factor = 0
      // * at |x - p| = 0, factor = 1
      // So, factor for x direction is ((k - |x - p|) / k)

      // Calculate new displacement

      bb = canvas.getBounds()             // Box bounds
      ob = obj.getBounds()                // Object bounds
      f = 0.5
      newvel = obj.vel.slice(0)
      k = 30

      // The distance the object is past the bound
      dxa = Math.abs(ob[0][0] - bb[0][0])
      dxb = Math.abs(ob[0][1] - bb[0][1])
      dya = Math.abs(ob[1][0] - bb[1][0])
      dyb = Math.abs(ob[1][1] - bb[1][1])
      velslope = newvel[1] / newvel[0]

      // Modify the velocity by the amount the object is near the bound.
      // The closer the object is to the bound (and, technically, the further it is past the
      // "safe area" which is designated by k), the further it's pushed away.
      // As long as the object is near the bound, it's continually pushed away, and the
      // effect is that it eventually changes direction.
      //
      // FIXME: The problem with this is that when the object exits the force field it doesn't
      // quite return to its original velocity... also the force field may push with a bigger
      // force than the object itself
      if (dxa < k) {
        extra = ((k - dxa) / k)
        xr = f * extra
        newvel[0] += xr
      }
      if (dxb < k) {
        extra = ((k - dxb) / k)
        xr = f * extra
        debug("extra: ((" + k + " - " + dxb + ") / " + k + ") = " + extra)
        newvel[0] -= xr
      }
      if (dya < k) {
        extra = ((k - dya) / k)
        yr = f * extra
        newvel[1] += yr
      }
      if (dyb < k) {
        extra = ((k - dyb) / k)
        yr = f * extra
        newvel[1] -= yr
      }

      newpos = Vector.add(obj.pos, newvel)
      return [newpos, newvel]
    }
  }

  Ball = P(CanvasObject, function (proto, uber) {
    return {
      setOptions: function(options) {
        uber.setOptions.call(this, options)
        this.radius = options.radius
        this.width = this.height = options.radius * 2
      },

      /*
      defaultPosition: function() {
        return Vec2(700, 50)
      },
      */

      defaultVelocity: function() {
        return Vec2(8, 4)
      },

      setVel: function() {
        uber.setVel.call(this)
        collision.applyTo(this.canvas, this)
      },

      render: function() {
        uber.render.apply(this, arguments)
        this.canvas.circle(this.pos[0], this.pos[1], this.radius, {fill: this.color})
      }
    }
  })

  //---

  canvas = Canvas('#wrapper')
  objects = canvas.buildObjectCollection(CanvasObjectCollection)
  objects.addObject(Ball, {radius: 10})

  window.canvas = canvas
})()

