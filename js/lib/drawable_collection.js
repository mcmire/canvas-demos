
'use strict';

window.DrawableCollection = P(Drawable, function (proto, uber) {
  return {
    init: function (parent) {
      uber.init.call(this, parent)
      this.objects = []
      this.hiddenObjects = []
    },

    update: function () {
      var i, len
      for (i = 0, len = this.objects.length; i < len; i++) {
        this.objects[i].update()
      }
    },

    render: function(interpFactor) {
      var i, len
      for (i = 0, len = this.objects.length; i < len; i++) {
        this.objects[i].render(interpFactor)
      }
    },

    addObject: function(klass/*, rest... */) {
      var rest, args, object
      rest = Array.prototype.slice.call(arguments, 1)
      // Does this work??
      if (!(klass.prototype instanceof Drawable)) {
        throw "klass must be a subclass of Drawable"
      }
      // This assumes that the klass's first argument is a 'parent' value
      // and that `klass` is a P constructor
      args = rest ? [this].concat(rest) : [this]
      object = klass.apply(null, args)
      this.objects.push(object)
      return object
    },

    stopDrawingObject: function (object) {
      var idx
      idx = this.objects.indexOf(object)
      this.hiddenObjects.push(object)
      if (idx) this.objects.splice(idx, 1)
    },

    resumeDrawingObject: function (object) {
      var idx
      idx = this.hiddenObjects.indexOf(object)
      this.objects.push(object)
      if (idx) this.hiddenObjects.splice(idx, 1)
    }
  }
})

