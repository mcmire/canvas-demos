
'use strict'

var Drawable = P(function () {
  return {
    init: function(parent) {
      this.parent = parent
      this.canvas = (parent === Canvas || parent instanceof Canvas)
        ? parent
        : parent.canvas
      this.ctx = this.canvas.ctx
      this.drawable = true
    },

    redraw: function() {
      throw new Error("You need to implement Drawable#redraw")
    },

    stopDrawing: function() {
      this.drawable = false
    }
  }
})
