var Canvas = Class.extend((function() {
  function addControls() {
    var $controlsDiv = $('<div id="canvas-controls">');

    var $p = $('<p id="canvas-anim-controls" />');
    var canvas = this;
    var $pauserBtn = $('<button disabled="disabled">Pause</button>');
    var $drawBtn = $('<button>Next frame</button>');
    var $starterBtn = $('<button>Start</button>');
    var $resetBtn = $('<button>Reset</button>');
    $pauserBtn.click(function() {
      if (canvas.withinState == "paused") {
        canvas.resume();
      } else {
        canvas.pause();
      }
      return false;
    });
    $drawBtn.click(function() {
      canvas.drawOne();
      return false;
    })
    $starterBtn.click(function() {
      if (canvas.withinState == "running") {
        canvas.stop();
      } else {
        canvas.start();
      }
      return false;
    });
    $resetBtn.click(function() {
      canvas.reset();
      return false;
    });
    $p.append($starterBtn).append($pauserBtn).append($drawBtn).append($resetBtn);

    $controlsDiv.append($p);
    this.$wrapperElement.append($controlsDiv);

    this.$controlsDiv = $controlsDiv;
    this.$pauserBtn = $pauserBtn;
    this.$drawBtn = $drawBtn;
    this.$starterBtn = $starterBtn;
    this.$resetBtn = $resetBtn;
  }
  function addCanvas() {
    this.$canvasElement = $('<canvas id="canvas" />').attr({ width: this.options.width, height: this.options.height })
    this.$wrapperElement.append(this.$canvasElement);
  }
  function addDebug() {
    this.$debugDiv = $('<p id="canvas-debug">(debug goes here)</p>')
    this.$controlsDiv.append(this.$debugDiv);
  }
  function drawObjects() {
    this.objects.redraw();
  }
  function addFpsDisplay() {
    this.$fpsDiv = $('<p id="canvas-fps">f/s:</p>');
    this.$controlsDiv.append(this.$fpsDiv);
  }
  function dumpFps() {
    if (!this.frameNo || !this.startTime) return;
    var now = new Date();
    var timeElapsed = (now - this.startTime) / 1000;
    var fps = this.frameNo / timeElapsed;
    var mspf = 1000 / fps;
    this.$fpsDiv.html("f/s: " + fps + "<br />ms/f: " + mspf);
  }
  function addClock() {
    this.$clockDiv = $('<p id="canvas-clock">Time elapsed:</p>');
    this.$controlsDiv.append(this.$clockDiv);
  }
  function redrawClock() {
    var now = new Date();
    var diff = (now - this.startTime) / 1000;
    this.$clockDiv.html("Time elapsed: " + diff + " s");
  }
  
  return {
    init: function(id, options) {
      this.$wrapperElement = $(id);
      this.options = options;
      if (!this.options.fps) this.options.fps = 30;
      if (!this.options.width) this.options.width = 800;
      if (!this.options.height) this.options.height = 500;

      this._(addControls)();
      if (this.options.debug) this._(addDebug)();
      if (this.options.trackFps) this._(addFpsDisplay)();
      if (this.options.showClock) this._(addClock)();
      this._(addCanvas)();

      this.cxt = this.$canvasElement[0].getContext("2d");
      $.extend(this.cxt, Canvas.CanvasContextHelpers);
      this.mspf = 1000 / this.options.fps;

      this.frameNo = 0;
      this.withinState = "stopped";
      this.objects = new DrawableCollection(this);
    },
    
    drawOne: function() {
      this.clear();
      this._(drawObjects)();
      this.frameNo++;
    },
    redraw: function() {
      if (this.options.trackFps) this._(dumpFps)();
      if (this.options.showClock) this._(redrawClock)();
      this.drawOne();
    },
    start: function() {
      this.reset();
      this.clearTimer();
      this.revive();
      this.$starterBtn.text("Stop");
      this.$pauserBtn.attr("disabled", false);
      this.$drawBtn.attr("disabled", true);
    },
    kill: function() {
      this.clearTimer();
      this.startTime = null;
      this.withinState = "stopped";
    },
    stop: function() {
      this.kill();
      this.$starterBtn.text("Start");
      this.$pauserBtn.attr("disabled", true);
      this.$drawBtn.attr("disabled", false);
    },
    clearTimer: function() {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
    },
    pause: function() {
      this.clearTimer();
      this.withinState = "paused";
      this.$pauserBtn.text("Resume");
      this.$starterBtn.text("Start");
    },
    startTimer: function() {
      // TODO: This should subtract time paused or something...
      this.startTime = new Date();
      this.redraw();
      this.timer = setInterval($.proxy(this, 'redraw'), this.mspf);
    },
    revive: function() {
      this.startTimer();
      this.withinState = "running";
    },
    resume: function() {
      this.revive();
      this.$pauserBtn.text("Pause");
      this.$starterBtn.text("Stop");
    },
    reset: function() {
      this.frameNo = 0;
      this.kill();
      this.clear();
    },
    clear: function() {
      this.cxt.clearRect(0, 0, this.options.width, this.options.height);
      //this.options.width = this.options.width;
      //log("Clearing the canvas, width is " + this.options.width + ", height is " + this.options.height);
      if (this.options.debug) this._clearDebug();
    },

    bounds: function(miter) {
      var miter = miter || 0;
      return [
        [0 + miter, this.options.width - miter],
        [0 + miter, this.options.height - miter]
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
      return new Vector(
        Math.rand(this.options.width - bx),
        Math.rand(this.options.height - by)
      );
    },
    center: function() {
      return [
        this.options.width / 2,
        this.options.height / 2
      ]
    },

    _clearDebug: function() {
      this.$debugDiv.html("");
    },
    debug: function(msg) {
      if (this.debug) this.$debugDiv.append("<p>"+msg+"</p>");
    }
  }
})());

Canvas.CanvasContextHelpers = {
  line: function(x1, y1, x2, y2, options) {
    var options = $.extend({}, options, {
      origin: [ ((x2-x1)/2), ((y2-y1)/2) ],
      coords: [ [x1, y1], [x2, y2] ]
    })
    this.createShape(options, function(o) {
      this.moveTo(o.coords[0][0], o.coords[0][1]);
      this.lineTo(o.coords[1][0], o.coords[1][1]);
    })
  },
  circle: function(x, y, radius, options) {
    var options = $.extend({}, options, {
      origin: [x, y],
      coords: [[x, y]]
    })
    this.createShape(options, function(o) {
      this.arc(o.origin[0], o.origin[1], radius, 0, 2*Math.PI);
    });
  },
  triangle: function(x, y, w, h, options) {
    var options = $.extend({}, options, {
      origin: [x, y],
      coords: [[x, y]]
    })
    this.createShape(options, function(o) {
      this.moveTo(o.origin[0] - (w / 2), o.origin[1] - (h / 2));
      this.lineTo(o.origin[0] - (w / 2), o.origin[1] + (h / 2));
      this.lineTo(o.origin[0] + (w / 2), o.origin[1]          );
    })
  },
  // TODO: Apply transformation, and add createShape
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
  
  withinState: function(callback) {
    this.save();
    callback.call(this);
    this.restore();
  },
  withinPath: function(callback, options) {
    this.beginPath();
    callback.call(this, options);
    this.closePath();
  },
  createShape: function(/* options, callback | callback */) {
    var args = [].slice.call(arguments);
    var sgra = args.reverse();
    var callback = sgra[0], options = sgra[1];
    var options = this.applyRotation(options || {});
    
    if (options.fill) { action = "fill"; color = options.fill }
    if (options.stroke) { action = "stroke"; color = options.stroke }
    if (color) this[action + "Style"] = color;
    if (options.lineWidth) this.lineWidth = options.lineWidth;
    
    if (options.rotate || options.translate) {
      this.withinState(function() {
        if (options.translate) this.translate.apply(this, options.translate);
        if (options.rotate) this.rotate(options.rotate);
        this.withinPath(callback, options);
      })
    } else {
      this.withinPath(callback, options);
    }
    
    if (action) this[action]();
  },
  applyRotation: function(args) {
    if (!args.rotate || args.translate) return args;
    //var args = $.extend(true, {}, args); // deep copy
    $.each(args.coords, function(i, coord) {
      coord[0] -= args.origin[0]
      coord[1] -= args.origin[1]
    })
    args.translate = args.origin;
    args.origin = [0, 0];
    return args;
  }
}