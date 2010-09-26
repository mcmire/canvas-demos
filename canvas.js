var Canvas = Class.extend({
  init: function(id) {
    this.canvasElement = $(id)[0];
    this.cxt = this.canvasElement.getContext("2d");
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