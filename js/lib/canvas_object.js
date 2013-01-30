
'use strict'

var CanvasObject = P(Drawable, function(proto, uber) {
  return {
    init: function(parent, width, height, opts) {
      uber.init.call(this, parent)
      this.width = width
      this.height = height
      this.setOptions(opts)
      if (!this.pos) this.pos = this.defaultPosition()
      if (!this.vel) this.vel = this.defaultVelocity()
      if (!this.acc) this.acc = this.defaultAcceleration()
      if (!this.color) this.color = this.defaultColor()
    },

    setOptions: function(opts) {
      this.options = opts
      this.pos = opts.pos
      this.vel = opts.vel
      this.acc = opts.acc
      this.color = opts.color
    },

    redraw: function() {
      this.setAcc()
      this.setVel()
      this.setPos()
      this.render()
    },

    setPos: function() {
      Vec2.add(this.pos, this.vel)
    },

    setVel: function() {
      Vec2.add(this.vel, this.acc)
    },

    setAcc: function() {
      // nothing happens by default
    },

    drawCanvasObject: function() {
      throw new Error("You need to implement CanvasObject#drawCanvasObject")
    },

    defaultPosition: function() {
      return this.canvas.randomPos(this.width, this.height)
    },

    defaultVelocity: function() {
      //return this.randomVector(10)
      return Vec2(2,2)
    },

    defaultAcceleration: function() {
      return Vec2(0,0)
    },

    defaultColor: function() {
      return "black"
    },

    randomVector: function(def) {
      return Vec2(
        util.rand.int(def, def),
        util.rand.int(def, def)
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
    }
  }
})

