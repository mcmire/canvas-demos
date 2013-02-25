
'use strict';

window.symplecticEulerIntegrator = (function () {
  var igr = {},
      periodicLogger = PeriodicLogger()

  $.v.extend(igr, integrator)

  igr.advance = function (forces, state, dt) {
    state.momentum[0] += forces.force[0] * dt
    state.momentum[1] += forces.force[1] * dt
    state.angularMomentum += forces.torque * dt

    state.recalculate()

    state.orientation += state.angularVelocity * dt
    state.position[0] += state.velocity[0] * dt
    state.position[1] += state.velocity[1] * dt
  }

  return igr
})()
