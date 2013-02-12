
'use strict'

// The goal here is to figure out the next values of velocity and position using
// the current acceleration. We would also like to make acceleration a function
// of both velocity and position (this is useful when working with
// springs/dampers).
//
// How do we do this? Well, acceleration, velocity and position are all
// functions. At time 0, they are at a certain value; at time 1 they are at a
// different value. Acceleration is the derivative of velocity (or the
// continuous slope of the curve of the velocity function). So in order to
// calculate v(t+dt), we need at least two things: the slope of v(t), or a(t),
// and the slope of v(t+dt), or a(t+dt).
//
// Since we can know a(t+dt), it follows that we should be able to figure out
// v(t+dt). How do we do this? Well, since the acceleration function describes
// the slope at each corresponding point on the velocity function, we should be
// able to use the slope to extrapolate the next point in velocity. That is:
//
//   v(t+dt) = v(t) + dv/dt(t) * dt
//           = v(t) + a(t)
//
//  This is called Euler integration. This assumes that the slope at t+dt [i.e.
//  a(t+dt)] is the same as at t. But this only works if a is a constant
//  function; if it changes such that a(t+dt) is different then Euler
//  integration does not provide an accurate result, overestimating the true
//  result.
//
// There are other, more accurate integration methods we can use, though. Most
// of them -- Euler included -- fall into the Runge-Kutta family of algorithms.
// The most popular is the fourth-order formula, usually abbreviated as RK4.
//
// Let's review. We know that we have two functions, and one is the derivative
// of the other (y and y', here represented by f(t)). We also know that we are
// at a certain time in our game loop, and this is represented by t. Finally, we
// have perfect knowledge of every point on y' as we can calculate it. What we
// need to find is the point on y at the next timestep, that is, t + dt.
//
// With that in mind, here's the formula (gleaned from Wikipedia[1]):
//
//   y(t+dt) = y(t) + (k1 + 2*k2 + 2*k3 + k4) / 6
//   t = t + dt
//   where:
//     k1 = f(t, y(t)) * dt
//     k2 = f(t + 0.5*dt, y(t) + 0.5*k1) * dt
//     k3 = f(t + 0.5*dt, y(t) + 0.5*k2) * dt
//     k4 = f(t + dt, y(t) + k3) * dt
//
// If we say that y is velocity and f(t) is acceleration, then in plain English
// we can interpret the above like this:
//
// * The goal is to produce a velocity offset (a vector) we can apply to the
//   current velocity (a vector) to get a new velocity (also a vector). There
//   are four scenarios:
// * First: Calculate an acceleration based on the current time and velocity,
//   and then derive a new velocity offset from this acceleration.
// * Second: Bump the current time by a half-timestep and the current velocity
//   by half of the velocity offset calculated in the previous step, calculate
//   the acceleration using these values, and then derive a new velocity offset
//   from this acceleration.
// * Third: Bump the current time by a half-timestep and the current velocity by
//   half of the velocity offset calculated in the previous step, calculate the
//   acceleration using these values, and then derive a new velocity offset from
//   this acceleration.
// * Fourth: Bump the current time by a full timestep and the current velocity
//   by the full velocity offset calculated in the previous step, calculate the
//   acceleration using these values, and then derive a new velocity offset from
//   this acceleration.
// * Finally, take all of the velocity offsets that we've calculated and average
//   them together, giving the most weight to the second and third instances.
//
// Now, this is just velocity. Keep in mind that we also need to calculate
// position as well -- but we can do this at the same time. Let's rephrase the
// formula above for velocity to see how:
//
//   vk1 = a(t, v) * dt
//   vk2 = a(t + 0.5*dt, v + 0.5*vk1) * dt
//   vk3 = a(t + 0.5*dt, v + 0.5*vk2) * dt
//   vk4 = a(t + dt, v + vk3) * dt
//   v_next = v + (vk1 + 2*vk2 + 2*vk3 + vk4) / 6
//
// The formulas for position look virtually identical:
//
//   xk1 = v(t, x) * dt
//   xk2 = v(t + 0.5*dt, x + 0.5*xk1) * dt
//   xk3 = v(t + 0.5*dt, x + 0.5*xk2) * dt
//   xk4 = v(t + dt, x + xk3) * dt
//   x_next = x + (xk1 + 2*xk2 + 2*xk3 + xk4) / 6
//
// To put them together, we realize that velocity is no longer a function with
// an unknown value, but acknowledge instead that acceleration is a function of
// both position and velocity, and velocity is the simple integral of
// acceleration. Our acceleration function, then, accepts and returns both
// velocity and position (note: this is pseudocode):
//
//   a = (t, v, x) {
//     rv = {}
//     rv.v = ...
//     rv.x = ...
//     return rv
//   }
//   k1 = a(t, v, x) * dt
//   k2 = a(t + 0.5*dt, v + 0.5*k1.v, x + 0.5*k1.x) * dt
//   k3 = a(t + 0.5*dt, v + 0.5*k2.v, x + 0.5*k2.x) * dt
//   k4 = a(t + dt, v + k3.v, x + k3.x) * dt
//   v_next = v + (k1.v + 2*k2.v + 2*k3.v + k4.v) / 6
//   x_next = x + (k1.x + 2*k2.x + 2*k3.x + k4.x) / 6
//
// Secondly let's make our acceleration function return slopes, i.e.,
// derivatives, instead of values. This means the "* dt* at the end goes away
// and instead goes inside the function call. We also need to remember to bring
// "dt" back at the very end:
//
//   a = (t, v, x) {
//     rv = {}
//     rv.dv = ...
//     rv.dx = ...
//     return rv
//   }
//   k1 = a(t, v, x)
//   k2 = a(t + 0.5*dt, v + 0.5*k1.dv * dt, x + 0.5*k1.dx * dt)
//   k3 = a(t + 0.5*dt, v + 0.5*k2.dv * dt, x + 0.5*k2.dx * dt)
//   k4 = a(t + dt, v + k3.dv * dt, x + k3.dx * dt)
//   v_next = v + ((k1.dv + 2*k2.dv + 2*k3.dv + k4.dv) / 6) * dt
//   x_next = x + ((k1.dx + 2*k2.dx + 2*k3.dx + k4.dx) / 6) * dt
//
// Now we can take "0.5*k1.dv * dt" and move the "0.5" in front of the "dt" to
// mirror "t + 0.5*dt":
//
//   a = (t, v, x) {
//     rv = {}
//     rv.dv = ...
//     rv.dx = ...
//     return rv
//   }
//   k1 = a(t, v, x)
//   k2 = a(t + 0.5*dt, v + k1.dv * 0.5*dt, x + k1.dx * 0.5*dt)
//   k3 = a(t + 0.5*dt, v + k2.dv * 0.5*dt, x + k2.dx * 0.5*dt)
//   k4 = a(t + dt, v + k3.dv * dt, x + k3.dx * dt)
//   v_next = v + ((k1.dv + 2*k2.dv + 2*k3.dv + k4.dv) / 6) * dt
//   x_next = x + ((k1.dx + 2*k2.dx + 2*k3.dx + k4.dx) / 6) * dt
//
// To make things a little cleaner, we can move the "0.5*dt" inside the function
// call. In fact, we can move both the second and third arguments inside the
// function call, too:
//
//   calculateAcceleration = (t, v, x) {
//     dv = ...
//     return dv
//   }
//   a = (t, dt=0, v, x, k={dv:0,dx:0}) {
//     v = v + k.dv * dt
//     x = x + k.dx * dt
//     deriv = {}
//     deriv.dx = v
//     deriv.dv = calculateAcceleration(t + dt, v, x)
//     return deriv
//   }
//   k1 = a(t, v, x)
//   k2 = a(t, 0.5*dt, v, x, k2)
//   k3 = a(t, 0.5*dt, v, x, k3)
//   k4 = a(t, dt, v, x, k4)
//   v_next = v + ((k1.dv + 2*k2.dv + 2*k3.dv + k4.dv) / 6) * dt
//   x_next = x + ((k1.dx + 2*k2.dx + 2*k3.dx + k4.dx) / 6) * dt
//
// We can then group together "v" and "x" in the same way that the "k*"
// variables group things together:
//
//   calculateAcceleration = (t, v, x) {
//     dv = ...
//     return dv
//   }
//   initial = {v, x}
//   k1 = a(t, initial)
//   k2 = a(t, 0.5*dt, initial, k2)
//   k3 = a(t, 0.5*dt, initial, k3)
//   k4 = a(t, dt, initial, k4)
//   a = (t, dt=0, initial, k={dv:0,dx:0}) {
//     state = {}
//     state.v = initial.v + k.dv * dt
//     state.x = initial.x + k.dx * dt
//     deriv = {}
//     deriv.dx = v
//     deriv.dv = calculateAcceleration(t + dt, state)
//     return deriv
//   }
//
// And there we have it, an RK4 integrator. This is lifted almost exactly
// from Glenn Fiedler's guide on basic integration techniques [2].
//
// [1]: http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
// [2]: http://gafferongames.com/game-physics/integration-basics
//
window.integrator = {
  advance: function (obj, t, dt) {
    var k1, k2, k3, k4, dPos, dVel

    k1 = this.rkStep(obj, t, 0, {dPos: Vec2(0,0), dVel: Vec2(0,0)})
    k2 = this.rkStep(obj, t, 0.5*dt, k1)
    k3 = this.rkStep(obj, t, 0.5*dt, k2)
    k4 = this.rkStep(obj, t, dt, k3)

    dPos = Vec2(0,0)
    dPos[0] = (k1.dPos[0] + 2 * k2.dPos[0] + 2 * k3.dPos[0] + k4.dPos[0]) / 6
    dPos[1] = (k1.dPos[1] + 2 * k2.dPos[1] + 2 * k3.dPos[1] + k4.dPos[1]) / 6
    dVel = Vec2(0,0)
    dVel[0] = (k1.dVel[0] + 2 * k2.dVel[0] + 2 * k3.dVel[0] + k4.dVel[0]) / 6
    dVel[1] = (k1.dVel[1] + 2 * k2.dVel[1] + 2 * k3.dVel[1] + k4.dVel[1]) / 6

    obj.pos[0] += dPos[0] * dt
    obj.pos[1] += dPos[1] * dt
    obj.vel[0] += dVel[0] * dt
    obj.vel[1] += dVel[1] * dt
  },

  rkStep: function (obj, t, dt, d) {
    var state, deriv

    state = {pos: Vec2(0,0), vel: Vec2(0,0)}
    state.pos[0] = obj.pos[0] + d.dPos[0] * dt
    state.pos[1] = obj.pos[1] + d.dPos[1] * dt
    state.vel[0] = obj.vel[0] + d.dVel[0] * dt
    state.vel[1] = obj.vel[1] + d.dVel[1] * dt

    deriv = {}
    deriv.dPos = state.vel
    deriv.dVel = obj.accelerationAt(state, t + dt)

    return deriv
  }
}

