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
  var EASING_FORMULAS = {
    // t = t, b = x0, c = dx, d = dt

    linear: {
      name: "Linear",
      code: function(dx, dt, x0, t) {
        // Beginning at a position, the change in position beyond that will be equal to
        // the ratio between the amount of time that's passed and the total amount of time
        // the object should move, applied to the final distance the object should travel.
        // In other words, the position is linearly proportional to the time.
        // Another way of writing this is: (dx/dt) * t + x0 (y = mx + b, or x = vt + x0)
        var tr = t/dt;
        return x0 + dx*tr;
      }
    },
    easeInQuad: {
      name: "Ease-in (quadratic)",
      code: function(dx, dt, x0, t) {
        // Beginning at a position, the change in position beyond that will be equal to
        // the current time ratio squared, applied to the final distance the object should
        // travel. In other words, the position is squarely proportional to the time.
        // The effect is that the object starts out moving slowly, then accelerates as it
        // nears the destination.
        var tr = t/dt;
        return x0 + dx*tr*tr;
      }
    },
    easeOutQuad: {
      name: "Ease-out (quadratic)",
      code: function(dx, dt, x0, t) {
        // Ease-out is the same as ease-in, only flipped and offset
        // Note that a graph of this equation will continue past t = dt
        var tr = t/dt;
        return x0 - dx*tr*(tr - 2);
      }
    },
    easeInOutQuad: {
      name: "Ease-in-out (quadratic)",
      code: function(dx, dt, x0, t) {
        // Ease-in-out is a combination of ease-in for the first half of the duration,
        // and then ease-out for the second half.
        // (This is really kind of cryptic and it'd be nice if I could figure this out...)
        if (t < dt/2) {
          var tr = t/dt;
          return x0 + 2*(dx*tr*tr);
        } else {
          var t2 = t - dt/2;
          var tr2 = t2/dt;
          return x0 + -2*(dx*tr2*tr2) + 2*(dx*tr2) + dx/2;
        }
      }
    }
  }

  var EasingCanvas = Canvas.extend({
    init: function(id, options) {
      this._super(id, options);
      this._addEasingDropdown();
    },
    _addEasingDropdown: function() {
      var $dropdown = $('<select id="easing-formula">');
      $.each(EASING_FORMULAS, function(k, v) {
        $dropdown.append('<option value="'+k+'">'+v.name+'</option>')
      })
      var canvas = this;
      $dropdown.change(function() {
        canvas.easingFormula = EASING_FORMULAS[this.value];
      })
      this.easingFormula = EASING_FORMULAS[$dropdown.val()];
      var $p = $('<p>Select easing formula: </p>').append($dropdown);
      this.$canvasElement.before($p);
      this.$easingDropdown = $dropdown;
    }
  });
  EasingCanvas.Object = Drawable.extend({
    init: function(canvas, options) {
      this._super(canvas);
      this.options = options;
      this.radius = options.radius;
      this.distance = options.endPos - options.startPos;
      this.duration = options.duration * this.canvas.options.fps; // time -> frames
      this.pos = options.startPos;
    },
    redraw: function() {
      var x = this.canvas.easingFormula.code.call(this,
        this.distance,
        this.duration,
        this.options.startPos,
        this.canvas.frameNo
      );
      if (x < this.options.endPos) {
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