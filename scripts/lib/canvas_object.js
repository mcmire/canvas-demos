var CanvasObject = Class.extend({
  init: function(canvas, options) {
    this.canvas = canvas;
    this.cxt = canvas.cxt;
    this.setOptions(options);
  },
  setOptions: function(options) {
    this.options = options;
    this.pos = options.pos;
    if (!this.pos) this.pos = this.defaultPosition();
    this.vel = options.vel;
    if (!this.vel) this.vel = this.defaultVelocity();
    this.color = options.color;
    if (!this.color) this.color = this.defaultColor();
  },
  draw: function() {
    this.alreadyAimed = false;
    this.alreadyMoved = false;
    this.aim();
    this.move();
    this.drawShape();
  },
  aim: function() {
    throw new NotImplementedError("You need to implement CanvasObject#aim");
  },
  move: function() {
    this.pos = Vector.add(this.pos, this.vel);
  },
  drawShape: function() {
    throw new NotImplementedError("You need to implement CanvasObject#drawShape");
  },
  defaultPosition: function() {
    return this.canvas.randomPos();
  },
  defaultVelocity: function() {
    return [2, 2];
  },
  defaultColor: function() {
    return "black";
  },
  width: function() {
    throw new NotImplementedError("You need to implement CanvasObject#width");
  },
  height: function() {
    throw new NotImplementedError("You need to implement CanvasObject#height");
  }
})