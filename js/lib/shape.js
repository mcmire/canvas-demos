
'use strict'

var Shape = P(Drawable, function(proto, uber) {
  return {
    init: function(parent, opts) {
      uber.init.call(this, parent)
      this.setOptions(opts)
    },

    setOptions: function(options) {
      this.options = options
      this.pos = options.pos
      if (!this.pos) this.pos = this.defaultPosition()
      this.vel = options.vel
      if (!this.vel) this.vel = this.defaultVelocity()
      this.acc = options.acc
      if (!this.acc) this.acc = this.defaultAcceleration()
      this.color = options.color
      if (!this.color) this.color = this.defaultColor()
    },

    redraw: function() {
      this.setAcc()
      this.setVel()
      this.setPos()
      this.drawShape()
    },

    setAcc: function() {
      throw new Error("You need to implement Shape#setAcc")
    },

    setVel: function() {
      Vec2.add(this.vel, this.acc)
    },

    setPos: function() {
      Vec2.add(this.pos, this.vel)
    },

    drawShape: function() {
      throw new Error("You need to implement Shape#drawShape")
    },

    defaultPosition: function() {
      return this.canvas.randomPos(this.width(), this.height())
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

    width: function() {
      throw new Error("You need to implement Shape#width")
    },

    height: function() {
      throw new Error("You need to implement Shape#height")
    }
  }
})

