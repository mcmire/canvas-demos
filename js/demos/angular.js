
'use strict';

(function() {
  var Projectile, canvas, canvasObjects

  Projectile = P(CanvasObject, function (proto, uber, klass) {
    klass.maxSpeed = 5
    return {
      setOptions: function (opts) {
        uber.setOptions.apply(this, arguments)
        this.vel = Vec2(3,0)
        this.pos = Vec2(200,200)
      },

      calculateForces: function (nextState, t) {
        var values = {},
            linearForce,
            angularForce,
            forceAmount = 0.3,
            forceDampening = 0.1,
            torqueAmount = 0.3,
            torqueDampening = 0.1

        linearForce = Vec2()
        if (keyboard.keyIsPressed('UP')) {
          linearForce += forceAmount
        }
        // apply viscous damper force  (from F = kx - cv)
        // XXX: don't we want to damp velocity and not force?
        linearForce -= Vec2.mul(nextState.velocity, forceDampening)
        if (linearForce < 0.001) {
          linearForce = 0
        }

        angularForce = 0
        if (keyboard.keyIsPressed('LEFT')) {
          angularForce += torqueAmount
        } else if (keyboard.keyIsPressed('RIGHT')) {
          angularForce -= torqueAmount
        }
        // apply viscous damper force  (from F = kx - cv)
        // XXX: don't we want to damp velocity and not force?
        angularForce -= Vec2.mul(nextState.angularVelocity, torqueDampening)
        if (angularForce < 0.001) {
          angularForce = 0
        }

        values.torque = angularForce
        values.force = Vec2.rotate(Vec2(linearForce, 0), angularForce)

        return values
      },

      draw: function () {
        var pos, ori, color
        pos = this.interpState.position
        ori = this.interpState.orientation
        color = (this.index == 0) ? "red" : "black"
        this.canvas.triangle(pos[0], pos[1], this.width, this.height, {
          rotate: ori,
          fill: color
        })
      }
    }
  })

  //---

  canvas = Canvas("#wrapper", {
    width: 1000,
    height: 400
  })
  canvasObjects = canvas.buildObjectCollection(CanvasObjectCollection)
  canvasObjects.addObject(Projectile, {
    width: 8,
    height: 6,
    position: Vec2(canvas.height - 6),
    orientation: (Math.PI / 2),
    gravity: false
  })

  window.canvas = canvas
})()

