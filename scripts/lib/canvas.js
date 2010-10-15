var Canvas = Class.extend({
  init: function(id) {
    this.canvasElement = $(id)[0];
    this.cxt = $.extend(this.canvasElement.getContext("2d"), Canvas.CanvasContextHelpers);
    this.speed = 4;
    this.frameRate = 50;

    var canvas = this;
    $('#startstop').click(function() {
      if (canvas.isRunning()) {
        canvas.stop();
        $(this).html("Start");
      } else {
        canvas.start();
        $(this).html("Stop");
      }
      return false;
    });
    $('#draw').click(function() {
      canvas.draw();
      return false;
    })
  },
  clear: function() {
    this.cxt.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    //this.canvasElement.width = this.canvasElement.width;
    //log("Clearing the canvas, width is " + this.canvasElement.width + ", height is " + this.canvasElement.height);
  },
  draw: function() {
    this.clear();
    clearDebug();
  },
  start: function() {
    this.timer = setInterval(this.draw.bind(this), this.frameRate);
  },
  stop: function() {
    clearInterval(this.timer);
    this.timer = null;
  },
  isRunning: function() {
    return !!this.timer;
  },
  bounds: function(miter) {
    var miter = miter || 0;
    return [
      [0 + miter, this.canvasElement.width - miter],
      [0 + miter, this.canvasElement.height - miter]
    ]
  },
  randomPos: function(bx, by) {
    var bx, by;
    switch(arguments.length) {
      case 2:
        bx = arguments[0];
        by = arguments[1];
        break;
      case 1:
        bx = by = arguments[0];
        break;
      case 0:
        bx = by = 0;
        break;
    }
    return [
      Math.rand(this.canvasElement.width - bx),
      Math.rand(this.canvasElement.height - by)
    ];
  },
  randomVel: function(speed) {
    var speed = speed || 10;
    return [
      Math.rand(-speed, speed),
      Math.rand(-speed, speed)
    ];
  },
  center: function() {
    return [
      this.canvasElement.width / 2,
      this.canvasElement.height / 2
    ]
  }
})
Canvas.CanvasContextHelpers = {
  line: function(x1, y1, x2, y2, options) {
    var options = options || {};
    this.createShape(options, function() {
      this.moveTo(x1, y1);
      this.lineTo(x2, y2);
    })
  },
  circle: function(x, y, radius, options) {
    this.createShape(options, function() {
      this.arc(x, y, radius, 0, 2*Math.PI);
    });
  },
  // This creates a triangle that points to the right.
  // TODO: Update these to add beginPath() / closePath()
  triangle: function(x, y, w, h) {
    this.moveTo(x - (w / 2), y - (h / 2));
    this.lineTo(x - (w / 2), y + (h / 2));
    this.lineTo(x + (w / 2), y                );
  },
  arrow: function(p1, p2) {
    var dy = p2[1] - p1[1];
    var dx = p1[1] - p1[0];
    //var m = dy/dx;
    //var w = -dx/dy;
    var f = 0.01;
    var sdy = -dx - 1;
    var sdx = f * dy;
    this.moveTo(p1[0]-sdx, p1[1]-sdy);
    this.lineTo(p1[0]+sdx, p1[1]+sdy);
    this.lineTo(p2[0]+sdx, p2[1]+sdy);
    this.lineTo(p2[0]+(sdx*2), p2[1]+(sdy*2));
    this.lineTo(p2[0]-(dx*2), p2[1]+(dy*2));
    this.lineTo(p2[0]-(sdx*2), p2[1]-(sdy*2));
    this.lineTo(p2[0]-sdx, p2[1]-sdy);
  },
  createPath: function(callback) {
    this.beginPath();
    callback.call(this);
    this.closePath();
  },
  createShape: function(/* options, callback OR callback */) {
    var args = [].slice.call(arguments);
    var sgra = args.reverse();
    var callback = sgra[0], options = sgra[1];
    var options = options || {};
    if (options.fill) { action = "fill"; color = options.fill }
    if (options.stroke) { action = "stroke"; color = options.stroke }
    if (color) this[action + "Style"] = color;
    if (options.lineWidth) this.lineWidth = options.lineWidth;
    this.createPath(callback);
    if (action) this[action]();
  }
}