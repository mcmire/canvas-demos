require(
{
  //urlArgs: "bust="+(new Date()).getTime()
  urlArgs: BUST
},
["scripts/lib/drawable"],
function() {
  window.Shape = Drawable.extend({
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
      this.color = options.color;
      if (!this.color) this.color = this.defaultColor();
    },
    redraw: function() {
      this.move();
      this.drawShape();
    },
    move: function() {
      this.setVel();
      this.setPos();
    },
    setVel: function() {
      throw new NotImplementedError("You need to implement CanvasObject#setVel");
    },
    setPos: function() {
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
})