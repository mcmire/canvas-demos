
'use strict'

var DrawableCollection = (function () {
  var proto, DrawableCollection

  proto = {
    init: function(canvas, number, klass, args) {
      uber.init.call(this, args || [])
    },

    redraw: function() {
      _(this).chain().
        select(function(obj) { return obj.drawable }).
        each(function(obj) { obj.redraw() })
    },

    add: function() {
      this.create.apply(this, arguments)
      return this
    },

    addMany: function(number, klass, args) {
      var isFunc, i, fargs
      isFunc = (typeof args === 'function')
      for (i = 0; i < number; i++) {
        fargs = isFunc ? args(i) : args
        this.add(klass, fargs)
      }
    },

    // Like add, but returns the object added
    create: function(klass, rest) {
      var args, obj
      // This assumes that the klass's first argument is a 'parent' value
      args = rest ? [this].concat(rest) : [this]
      obj = klass.apply(null, args)
      this.push(obj)
      return obj
    }
  }

  DrawableCollection = function (canvas, number, klass, args) {
    var coll = [];
    $.v.extend(coll, Drawable.prototype, proto)
    Drawable.prototype.init.call(coll, canvas)
    if (arguments.length == 4) coll.addMany(number, klass, args)
    return coll
  }
  return DrawableCollection
})()

