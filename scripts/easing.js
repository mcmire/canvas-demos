var BUST = (new Date()).getTime();

require(
{
  urlArgs: BUST
},
[
  "scripts/vendor/inheritance",
  "scripts/lib/utils",
  "scripts/lib/logging",
  "scripts/lib/vector",
  "scripts/lib/canvas",
  "scripts/lib/canvas_object"
],
function()
{
  var EasingCanvas = Canvas.extend();
  EasingCanvas.Object = Drawable.extend({
    init: function(canvas, options) {
      this._super(canvas);
      this.options = options;
      this.radius = options.radius;
      this.distance = options.endPos - options.startPos;
      this.duration = options.duration * this.canvas.options.fps; // time -> frames
      this.pos = options.startPos;
      this.vel = this.distance / this.duration;
    },
    redraw: function() {
      // yer basic linear tween
      //var pos = Vector.add(Vector.multiply(Vector.divide(this.delta, this.duration), this.frame), this.startPos);
      // x = mx + b ==> s + vt
      //var timeElapsed = (this.canvas.frameNo * this.canvas.mspf) / 1000;
      //var timeElapsed = ((new Date()) - this.canvas.startTime) / 1000;
      var timeElapsed = this.canvas.frameNo;
      var x = this.options.startPos + (this.vel * timeElapsed);
      if (x <= this.options.endPos) {
        this.pos = x;
      } else {
        this.canvas.stop();
      }
      this.drawShape();
    },
    drawShape: function() {
      this.cxt.circle(this.pos, 200, this.radius, {fill: "black"});
    }
  });

  var canvas = new EasingCanvas("#canvas", { fps: 30, trackFps: true, showClock: true });
  canvas.addObject(EasingCanvas.Object, { radius: 5, startPos: 200, endPos: 400, duration: 1.5 });

  // make it global
  window.canvas = canvas;
})