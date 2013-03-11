
'use strict';

(function() {
  var Vec2 = yorp.Vec2,
      keyboard = yorp.keyboard,
      Canvas = yorp.Canvas,
      CanvasObject = yorp.CanvasObject,
      CanvasObjectCollection = yorp.CanvasObjectCollection,

      keys, keyTracker,
      Plank, Projectile,
      canvas, canvasObjects, plank, projectile

  // TODO: Shorten this
  keys = ['KEY_LEFT', 'KEY_RIGHT', 'KEY_UP', 'KEY_DOWN', 'KEY_SPACE']
  keyTracker = keyboard.KeyTracker.create($.v.map(keys, function (key) {
    return keyboard.keys[key]
  }))
  keyboard.addKeyTracker(keyTracker)

  Plank = CanvasObject.clone(function (proto) {
    this._setup = function () {
      proto._setup.apply(this, arguments)
      this.setDimensions({
        width: 15,
        height: this.canvas.height - 10
      })
      this.updateState({
        position: Vec2((this.canvas.width / 2) - 100, this.canvas.height / 2),
        orientation: -(yorp.math.TAU / 8),
      })
      this.disableGravity()
    }

    this.draw = function () {
      var state = this.renderState,
          dims = this.dimensions
      this.canvas.rect(state.position[0], state.position[1], dims.width, dims.height, {
        rotate: state.orientation,
        stroke: 'black'
      })
    }
  })

  Projectile = CanvasObject.clone(
    CanvasObject.hasAutonomousUpdates,

    function (proto) {
      this._setup = function () {
        proto._setup.apply(this, arguments)
        this.setDimensions({width: 15, height: 12})
        this.disableGravity()
        this.wasLaunched = false
      }

      this.handleInput = function () {
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

      this.calculateForces = function () {
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
      }

      this.draw = function () {
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

  canvas = Canvas.create("#wrapper", {
    width: 1000,
    height: 400
  })
  canvasObjects = canvas.buildObjectCollection(CanvasObjectCollection)
  plank = canvasObjects.addObject(Plank)
  projectile = canvasObjects.addObject(Projectile, {
    state: {
      position: Vec2(50, canvas.height - 50),
      orientation: -(yorp.math.TAU / 8)
    }
  })
  canvas.addEvents()

  window.canvas = canvas
})()

