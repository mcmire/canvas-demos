
'use strict';

window.CanvasObjectCollection = P(Drawable, function (proto, uber) {
  return {
    init: function (parent) {
      uber.init.call(this, parent)
      this.objects = []
    },

    addObject: function(klass/*, rest... */) {
      var rest, args, object
      rest = Array.prototype.slice.call(arguments, 1)
      // XXX: Does this work??
      if (!(klass.prototype instanceof CanvasObject)) {
        throw "klass must be a subclass of CanvasObject"
      }
      // This assumes that the klass's first argument is a 'parent' value
      // and that `klass` is a P constructor
      args = rest ? [this].concat(rest) : [this]
      object = klass.apply(null, args)
      this.objects.push(object)
      return object
    },

    clear: function() {
      var i, len
      for (i = 0, len = this.objects.length; i < len; i++) {
        this.objects[i].clear()
      }
    },

    update: function (gameTime, timeStep) {
      var i, len
      for (i = 0, len = this.objects.length; i < len; i++) {
        this.objects[i].update(gameTime, timeStep)
      }
    },

    render: function (interpFactor) {
      var i, len
      for (i = 0, len = this.objects.length; i < len; i++) {
        this.objects[i].render(interpFactor)
      }
    }
  }
})

