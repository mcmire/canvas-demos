var GravityObject = Class.extend({
  init: function(canvas, options) {
    this.canvas = canvas;
    this.cxt = canvas.cxt;
    this.options = options;
    this.width = options.width;
    this.height = options.height;
    this.pos = options.pos || this.canvas.randomPos(this.radius * 4);
    this.vel = options.vel || [0, 0];
    //this.speed = options.speed || 10;
    //this.vel = options.vel || this.canvas.randomVel(this.speed);
    this.color = options.color || "black";
  },
  draw: function() {
    this.drawShape();
  },
  drawShape: function() {
    this.cxt.save();
    this.cxt.fillStyle = this.color;
    this.cxt.beginPath();
    this.cxt.translate(this.pos[0], this.pos[1])
    var theta = Vector.angle(this.vel);
    this.cxt.rotate(theta);
    this.cxt.triangle(0, 0, this.width, this.height);
    this.cxt.closePath();
    this.cxt.fill();
    this.cxt.restore();
  }
})
GravityObject.generate = function(canvas, options) {
  var m = Math.rand(3, 6)
  var r = 6 + ((m - 1) / (4 - 1)) * (20 - 6); // 3-6 => 6-20
  var options = $.extend(options, {
    width: r,
    height: r * 1.5,
    mass: m * Math.pow(10, 6)
  });
  return new this(canvas, options);
}

var GravityCanvas = Canvas.extend({
  init: function(id) {
    this._super(id);
    this.frameRate = 30;
    var obj = new GravityObject(this, {
      type: "attractive",
      pos: Vector.subtract(this.center(), [300, 0]),
      vel: [0, 0],
      width: 10,
      height: 15,
      mass: 3 * Math.pow(10, 6)
    })
    this.objects = [obj];
  },
  draw: function() {
    this._super();
    clearDebug();
    for (var i=0; i<this.objects.length; i++) this.objects[i].draw();
    if (this.mouseObject) this.mouseObject.drawShape();
  },
  bindMouseCallbacks: function() {
    $(this.canvasElement).bind({
      mouseenter: this.onMouseEnter.bind(this),
      mouseleave: this.onMouseLeave.bind(this),
      mousemove: this.onMouseMove.bind(this),
      mousedown: this.onMouseDown.bind(this),
      mouseup: this.onMouseUp.bind(this)
    })
  },
  onMouseEnter: function(event) {
    this.mouseObject = this.generateMouseObject(this.getMousePos(event));
  },
  onMouseLeave: function(event) {
    this.mouseObject = null;
  },
  onMouseMove: function(event) {
    this.mouseObject.pos = this.getMousePos(event);
  },
  onMouseDown: function(event) {
    this.mouseObject.mouseStart = this.getMousePos(event);
  },
  onMouseUp: function(event) {
    var mp = this.getMousePos(event);
    this.mouseObject.mouseEnd = mp;
    this.mouseObject.vel = Vector.divide(Vector.subtract(this.mouseObject.mouseEnd, this.mouseObject.mouseStart), 6);
    this.mouseObject.color = "black";
    this.objects.push(this.mouseObject);
    this.mouseObject = this.generateMouseObject(mp);
  },
  getMousePos: function(event) {
    // from http://diveintohtml5.org/canvas.html
    var mx = event.pageX - this.canvasElement.offsetLeft;
    var my = event.pageY - this.canvasElement.offsetTop;
    return [mx, my];
  },
  generateMouseObject: function(mpos) {
    return GravityObject.generate(this, {
      type: "attractive",
      pos: mpos,
      color: "rgba(0,0,0,0.4)"
    })
  }
})

Gravity.mixin({
  canvasClass: GravityCanvas,
  objectClasses: [GravityObject],
  objects: function() { return this.objects }
});

$(function() {
  var canvas = new GravityCanvas("#canvas");
  canvas.bindMouseCallbacks();
})