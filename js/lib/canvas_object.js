
'use strict';

window.CanvasObject = P(Drawable, function(proto, uber) {
  return {
    init: function(parent, opts) {
      uber.init.call(this, parent)
      this.setOptions(opts)
      if (this.mass == null) this.mass = this.defaultMass()
      if (this.pos == null) this.pos = this.defaultPosition()
      if (this.vel == null) this.vel = this.defaultVelocity()
      if (this.color == null) this.color = this.defaultColor()
    },

    setOptions: function(opts) {
      this.options = opts
      this.mass = opts.mass
      this.width = opts.width
      this.height = opts.height
      this.pos = opts.pos
      this.vel = opts.vel
      this.color = opts.color
    },

    stopDrawing: function() {
      this.parent.stopDrawingObject(this)
    },

    resumeDrawing: function () {
      this.parent.resumeDrawingObject(this)
    },

    update: function (t, dt) {
      integrator.advance(this, t, dt)
      // TODO: check for collisions
    },

    render: function() {
      //this.clear()
      // do more here in a subclass
    },

    // This is called by the integrator
    accelerationAt: function (state, t) {
      return Vec2(0,0)
    },

    clear: function () {
      this.ctx.clearRect(
        Math.ceil(this.pos[0]-(this.width/2))-1,
        Math.ceil(this.pos[1]-(this.height/2))-1,
        this.width+1,
        this.height+1
      )
    },

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

    defaultPosition: function() {
      return Vec2(0,0)
    },

    defaultVelocity: function() {
      return Vec2(0,0)
    },

    defaultMass: function () {
      return 1
    },

    defaultColor: function() {
      return "black"
    },

    randomVector: function(def) {
      return Vec2(
        util.rand.int(def, def),
        util.rand.int(def, def)
      )
    }
  }
})

