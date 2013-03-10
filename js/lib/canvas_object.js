
'use strict';

window.CanvasObject = P(Drawable, function(proto, uber, klass) {
  klass.hasAutonomousUpdates = function (subclass) {
    subclass.mixin(function (proto, uber) {
      proto.updateProperties = function () {
        uber.updateProperties.call(this)
        var forces = this.calculateForces()
        symplecticEulerIntegrator.advance(forces, this.state, timeStep)
        this.fixCollisions()
      }
    })
  }

  return {
    init: function(parent, opts) {
      uber.init.call(this, parent)
      this.setOptions(opts)
      if (!this.color) { this.color = 'black' }
      this.resetCounters()
      this.setBounds()
    },

    resetCounters: function () {
      this.timeSinceLastUpdate = 0
      this.forceUpdate = false
    },

    setOptions: function(opts) {
      this.options = opts
      this.setDimensions(opts.width, opts.height)
      this.setDrawStyle(opts.drawStyle)
      this.setColor(opts.color)
      this.setState(opts)
    },

    setDimensions: function (width, height) {
      this.width = width
      this.height = height
    },

    setDrawStyle: function (drawStyle) {
      this.drawStyle = drawStyle
    },

    setColor: function (color) {
      this.color = color
    },

    setState: function (opts) {
      this.state = State(opts)
    },

    tick: function () {
      this.update()
      this.render()
    },

    update: function () {
      this.updateProperties()
      this.setBounds()
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

    updateProperties: function () {
      this.handleInput()
    },

    draw: function () {
      throw "Must be implemented in a subclass"
    },

    setBounds: function () {
      throw "Must be implemented in a subclass"
    }
  }
})

