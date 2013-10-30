
'use strict';

(function() {
  var Vec2 = yorp.Vec2,
      keyboard = yorp.keyboard,
      Canvas = yorp.Canvas,
      CanvasObjectCollection = yorp.CanvasObjectCollection,
      Rectangle = yorp.Rectangle,
      Triangle = yorp.Triangle,

      keys, keyTracker,
      Projectile,
      canvas, canvasObjects, plank, projectile

  // TODO: Shorten this
  keys = ['KEY_LEFT', 'KEY_RIGHT', 'KEY_UP', 'KEY_DOWN', 'KEY_SPACE']
  keyTracker = keyboard.KeyTracker.create($.v.map(keys, function (key) {
    return keyboard.keys[key]
  }))
  keyboard.addKeyTracker(keyTracker)

  Projectile = Triangle.clone(
    yorp.withAutonomousUpdates,

    function (proto) {
      this._setup = function () {
        proto._setup.apply(this, arguments)
        this.wasLaunched = false
      }

      this.handleInput = function (timeStep) {
        var state = this.state
        if (keyboard.isTrackedKeyPressed('KEY_LEFT')) {
          state.orientation -= 0.005 * timeStep
        } else if (keyboard.isTrackedKeyPressed('KEY_RIGHT')) {
          state.orientation += 0.005 * timeStep
        }
        if (keyboard.isTrackedKeyPressed('KEY_SPACE') && !this.launchTime) {
          this.launchTime = (new Date()).getTime()
          this.launchTimeElapsed = 0
          this.enableGravity()
        }
      }

      this.calculateForces = function (timeStep) {
        var state = this.state,
            forces = {force: Vec2(0,0), torque: 0}

        if (this.launchTime) {
          this.launchTimeElapsed += timeStep
          if (this.launchTimeElapsed < 300) {
            forces.force = Vec2.fromPolarCoords(0.008, state.orientation)
          }
        }

        if (this.hasGravity) {
          // add gravity
          Vec2.sub(forces.force, Vec2(0, -0.003))
        }
        // apply viscous damper force in the opposite direction
        // (from F = kx - cv)
        Vec2.sub(forces.force, Vec2.nmul(state.velocity, 0.0001))
        //Vec2.floor(forces.force, 0.001)

        return forces
      }
    }
  )

  //---

  canvas = Canvas.create("#wrapper", {
    dimensions: {
      width: 1000,
      height: 400
    },
    ticksPerSecond: 120,
    speedFactor: 0.2
  })
  canvasObjects = canvas.buildObjectCollection(CanvasObjectCollection)
  plank = canvasObjects.addObject(Rectangle, {
    dimensions: {
      width: 15,
      height: (canvas.dimensions.height - 10)
    },
    state: {
      position: Vec2(
        (canvas.dimensions.width / 2) - 100,
        canvas.dimensions.height / 2
      ),
      orientation: -(yorp.math.TAU / 8),
    },
    hasGravity: false
  })
  projectile = canvasObjects.addObject(Projectile, {
    dimensions: {
      width: 15,
      height: 12
    },
    state: {
      position: Vec2(50, canvas.dimensions.height - 50),
      orientation: -(yorp.math.TAU / 8)
    },
    hasGravity: false
  })
  canvas.addEvents()

  window.canvas = canvas
})()

