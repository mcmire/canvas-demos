
'use strict';

window.CanvasObject = P(Drawable, function(proto, uber, klass) {
  klass.hasAutonomousUpdates = function (obj) {
    obj.updateProperties = (function (_super) {
      return function (gameTime, timeStep) {
        var forces
        _super.call(this)
        forces = this.calculateForces()
        symplecticEulerIntegrator.advance(forces, this.state, timeStep)
        this.fixCollisions()
      }
    })(obj.updateProperties)
  }

  return {
    init: function(parent, opts) {
      uber.init.call(this, parent)
      this.setOptions(opts)
    },

    setOptions: function(opts) {
      this.options = opts
      this.dimensions = {width: 0, height: 0}
      this.drawStyle = 'fill'
      this.color = 'black'
      this.state = State()
      if (opts.dimensions) { this.setDimensions(opts.dimensions) }
      if (opts.drawStyle) { this.setDrawStyle(opts.drawStyle) }
      if (opts.color) { this.setColor(opts.color) }
      if (opts.state) { this.updateState(opts.state) }
    },

    // these are all separate methods so that we can hook into them if need be

    setDimensions: function (dims) {
      this.dimensions = {
        width: dims.width,
        height: dims.height
      }
    },

    setDrawStyle: function (drawStyle) {
      this.drawStyle = drawStyle
    },

    setColor: function (color) {
      this.color = color
    },

    updateState: function (props) {
      var pos = this.state.position
      this.state.update(props)
      if (!Vec2.areEqual(pos, this.state.position)) {
        this.afterUpdatingPosition()
      }
    },

    enableGravity: function () {
      this.hasGravity = true
    },

    disableGravity: function () {
      this.hasGravity = false
    },

    update: function (gameTime, timeStep) {
      this.updateProperties(gameTime, timeStep)
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

    render: function () {
      this.renderState = this.state
      this.draw()
    },

    updateProperties: function (gameTime, timeStep) {
      this.handleInput()
    },

    afterUpdatingPosition: function () {
      this.updateBounds()
    },

    draw: function () {
      throw "#draw must be implemented in a subclass of CanvasObject"
    },

    updateBounds: function () {
      this.bounds = [
        [0, 0],
        [this.dimensions.width, this.dimensions.height]
      ]
    }
  }
})

