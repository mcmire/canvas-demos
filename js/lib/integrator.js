
'use strict';

yorp.def('Integrator', function (proto) {
  this.advance = function (state, dt) {
    throw new Error("Integrator#advance must be overridden")
  }
})
