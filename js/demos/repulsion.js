
'use strict';

(function() {
  var repulsion, Ball, canvas, objects

  repulsion = {
    // TODO
    applyTo: function (canvas, obj) {
      var bb, ob, f, newvel, q, dxa, dxb, dya, dyb, velslope, extra, xr, newpos

      // Smooth repulsion:
      // * at |a - b| = q, factor = 0
      // * at |a - b| = 0, factor = 1
      // So, factor for x direction is ((q - |a - b|) / q)

      // Calculate new displacement

      bb = canvas.getBounds()             // Box bounds
      ob = obj.getBounds()                // Object bounds
      f = 0.5
      newvel = obj.vel.slice(0)
      q = 30

      // The distance the object is past the bound
      dxa = Math.abs(ob[0][0] - bb[0][0])
      dxb = Math.abs(ob[0][1] - bb[0][1])
      dya = Math.abs(ob[1][0] - bb[1][0])
      dyb = Math.abs(ob[1][1] - bb[1][1])
      velslope = newvel[1] / newvel[0]

      // Modify the velocity by the amount the object is near the bound.
      // The closer the object is to the bound (and, technically, the further it is past the
      // "safe area" which is designated by q), the further it's pushed away.
      // As long as the object is near the bound, it's continually pushed away, and the
      // effect is that it eventually changes direction.
      //
      // FIXME: The problem with this is that when the object exits the force field it doesn't
      // quite return to its original velocity... also the force field may push with a bigger
      // force than the object itself
      if (dxa < q) {
        extra = ((q - dxa) / q)
        xr = f * extra
        newvel[0] += xr
      }
      if (dxb < q) {
        extra = ((q - dxb) / q)
        xr = f * extra
        debug("extra: ((" + q + " - " + dxb + ") / " + q + ") = " + extra)
        newvel[0] -= xr
      }
      if (dya < q) {
        extra = ((q - dya) / q)
        yr = f * extra
        newvel[1] += yr
      }
      if (dyb < q) {
        extra = ((q - dyb) / q)
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

      accelerationAt: function(obj, t) {
        var q, b, acc, spring, diff
        q = 32
        b = 1
        acc = Vec2(0,0)
        spring = Vec2(200,170)
        diff = Vec2(0,0)
        Vec2.sub(spring, obj.pos, diff)
        acc[0] = q * (diff[0] / this.mass) - b * obj.vel[0]
        acc[1] = q * (diff[1] / this.mass) - b * obj.vel[1]
        //console.log(JSON.stringify({acc: acc}))
        return acc
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
  objects.addObject(Ball, {
    radius: 10,
    pos: Vec2(200,250),
    //vel: Vec2(0,0),
    mass: 1
  })

  window.canvas = canvas
})()

