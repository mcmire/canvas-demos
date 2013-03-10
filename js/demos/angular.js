
'use strict';

(function() {
  var keys, keyTracker
  var Plank, Projectile
  var canvas, canvasObjects, plank, projectile

  keys = ['KEY_LEFT', 'KEY_RIGHT', 'KEY_UP', 'KEY_DOWN', 'KEY_SPACE']
  keyTracker = keyboard.KeyTracker($.v.map(keys, function (key) {
    return keyboard.keys[key]
  }))

  Plank = P(CanvasObject, function (proto, uber) {
    proto.init = function () {
      uber.init.apply(this, arguments)
      proto.setDimensions({width: 15, height: canvas.height - 10})
      proto.disableGravity()
    }

    proto.draw = function () {
      var state = this.renderState,
          dims = this.dimensions
      this.canvas.rect(state.position[0], state.position[1], dims.width, dims.height, {
        rotate: state.orientation,
        stroke: 'black'
      })
    }
  })

  Projectile = P(CanvasObject, function (proto, uber, klass) {
    var periodicLogger = PeriodicLogger()

    CanvasObject.hasAutonomousUpdates(proto)

    proto.init = function () {
      uber.init.apply(this, arguments)
      proto.setDimensions({width: 15, height: 12})
      proto.disableGravity()
      this.wasLaunched = false
    }

    proto.handleInput = function () {
      var state = this.state
      if (keyboard.isTrackedKeyPressed('KEY_LEFT')) {
        state.orientation -= 0.05
      } else if (keyboard.isTrackedKeyPressed('KEY_RIGHT')) {
        state.orientation += 0.05
      }
      if (keyboard.isTrackedKeyPressed('KEY_SPACE') && !this.launchTime) {
        this.launchTime = (new Date()).getTime()
        this.enableGravity()
      }
    }

    proto.calculateForces = function () {
      var state = this.state,
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

    proto.draw = function () {
      var dims = this.dimensions,
          state = this.renderState,
          color = (this.index == 0) ? "red" : "black"
      this.canvas.triangle(state.position[0], state.position[1], dims.width, dims.height, {
        rotate: state.orientation,
        fill: color
      })
    }
  })

  //---

  canvas = Canvas("#wrapper", {
    width: 1000,
    height: 400
  })
  canvasObjects = canvas.buildObjectCollection(CanvasObjectCollection)
  plank = canvasObjects.addObject(Plank, {
    state: {
      position: Vec2((canvas.width / 2) - 100, canvas.height / 2),
      orientation: -(Math.TAU / 8),
    }
  })
  projectile = canvasObjects.addObject(Projectile, {
    state: {
      position: Vec2(50, canvas.height - 50),
      orientation: -(Math.TAU / 8)
    }
  })

  canvas.keyboard.addKeyTracker(keyTracker)
  canvas.addEvents()

  window.canvas = canvas
})()

