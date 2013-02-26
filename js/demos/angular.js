
'use strict';

(function() {
  var keys, keyTracker, Plank, Ship, Projectile, canvas, canvasObjects

  keys = ['KEY_LEFT', 'KEY_RIGHT', 'KEY_UP', 'KEY_DOWN', 'KEY_SPACE']
  keyTracker = keyboard.KeyTracker($.v.map(keys, function (key) {
    return keyboard.keys[key]
  }))

  Plank = P(CanvasObject, function (proto, uber) {
    proto.draw = function () {
      var state = this.interpState
      this.canvas.rect(state.position[0], state.position[1], this.width, this.height, {
        rotate: state.orientation,
        stroke: 'black'
      })
    }
  })

  Ship = P(CanvasObject, function (proto, uber, klass) {
    var periodicLogger = PeriodicLogger()
    return {
      calculateForces: function () {
        var state = this.currState,
            forces = {force: Vec2(0,0), torque: 0}

        // It is important that force and torque are calculated fresh every
        // iteration. They cannot persist across iterations because then
        // we would have to apply the dampening logic per iteration. This does
        // not work b/c it creates a wobbling effect (where force + velocity and
        // torque + angularVelocity will circle each other)

        if (keyboard.isTrackedKeyPressed('KEY_UP')) {
          forces.force = Vec2.fromPolarCoords(30, state.orientation)
        }
        if (keyboard.isTrackedKeyPressed('KEY_LEFT')) {
          forces.torque = -0.4
          Vec2.add(forces.force, Vec2.fromPolarCoords(4, state.orientation + Math.TAU / 16))
        } else if (keyboard.isTrackedKeyPressed('KEY_RIGHT')) {
          forces.torque = 0.4
          Vec2.add(forces.force, Vec2.fromPolarCoords(4, state.orientation - Math.TAU / 16))
        }

        // apply viscous damper force in the opposite direction
        // (from F = kx - cv)
        Vec2.sub(forces.force, Vec2.nmul(state.velocity, 0.35))
        Vec2.floor(forces.force, 0.001)

        // apply viscous damper force in the opposite direction
        // (from F = kx - cv)
        forces.torque -= (state.angularVelocity * 0.35)
        forces.torque = util.math.floor(forces.torque, 0.001)

        return forces
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

  Projectile = P(CanvasObject, function (proto, uber, klass) {
    var periodicLogger = PeriodicLogger()
    return {
      init: function () {
        uber.init.apply(this, arguments)
        this.wasLaunched = false
      },

      handleInput: function () {
        var state = this.currState
        if (keyboard.isTrackedKeyPressed('KEY_LEFT')) {
          state.orientation -= 0.05
        } else if (keyboard.isTrackedKeyPressed('KEY_RIGHT')) {
          state.orientation += 0.05
        }
        if (keyboard.isTrackedKeyPressed('KEY_SPACE') && !this.launchTime) {
          this.launchTime = (new Date()).getTime()
          this.hasGravity = true
        }
      },

      calculateForces: function () {
        var state = this.currState,
            forces = {force: Vec2(0,0), torque: 0},
            launchTimeElapsed

        if (this.launchTime) {
          launchTimeElapsed = (new Date()).getTime() - this.launchTime
          if (launchTimeElapsed < 1000) {
            forces.force = Vec2.fromPolarCoords(60, state.orientation)
          }
        }

        if (this.hasGravity) {
          // add gravity
          Vec2.sub(forces.force, Vec2(0, -30))
        }
        // apply viscous damper force in the opposite direction
        // (from F = kx - cv)
        Vec2.sub(forces.force, Vec2.nmul(state.velocity, 0.05))
        Vec2.floor(forces.force, 0.001)

        return forces
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
  canvasObjects.addObject(Plank, {
    width: 15,
    height: (canvas.height - 10),
    position: Vec2((canvas.width / 2) - 100, canvas.height / 2),
    orientation: -(Math.TAU / 8),
    hasGravity: false
  })
  /*
  canvasObjects.addObject(Ship, {
    width: 15,
    height: 12,
    position: Vec2(canvas.width / 2, canvas.height / 2),
    orientation: -(Math.TAU / 4),
    hasGravity: false
  })
  */
  canvasObjects.addObject(Projectile, {
    width: 15,
    height: 12,
    position: Vec2(50, canvas.height - 50),
    orientation: -(Math.TAU / 8),
    hasGravity: false
  })

  canvas.keyboard.addKeyTracker(keyTracker)
  canvas.addEvents()

  window.canvas = canvas
})()

