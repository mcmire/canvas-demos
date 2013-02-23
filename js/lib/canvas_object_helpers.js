
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
  return {
    init: function (state) {
      var vectors, scalars

      if (!state) state = {}

      vectors = ['position', 'momentum']
      scalars = ['orientation', 'angularMomentum', 'mass', 'rotationalInertia']

      $.v.each(vectors, function (key) {
        if (!(key in state)) state[key] = Vec2()
      })
      $.v.each(scalars, function (key) {
        if (!(key in state)) state[key] = 0
      })

      this.recalculate()
    },

    recalculate: function () {
      this.velocity = Vec2.ndiv(this.momentum, this.mass)
      this.angularVelocity = this.angularMomentum / this.rotationalInertia
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

