
'use strict'

var DrawableCollection = P(Drawable, function (proto, uber) {
  return {
    init: function (parent) {
      uber.init.call(this, parent)
      this.objects = []
      this.hiddenObjects = []
    },

    redraw: function() {
      for (var i = 0; i < this.objects; i++) {
        this.objects[i].redraw()
      }
    },

    addObject: function(klass, opts) {
      var args, object
      // Does this work??
      if (!(klass.prototype instanceof Drawable)) {
        throw "klass must be a subclass of Drawable"
      }
      // This assumes that the klass's first argument is a 'parent' value
      // and that `klass` is a P constructor
      args = opts ? [this].concat(opts) : [this]
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

