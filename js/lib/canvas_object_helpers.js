
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
//   angular momentum = L = r x p = r_perp . p = I * w (scalar)
//   torque = t = dL/dt = I * A (scalar)
//
// The strategy here is to integrate force to get momentum, then calculate
// velocity by dividing by mass, then integrate velocity to get position.
//
// There's a similar process for angular motion: integrate torque to get angular
// momentum, then calculate angular velocity by dividing angular momentum by
// moment of inertia, then integrate angular velocity to get orientation.

yorp.def('State', function (proto) {
  var Vec2 = yorp.Vec2,
      VECTORS = ['position', 'momentum'],
      SCALARS = ['forceAmount', 'velocity', 'orientation', 'angularMomentum', 'torque', 'mass', 'rotationalInertia'],
      PROPERTIES = VECTORS.concat(SCALARS)

  this._setup = function (props) {
    if (!props) props = {}
    this.update(props)
  }

  this.update = function (props) {
    var _this = this
    $.v.each(VECTORS, function (prop) {
      _this[prop] = (prop in props) ? props[prop] : Vec2()
    })
    $.v.each(SCALARS, function (prop) {
      _this[prop] = (prop in props)
        ? props[prop]
        : (prop === 'mass' || prop === 'rotationalInertia') ? 1 : 0
    })
    this.recalculate()
  }

  this.recalculate = function () {
    this.velocity = Vec2.ndiv(this.momentum, this.mass)
    this.angularVelocity = this.angularMomentum / this.rotationalInertia
  }

  this.clone = function () {
    var _this = this,
        state = proto.clone.call(this),
        v
    $.v.each(PROPERTIES, function (key) {
      v = _this[key]
      state[key] = Vec2.isa(v) ? Vec2.clone(v) : v
    })
    return state
  }
})

// FIXME This is not used atm
yorp.def('Derivative', function (proto) {
  this._setup = function (state) {
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
})

