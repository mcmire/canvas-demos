
'use strict';

var CanvasObject = P(Drawable, function(proto, uber) {
  return {
    init: function(parent, opts) {
      uber.init.call(this, parent)
      this.setOptions(opts)
      if (!this.pos) this.pos = this.defaultPosition()
      if (!this.vel) this.vel = this.defaultVelocity()
      if (!this.acc) this.acc = this.defaultAcceleration()
      if (!this.color) this.color = this.defaultColor()
    },

    setOptions: function(opts) {
      this.options = opts
      this.width = opts.width
      this.height = opts.height
      this.pos = opts.pos
      this.vel = opts.vel
      this.acc = opts.acc
      this.color = opts.color
    },

    update: function () {
      this.setAcc()
      this.setVel()
    },

    render: function(interpFactor) {
      this.clear()
      this.setPos(interpFactor)
    },

    setPos: function(interpFactor) {
      // this.pos + this.vel represents the target position
      // however, we have to take the interpolation factor into play
      // on every update, this.pos 
      this.pos[0] += this.vel[0] * interpFactor
      this.pos[1] += this.vel[1] * interpFactor
    },

    setVel: function() {
      Vec2.add(this.vel, this.acc)
    },

    setAcc: function() {
      // nothing happens by default
    },

    clear: function () {
      this.ctx.clearRect(
        this.pos[0]-(this.width/2),
        this.pos[1]-(this.height/2),
        this.width,
        this.height
      )
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

