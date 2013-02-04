
'use strict';

window.CanvasObject = P(Drawable, function(proto, uber) {
  var State, Derivative

  Props = function () {
    return { pos: Vec2(), vel: Vec2(), acc: Vec2() }
  }

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

    stopDrawing: function() {
      this.parent.stopDrawingObject(this)
    },

    resumeDrawing: function () {
      this.parent.resumeDrawingObject(this)
    },

    update: function (t) {
      // Here we are using the Runge-Kutta algorithm in order to accurately
      // calculate the integrals for velocity and position based on acceleration.
      // There is a very very good article about this and why we prefer this
      // method instead of the usual Euler integration here:
      // <http://gafferongames.com/game-physics/integration-basics/>

      // TODO: So if the object collides into the bounding box... how do we fix
      // this?

      var dt, a, b, c, d, deltapos, deltavel

      dt = this.canvas.msPerTick

      a = this._calcRKComponent(t, 0, Props())
      b = this._calcRKComponent(t, dt*0.5, a)
      c = this._calcRKComponent(t, dt*0.5, b)
      d = this._calcRKComponent(t, dt, c)

      // newvel = (a.vel + 2*(b.vel + c.vel) + d.vel) / 6
      // deltapos = newvel * dt
      deltapos = Vec2()
      deltapos[0] = ((a.vel[0] + 2*(b.vel[0] + c.vel[0]) + d.vel[0]) / 6) * dt
      deltapos[1] = ((a.vel[1] + 2*(b.vel[1] + c.vel[1]) + d.vel[1]) / 6) * dt

      // newacc = 1/6 * (a.acc + 2*(b.acc + c.acc) + d.acc)
      // deltavel = newacc * dt
      deltavel = Vec2()
      deltavel[0] = (1/6) * (a.acc[0] + 2*(b.acc[0] + c.acc[0]) + d.acc[0]) * dt
      deltavel[1] = (1/6) * (a.acc[1] + 2*(b.acc[1] + c.acc[1]) + d.acc[1]) * dt

      Vec2.add(this.pos, deltapos)
      Vec2.add(this.vel, deltavel)
    },

    render: function() {
      this.clear()
      // do more here in a subclass
    },

    calcAcc: function (newstate, t) {
      return Vec2(0,0)
    },

    clear: function () {
      this.ctx.clearRect(
        this.pos[0]-(this.width/2),
        this.pos[1]-(this.height/2),
        this.width,
        this.height
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

    _calcRKComponent: function (t, dt, d) {
      var state, d2

      // First, advance the current position and velocity using Euler
      // integration
      state = Props()
      state.pos[0] = this.pos[0] + d.vel[0] * dt
      state.pos[1] = this.pos[1] + d.vel[1] * dt
      state.vel[0] = this.vel[0] + d.acc[0] * dt
      state.vel[1] = this.vel[1] + d.acc[1] * dt

      // Then, recalculate acceleration using the newly calculated velocity
      d2 = Props()
      d2.vel = state.vel
      // Q: So if we are re-calculating acceleration... what if we want to set
      // acceleration based on input?
      d2.acc = this.calcAcc(state, t + dt)
      return d2
    },
  }
})

