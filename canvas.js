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
    if (!by) by = bx;
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
  triangle: function(x, y, width, height) {
    this.moveTo(x - height/2, y - width/2);
    this.lineTo(x - height/2, y + width/2);
    this.lineTo(x + height/2, y);
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
  }
}