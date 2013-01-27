var Drawable = Class.extend({
  init: function(parent) {
    this.parent = parent
    this.canvas = (parent === Canvas || parent instanceof Canvas) ? parent : parent.canvas;
    this.cxt = this.canvas.cxt;
    this.drawable = true;
  },
  redraw: function() {
    throw new NotImplementedError("You need to implement Drawable#redraw");
  },
  stopDrawing: function() {
    this.drawable = false;
  }
})
