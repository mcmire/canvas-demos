
'use strict';

window.yorp = {
  def: function (/* name, protos... */) {
    var args = Array.prototype.slice.call(arguments),
        name = args[0]
    yorp[name] = yorp.Proto.cloneAs.apply(yorp.Proto, args)
  }
}
