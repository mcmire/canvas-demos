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
      this.radius = options.radius;
      this.startPos = 200;
      this.endPos = 400;
      this.distance = this.endPos - this.startPos;
      this.duration = 2;// * this.canvas.options.fps; // number of frames
      this.pos = this.startPos;
      this.vel = this.distance / this.duration;
    },
    redraw: function() {
      // yer basic linear tween
      //var pos = Vector.add(Vector.multiply(Vector.divide(this.delta, this.duration), this.frame), this.startPos);
      // x = mx + b ==> s + vt
      var approxTimeElapsed = (this.canvas.frameNo * this.canvas.mspf) / 1000;
      var x = this.startPos + (this.vel * approxTimeElapsed);
      if (x <= this.endPos) {
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

  var canvas = new EasingCanvas("#canvas", { fps: 20, trackFps: true, showClock: true });
  canvas.addObject(EasingCanvas.Object, { radius: 5 });

  // make it global
  window.canvas = canvas;
})