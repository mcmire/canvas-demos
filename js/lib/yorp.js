
'use strict';

window.yorp = {
  def: function (/* name[, superclass], mixins... */) {
    var args = Array.prototype.slice.call(arguments),
        name = args.shift(),
    // If we can, use the first object as the object to clone instead of cloning
    // from yorp.Proto. For instance, if we have something like
    // yorp.def('Triangle', yorp.Polygon, fn), then this would be equivalent to
    // yorp.Polygon.clone(fn) and not yorp.Proto(yorp.Polygon, fn). In the
    // latter case, Polygon is treated as a mixin and not as a 'superclass'.
    // This is a problem as Polygon is itself descended from CanvasObject (which
    // is descended from Drawable); hence, it has a lot of properties inherited
    // from other objects via the prototype chain. These properties will not get
    // carried over if Polygon is treated as a mixin because we do not make a
    // deep copy when working with mixins.
      proto = (yorp.Proto.isPrototypeOf(args[0])) ? args.shift() : yorp.Proto,
      args = [name].concat(args)
    yorp[name] = proto.cloneAs.apply(proto, args)
  }
}
