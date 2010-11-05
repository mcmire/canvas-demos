var Shape = Drawable.extend({
  init: function(canvas, options) {
    this._super(canvas);
    this.setOptions(options);
  },
  setOptions: function(options) {
    this.options = options;
    this.pos = options.pos;
    if (!this.pos) this.pos = this.defaultPosition();
    this.vel = options.vel;
    if (!this.vel) this.vel = this.defaultVelocity();
    this.acc = options.acc;
    if (!this.acc) this.acc = this.defaultAcceleration();
    this.color = options.color;
    if (!this.color) this.color = this.defaultColor();
  },
  redraw: function() {
    this.setAcc();
    this.setVel();
    this.setPos();
    this.drawShape();
  },
  setAcc: function() {
    throw new NotImplementedError("You need to implement CanvasObject#setAcc");
  },
  setVel: function() {
    this.vel = Vector.add(this.vel, this.acc);
  },
  setPos: function() {
    this.pos = Vector.add(this.pos, this.vel);
  },
  drawShape: function() {
    throw new NotImplementedError("You need to implement CanvasObject#drawShape");
  },
  defaultPosition: function() {
    return this.canvas.randomPos(this.width(), this.height());
  },
  defaultVelocity: function() {
    return this.randomVector(10);
  },
  defaultAcceleration: function() {
    return new Vector(0, 0);
  },
  defaultColor: function() {
    return "black";
  },
  randomVector: function(def) {
    return new Vector(
      Math.rand(def, def),
      Math.rand(def, def)
    );
  },
  width: function() {
    throw new NotImplementedError("You need to implement CanvasObject#width");
  },
  height: function() {
    throw new NotImplementedError("You need to implement CanvasObject#height");
  }
})