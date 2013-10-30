
'use strict';

yorp.def('rkIntegrator', function (proto) {
  this.rkStep = function (state, dt, derivative) {
    var sPosition, sMomentum, sOrientation, sAngularMomentum, newState,
        values, newDerivative

    if (derivative) {
      sPosition = Vec2(
        state.position[0] + derivative.velocity[0] * dt,
        state.position[1] + derivative.velocity[1] * dt
      )
      sMomentum = Vec2(
        state.momentum[0] + derivative.force[0] * dt,
        state.momentum[1] + derivative.force[1] * dt
      )
      sOrientation = Vec2(
        state.orientation[0] + derivative.angularVelocity[0] * dt,
        state.orientation[1] + derivative.angularVelocity[1] * dt
      )
      sAngularMomentum = Vec2(
        state.angularMomentum[0] + derivative.torque[0] * dt,
        state.angularMomentum[1] + derivative.torque[1] * dt
      )
      // TODO: set rotational inertia depending on object
      newState = State.create({
        position: sPosition,
        momentum: sMomentum,
        orientation: sOrientation,
        angularMomentum: sAngularMomentum
      })
      newState.recalculate()
    } else {
      newState = state
    }

    values = obj.calculateForces(newState)

    newDerivative = Derivative.create({
      velocity: newState.velocity,
      angularVelocity: newState.angularVelocity,
      force: values.force,
      torque: values.torque
    })

    return newDerivative
  }
})

