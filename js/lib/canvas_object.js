
'use strict';

window.CanvasObject = P(Drawable, function(proto, uber) {
  return {
    init: function(parent, opts) {
      uber.init.call(this, parent)
      this.setOptions(opts)
      if (!this.color) { this.color = 'black' }
      this.resetCounters()
    },

    resetCounters: function () {
      this.timeSinceLastUpdate = 0
      this.forceUpdate = false
    },

    setOptions: function(opts) {
      this.options = opts

      this.width = opts.width
      this.height = opts.height
      this.color = opts.color

      this.prevState = null
      this.currState = State(opts)
    },

    stopDrawing: function() {
      this.parent.stopDrawingObject(this)
    },

    resumeDrawing: function () {
      this.parent.resumeDrawingObject(this)
    },

    clear: function () {
      var pos
      if (!this.prevState) { return }
      pos = Vec2.rotate(this.prevState.position, this.prevState.orientation)
      this.ctx.clearRect(
        Math.ceil(pos[0] - (this.width / 2)) - 1,
        Math.ceil(pos[1] - (this.height / 2)) - 1,
        this.width + 1,
        this.height + 1
      )
    },

    update: function (tickElapsedTime, timeStep) {
      this.timeSinceLastUpdate += tickElapsedTime
      //while (this.forceUpdate || this.timeSinceLastUpdate >= timeStep) {
      if (this.timeSinceLastUpdate >= timeStep) {
        // Catch the simulation up for as many timesteps as we are behind
        // (hopefully only 1).
        // Keep in mind the state calculated here for each object will not be
        // fully rendered until the next update arrives and it's time to
        // calculate another step.
        this.handleInput()
        var forces = this.calculateForces()
        symplecticEulerIntegrator.advance(forces, this.currState, timeStep)
        this.fixCollisions()
        //this.timeSinceLastUpdate -= timeStep
        //this.forceUpdate = false
        //this.prevState = this.currState.clone()
      }
    },

    handleInput: function () {
      // do nothing by default
    },

    calculateForces: function () {
      return {
        force: Vec2(0,0),
        torque: 0
      }
    },

    fixCollisions: function () {
      this.canvas.fixPossibleCollision(this)
    },

    render: function(timeStep) {
      ///var alpha = this.timeSinceLastUpdate / timeStep
      ///this.interpState = this._getInterpolatedState(alpha)
      ///// TODO........
      ///if (this.canvas.didFixPossibleCollision(this.interpState)) {
      ///  // force update
      ///  this.currState = this.interpState
      ///  this.forceUpdate = true
      ///}
      this.interpState = this.currState
      this.draw()
    },

    draw: function () {
      throw "Must be implemented in a subclass"
    },

    //---

    getBounds: function (pos) {
      this.getBoundsAt(this.pos)
    },

    getBoundsAt: function (pos) {
      return [
        // x1 .. x2
        [pos[0] - this.width/2, pos[0] + this.width/2],
        // y1 .. y2
        [pos[1] - this.height/2, pos[1] + this.height/2]
      ]
    },

    randomVector: function(def) {
      return Vec2(
        util.rand.int(def, def),
        util.rand.int(def, def)
      )
    },

    _getInterpolatedState: function (alpha) {
      var a = this.prevState,
          b = this.currState,
          i = State()

      i.position = Vec2.lerp(a.position, b.position, alpha)
      i.momentum = Vec2.lerp(a.momentum, b.momentum, alpha)
      i.orientation = util.math.lerp(a.orientation, b.orientation, alpha)
      i.angularMomentum = util.math.lerp(a.angularMomentum, b.angularMomentum, alpha)
      i.recalculate()

      return i
    }
  }
})

