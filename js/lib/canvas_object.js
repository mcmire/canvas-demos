
'use strict';

yorp.def('CanvasObject', yorp.Drawable, function (proto) {
  function calculateBounds(dims) {
    var hw = this.dimensions.width / 2,
        hh = this.dimensions.height / 2
    return [
      Vec2(pos - hw, pos - hh),
      Vec2(pos + hw, pos + hh)
    ]
  }

  var Vec2 = yorp.Vec2,
      State = yorp.State

  this._setup = function(parent, opts) {
    proto._setup.call(this, parent)
    this.dimensions = {width: 0, height: 0}
    this.drawStyle = 'fill'
    this.color = 'black'
    this.state = State.create()
    if (opts) { this.setOptions(opts) }
  }

  this.setOptions = function (opts) {
    this.options = opts
    if (opts.dimensions) { this.setDimensions(opts.dimensions) }
    if (opts.drawStyle) { this.setDrawStyle(opts.drawStyle) }
    if (opts.color) { this.setColor(opts.color) }
    if (opts.state) {
      this.state.update(opts.state)
      this.onUpdateState()
    }
  }

  // these are all separate methods so that we can hook into them if need be

  this.setDimensions = function (dims) {
    this.dimensions = {
      width: dims.width,
      height: dims.height
    }
  }

  this.setDrawStyle = function (drawStyle) {
    this.drawStyle = drawStyle
  }

  this.setColor = function (color) {
    this.color = color
  }

  this.enableGravity = function () {
    this.hasGravity = true
  }

  this.disableGravity = function () {
    this.hasGravity = false
  }

  this.update = function (timeStep) {
    var pos = Vec2.clone(this.state.position),
        ori = this.state.orientation
    this.advanceState(timeStep)
    if (!Vec2.areEqual(this.state.position, pos) || this.state.orientation !== ori) {
      this.onUpdateState()
    }
  }

  this.handleInput = function (timeStep, speedFactor) {
    // do nothing by default
  }

  this.render = function () {
    this.renderState = this.state
    this.draw()
  }

  this.advanceState = function (timeStep) {
    this.handleInput(timeStep)
  }

  this.onUpdateState = function () {
    this.updateBounds()
  }

  this.draw = function () {
    throw "CanvasObject#draw must be overridden"
  }

  this.updateBounds = function () {
    this.bounds = calculateBounds(this.dimensions)
  }
})

yorp.withAutonomousUpdates = function (proto) {
  this.advanceState = function (timeStep) {
    var forces
    proto.advanceState.apply(this, arguments)
    forces = this.calculateForces(timeStep)
    yorp.symplecticEulerIntegrator.advance(forces, this.state, timeStep)
    this.fixCollisions()
  }

  this.calculateForces = function (timeStep) {
    return {
      force: Vec2(0,0),
      torque: 0
    }
  }

  this.fixCollisions = function () {
    this.canvas.fixPossibleCollision(this)
  }
}

