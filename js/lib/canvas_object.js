
'use strict';

yorp.def('CanvasObject', yorp.Drawable, function (proto) {
  var Vec2 = yorp.Vec2,
      State = yorp.State

  this.withAutonomousUpdates = function (proto) {
    this.updateProperties = function (gameTime, timeStep) {
      var forces
      proto.updateProperties.call(this)
      forces = this.calculateForces()
      symplecticEulerIntegrator.advance(forces, this.state, timeStep)
      this.fixCollisions()
    }
  }

  this._setup = function(parent, opts) {
    proto._setup.call(this, parent)
    this.dimensions = {width: 0, height: 0}
    this.drawStyle = 'fill'
    this.color = 'black'
    this.state = State.create()
    if (opts) { this.setOptions(opts) }
  }

  this.setOptions = function(opts) {
    this.options = opts
    if (opts.dimensions) { this.setDimensions(opts.dimensions) }
    if (opts.drawStyle) { this.setDrawStyle(opts.drawStyle) }
    if (opts.color) { this.setColor(opts.color) }
    if (opts.state) { this.updateState(opts.state) }
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

  this.updateState = function (props) {
    var pos = this.state.position
    this.state.update(props)
    if (!Vec2.areEqual(pos, this.state.position)) {
      this.afterUpdatingPosition()
    }
  }

  this.enableGravity = function () {
    this.hasGravity = true
  }

  this.disableGravity = function () {
    this.hasGravity = false
  }

  this.update = function (gameTime, timeStep) {
    this.updateProperties(gameTime, timeStep)
  }

  this.handleInput = function () {
    // do nothing by default
  }

  this.calculateForces = function () {
    return {
      force: Vec2(0,0),
      torque: 0
    }
  }

  this.fixCollisions = function () {
    this.canvas.fixPossibleCollision(this)
  }

  this.render = function () {
    this.renderState = this.state
    this.draw()
  }

  this.updateProperties = function (gameTime, timeStep) {
    this.handleInput()
  }

  this.afterUpdatingPosition = function () {
    this.updateBounds()
  }

  this.draw = function () {
    throw "CanvasObject#draw must be overridden"
  }

  this.updateBounds = function () {
    this.bounds = [
      [0, 0],
      [this.dimensions.width, this.dimensions.height]
    ]
  }
})

