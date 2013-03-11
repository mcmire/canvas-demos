
'use strict';

yorp.def('CanvasObjectCollection', yorp.Drawable, function (proto) {
  var CanvasObject = yorp.CanvasObject

  this._setup = function (parent) {
    proto._setup.call(this, parent)
    this.objects = []
  }

  this.addObject = function(proto/*, rest... */) {
    var rest, args, object
    rest = Array.prototype.slice.call(arguments, 1)
    if (!CanvasObject.isPrototypeOf(proto)) {
      throw "The given prototype must be a child of CanvasObject"
    }
    // This assumes that the proto's constructor accepts a 'parent' argument
    args = rest ? [this].concat(rest) : [this]
    object = proto.create.apply(proto, args)
    this.objects.push(object)
    return object
  }

  this.clear = function() {
    var i, len
    for (i = 0, len = this.objects.length; i < len; i++) {
      this.objects[i].clear()
    }
  }

  this.update = function (gameTime, timeStep) {
    var i, len
    for (i = 0, len = this.objects.length; i < len; i++) {
      this.objects[i].update(gameTime, timeStep)
    }
  }

  this.render = function (interpFactor) {
    var i, len
    for (i = 0, len = this.objects.length; i < len; i++) {
      this.objects[i].render(interpFactor)
    }
  }
})

