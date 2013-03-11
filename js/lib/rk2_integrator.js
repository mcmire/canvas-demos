
'use strict'

// See comments in rk4_integrator.js for more on how this works.
//
window.def('RK2Integrator', yorp.RKIntegrator, function (proto) {
  this.advance = function (state, dt) {
    var k1, k2

    k1 = this.rkStep(state, 0)
    k2 = this.rkStep(state, dt, k1)

    // We are just rearranging the terms here to make the code prettier,
    // but the general format is this:
    //
    //   state.x += (k1.dx + k2.dx) / 2 * dt
    //
    // or, simplified:
    //
    //   state.x += dx * dt

    state.position[0] += 1/2 * dt * (k1.velocity[0] + k2.velocity[0])
    state.position[1] += 1/2 * dt * (k1.velocity[1] + k2.velocity[1])

    state.momentum[0] += 1/2 * dt * (k1.force[0] + k2.force[0])
    state.momentum[1] += 1/2 * dt * (k1.force[1] + k2.force[1])

    state.orientation += 1/2 * dt * (k1.angularVelocity + k2.angularVelocity)
    state.angularMomentum += 1/2 * dt * (k1.torque + k2.torque)

    state.recalculate()
  }
})

