var Drawable = Class.extend({
  init: function(canvas) {
    this.canvas = canvas;
    this.cxt = canvas.cxt;
    this.drawable = true;
  },
  redraw: function() {
    throw new NotImplementedError("You need to implement Drawable#redraw");
  },
  stopDrawing: function() {
    this.drawable = false;
  }
})
