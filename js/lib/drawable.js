
'use strict'

var Drawable = P(function () {
  return {
    init: function(parent) {
      this.setParent(parent)
    },

    setParent: function(parent) {
      if (!parent) return
      this.parent = parent
      this.canvas = (parent === Canvas || parent instanceof Canvas)
        ? parent
        : parent.canvas
      this.ctx = this.canvas.ctx
    },

    update: function() {
      throw new Error("You need to implement Drawable#update")
    },

    render: function() {
      throw new Error("You need to implement Drawable#render")
    },

    stopDrawing: function() {
      parent.stopDrawingObject(this)
    },

    resumeDrawing: function () {
      parent.resumeDrawingObject(this)
    }
  }
})
