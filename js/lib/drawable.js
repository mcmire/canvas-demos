
'use strict';

window.Drawable = P(function () {
  return {
    init: function (parent) {
      this.setParent(parent)
    },

    setParent: function (parent) {
      if (!parent) return
      this.parent = parent
      this.canvas = (parent === Canvas || parent instanceof Canvas)
        ? parent
        : parent.canvas
      this.ctx = this.canvas.ctx
    },

    update: function (tickElapsedTime, timeStep) {
      throw new Error("You need to implement #update for your subclass of Drawable")
    },

    render: function (timeStep) {
      throw new Error("You need to implement #render for your subclass of Drawable")
    },
  }
})
