var BUST = (new Date()).getTime();

var EASING_FORMULAS = {
  //
  // Sources for the easing equations are:
  // * http://www.actionscript.org/forums/showthread.php3?s=&threadid=5312
  // * http://www.robertpenner.com/easing/penner_chapter7_tweening.pdf
  // * http://gsgd.co.uk/sandbox/jquery/easing/
  //
  // The names of variables used in the equations were adjusted as follows:
  //   t = t
  //   b = x0
  //   c = dx
  //   d = dt
  //

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
      return x0 - dx*tr*(tr-2);
    }
  },
  easeInOutQuad: {
    name: "Ease-in-out (quadratic)",
    code: function(dx, dt, x0, t) {
      // Ease-in-out is a combination of ease-in for the first half of the duration,
      // and then ease-out for the second half.
      // (This is really kind of cryptic and it'd be nice if I could figure this out...)
      var tr2 = t / (dt/2);
      if (tr2 < 1) {
        return x0 + dx/2*tr2*tr2;
      } else {
        return x0 - dx/2 * ((tr2-1)*(tr2-3) - 1);
      }
    }
  },
  easeInCubic: {
    name: "Ease-in (cubic)",
    code: function(dx, dt, x0, t) {
      // Beginning at a position, the change in position beyond that will be equal to
      // the current time ratio cubed, applied to the final distance the object should
      // travel. In other words, the position is cubicly proportional to the time.
      // The effect is that the object starts out moving more slowly than the quadratic
      // equation, and accelerates faster to reach the final destination in time.
      var tr = t/dt;
      return x0 + dx*Math.pow(tr, 3);
    }
  },
  easeOutCubic: {
    name: "Ease-out (cubic)",
    code: function(dx, dt, x0, t) {
      // Ease-out is the same as ease-in, only flipped and massaged.
      var tr = t/dt;
      return x0 + dx * (Math.pow(tr-1, 3) + 1);
    }
  },
  easeInOutCubic: {
    name: "Ease-in-out (cubic)",
    code: function(dx, dt, x0, t) {
      // Not really sure what's going on here, either.
      var tr2 = t / (dt/2);
      if (tr2 < 1) {
        return x0 + dx/2 * Math.pow(tr2, 3);
      } else {
        return x0 + dx/2 * (Math.pow(tr2-2, 3) + 2);
      }
    }
  },
  easeInQuartic: {
    name: "Ease-in (quartic)",
    code: function(dx, dt, x0, t) {
      // The change in position is quarticly proportional to the change in time.
      var tr = t/dt;
      return x0 + dx * Math.pow(tr, 4);
    }
  },
  easeOutQuartic: {
    name: "Ease-out (quartic)",
    code: function(dx, dt, x0, t) {
      var tr = t/dt;
      return x0 + -dx * (Math.pow(tr-1, 4) - 1);
    }
  },
  easeInOutQuartic: {
    name: "Ease-in-out (quartic)",
    code: function(dx, dt, x0, t) {
      var tr2 = t / (dt/2);
      if (tr2 < 1) {
        return x0 + dx/2 * Math.pow(tr2, 4);
      } else {
        return x0 + -dx/2 * (Math.pow(tr2-2, 4) - 2);
      }
    }
  },
  easeInQuintic: {
    name: "Ease-in (quintic)",
    code: function(dx, dt, x0, t) {
      var tr = t/dt;
      return x0 + dx * Math.pow(tr, 5);
    }
  },
  easeOutQuintic: {
    name: "Ease-out (quintic)",
    code: function(dx, dt, x0, t) {
      var tr = t/dt;
      return x0 + dx * (Math.pow(tr-1, 5) + 1);
    }
  },
  easeInOutQuintic: {
    name: "Ease-in-out (quintic)",
    code: function(dx, dt, x0, t) {
      var tr2 = t / (dt/2);
      if (tr2 < 1) {
        return x0 + dx/2 * Math.pow(tr2, 5);
      } else {
        return x0 + dx/2 * (Math.pow(tr2-2, 5) + 2);
      }
    }
  },
  easeInSine: {
    name: "Ease-in (sine)",
    code: function(dx, dt, x0, t) {
      var tr = t/dt;
      return x0 + dx * (1 - Math.cos(tr * (Math.PI/2)));
    }
  },
  easeOutSine: {
    name: "Ease-out (sine)",
    code: function(dx, dt, x0, t) {
      var tr = t/dt;
      return x0 + dx * Math.sin(tr * (Math.PI/2));
    }
  },
  easeInOutSine: {
    name: "Ease-in-out (sine)",
    code: function(dx, dt, x0, t) {
      var tr = t/dt;
      return x0 + dx/2 * (1 - Math.cos(tr * Math.PI));
    }
  },
  easeInExp: {
    name: "Ease-in (exponential)",
    code: function(dx, dt, x0, t) {
      var tr = t/dt;
      return x0 + dx * Math.pow(2, 10 * (tr - 1));
    }
  },
  easeOutExp: {
    name: "Ease-out (exponential)",
    code: function(dx, dt, x0, t) {
      var tr = t/dt;
      return x0 + dx * (-Math.pow(2, -10 * tr) + 1);
    }
  },
  easeInOutExp: {
    name: "Ease-in-out (exponential)",
    code: function(dx, dt, x0, t) {
      var tr2 = t / (dt/2);
      if (tr2 < 1) {
        return x0 + dx/2 * Math.pow(2, 10 * (tr2 - 1));
      } else {
        return x0 + dx/2 * (-Math.pow(2, -10 * (tr2 - 1)) + 2);
      }
    }
  },
  easeInCirc: {
    name: "Ease-in (circular)",
    code: function(dx, dt, x0, t) {
      var tr = t/dt;
      return x0 + dx * (1 - Math.sqrt(1 - tr*tr));
    }
  },
  easeOutCirc: {
    name: "Ease-out (circular)",
    code: function(dx, dt, x0, t) {
      var tr = (t/dt) - 1;
      return x0 + dx * Math.sqrt(1 - tr*tr);
    }
  },
  easeInOutCirc: {
    name: "Ease-in-out (circular)",
    code: function(dx, dt, x0, t) {
      var tr2 = t / (dt/2);
      if (tr2 < 1) {
        return x0 + dx/2 * (1 - Math.sqrt(1 - tr2*tr2));
      } else {
        tr2 -= 2;
        return x0 + dx/2 * (Math.sqrt(1 - tr2*tr2) + 1);
      }
    }
  }
}

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
  window.EasingGraph = function(canvas, element) {
    this.canvas = canvas;
    var $element = this.$element = $(element);
    this.cxt = this.$element[0].getContext("2d");
    this.width = $element.attr("width");
    this.height = $element.attr("height");

    //var $debug = $('<p>');
    //$('#easing-formula').after($debug);
    //this.$debug = $debug;
  }
  EasingGraph.prototype.redraw = function() {
    var func = this.canvas.easingFormula.code;
    this.clear();
    this.cxt.beginPath();
    this.cxt.moveTo(0, this.height);
    //var points = [];
    var maxT = this.width; //100;
    var maxX = this.height; // 0;
    var res = maxT / 25; // 5;
    //this.$debug.html("");
    //var div = $('<div>unscaled: </div>');
    for (var t=0; t<=maxT; t+=res) {
      var dx = maxX; //1;
      var dt = maxT; //1;
      var x0 = 0;
      var x = func(dx, dt, x0, t);
      //points.push([t, x]);
      //div.append('(' + t + ', ' + x + ') ');
      this.cxt.lineTo(t, this.height - x);
    }
    //this.$debug.append(div);
    // don't close path or else the next time the line is drawn
    // the last line drawn will still appear
    //this.cxt.closePath();
    this.cxt.stroke();
  }
  EasingGraph.prototype.clear = function() {
    this.cxt.clearRect(0, 0, this.width, this.height);
  }

  window.EasingCanvas = Canvas.extend({
    init: function(id, options) {
      this._super(id, options);
      this._addEasingDropdown();
      this._addEasingGraph();
    },
    _addEasingDropdown: function() {
      var $dropdown = $('<select>');
      $.each(EASING_FORMULAS, function(k, v) {
        $dropdown.append('<option value="'+k+'">'+v.name+'</option>')
      })
      var canvas = this;
      $dropdown.change(function() {
        canvas.easingFormula = EASING_FORMULAS[this.value];
      })
      this.easingFormula = EASING_FORMULAS[$dropdown.val()];
      var $p = $('<p id="easing-formula">Select easing formula: </p>').append($dropdown);
      this.$controlsDiv.append($p);
      this.$easingDropdown = $dropdown;
    },
    _addEasingGraph: function() {
      var width = 150, height = 150;
      var $graph = $('<canvas id="easing-graph" width="150" height="150">');
      var graph = new EasingGraph(this, $graph);
      this.$easingDropdown.bind('change.easing-graph', function() { graph.redraw() })
      this.$controlsDiv.after($graph);
      this.$easingDropdown.trigger('change.easing-graph');
      this.easingGraph = graph;
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
      this.pos = x;
      this.drawShape();
      if (x >= this.options.endPos || this.canvas.frameNo >= this.duration) {
        this.canvas.stop();
      }
    },
    drawShape: function() {
      this.cxt.circle(this.pos, 200, this.radius, {fill: "black"});
    }
  });

  var canvas = new EasingCanvas("#wrapper", { width: 800, height: 300, fps: 30, trackFps: true, showClock: true });
  canvas.addObject(EasingCanvas.Object, { radius: 5, startPos: 200, endPos: 400, duration: 1.5 });

  // make it global
  window.canvas = canvas;
})