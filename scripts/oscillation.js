require([
  "scripts/vendor/inheritance",
  "scripts/lib/utils",
  "scripts/lib/logging",
  "scripts/lib/vector",
  "scripts/lib/canvas",
  "scripts/lib/canvas_object",
  "scripts/lib/collision.mixin.js"
],
function()
{
  var CObject = CanvasObject.extend({
    setOptions: function(options) {
      this.radius = options.radius;
      this._super(canvas, options);
      this.A = 5
      this.af = 3;
      this.t = 0;
      this.ph = 0;
    },
    aim: function() {
      //this.theta += Math.PI / 16;
      this.t += 2;
      var y = this.A * Math.cos(this.af * this.t + this.ph);
      this.vel = [2, y];
    },
    drawShape: function() {
      debug("Velocity: " + this.vel);
      debug("Position: " + this.pos);
      this.cxt.circle(this.pos[0], this.pos[1], this.radius, {fill: this.color});
    },
    defaultPosition: function() {
      //return this.canvas.randomPos(this.radius * 4)
      return [200, 100];
    },
    defaultVelocity: function() {
      return [2, 0];
    },
    width: function() {
      return this.radius * 2;
    },
    height: function() {
      return this.radius * 2;
    }
  });

  var OscillationCanvas = Canvas.extend({
    init: function(id) {
      this._super(id);
      this.frameRate = 30;
      this.object = new CObject(this, { radius: 5 })
    },
    draw: function() {
      this._super();
      this.object.draw();
    }
  })

  // FIXME: No collision occurs for some reason...
  Collision.mixin({
    canvasClass: OscillationCanvas,
    objectClasses: [CObject]
  })

  window.canvas = new OscillationCanvas("#canvas");
})