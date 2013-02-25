
'use strict';

// Variables/equations:
//
//   mass = m
//   position = x (vector)
//   velocity = v = dx/dt (vector)
//   acceleration = a = dv/dt (vector)
//   momentum = p = m * v (vector)
//   force = dp/dt = m * a (vector)
//
//   moment of inertia = I
//   orientation = o (scalar)
//   angular velocity = w = do/dt (scalar)
//   angular acceleration = A = dw/dt (scalar)
//   angular momentum = L = rperp . p = I * w (scalar)
//   torque = t = dL/dt = I * A (scalar)
//
// The strategy here is to integrate force to get momentum, then calculate
// velocity by dividing by mass, then integrate velocity to get position.
//
// There's a similar process for angular motion: integrate torque to get angular
// momentum, then calculate angular velocity by dividing angular momentum by
// moment of inertia, then integrate angular velocity to get orientation.

window.State = P(function () {
  var VECTORS = ['position', 'momentum'],
      SCALARS = ['forceAmount', 'velocity', 'orientation', 'angularMomentum', 'torque', 'mass', 'rotationalInertia'],
      PROPERTIES = VECTORS.concat(SCALARS)

  return {
    init: function (state) {
      var _this = this

      if (!state) state = {}

      $.v.each(VECTORS, function (key) {
        _this[key] = (key in state) ? state[key] : Vec2()
      })
      $.v.each(SCALARS, function (key) {
        _this[key] = (key in state)
          ? state[key]
          : (key === 'mass' || key === 'rotationalInertia') ? 1 : 0
      })

      this.recalculate()
    },

    recalculate: function () {
      this.velocity = Vec2.ndiv(this.momentum, this.mass)
      this.angularVelocity = this.angularMomentum / this.rotationalInertia
    },

    clone: function () {
      var _this = this,
          state = new State()
      $.v.each(PROPERTIES, function (key) {
        state[key] = _this[key]
      })
      return state
    }
  }
})

window.Derivative = P(function () {
  return {
    init: function (state) {
      var vectors, scalars

      if (!state) state = {}

      vectors = ['velocity', 'force']
      scalars = ['angularVelocity', 'torque']

      $.v.each(vectors, function (key) {
        if (!(key in state)) state[key] = Vec2()
      })
      $.v.each(scalars, function (key) {
        if (!(key in state)) state[key] = 0
      })
    }
  }
})

