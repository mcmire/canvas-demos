
'use strict';

yorp.def('integrator', function (proto) {
  this.advance = function (forces, state, dt) {
    throw new Error("Integrator#advance must be overridden")
  }
})
