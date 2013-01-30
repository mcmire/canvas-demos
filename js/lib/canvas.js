
'use strict'

var Canvas = P(function(proto, uber, klass, uberklass) {
  function addControls() {
    var $controlsDiv, $p, canvas, $pauserBtn, $drawBtn, $starterBtn, $resetBtn

    $controlsDiv = $('<div id="canvas-controls"></div>')

    $p = $('<p id="canvas-anim-controls"></p>')
    canvas = this
    $pauserBtn = $('<button disabled="disabled">Pause</button>')
    $drawBtn = $('<button>Next frame</button>')
    $starterBtn = $('<button>Start</button>')
    $resetBtn = $('<button>Reset</button>')

    $pauserBtn.on('click', function() {
      if (canvas.state == "paused") {
        canvas.resume()
      } else {
        canvas.pause()
      }
      return false
    })
    $drawBtn.on('click', function() {
      canvas.drawOne()
      return false
    })
    $starterBtn.on('click', function() {
      if (canvas.state == "running") {
        canvas.stop()
      } else {
        canvas.start()
      }
      return false
    })
    $resetBtn.on('click', function() {
      canvas.reset()
      return false
    })
    $p.append($starterBtn).append($pauserBtn).append($drawBtn).append($resetBtn)

    $controlsDiv.append($p)
    this.$wrapperElement.append($controlsDiv)

    this.$controlsDiv = $controlsDiv
    this.$pauserBtn = $pauserBtn
    this.$drawBtn = $drawBtn
    this.$starterBtn = $starterBtn
    this.$resetBtn = $resetBtn
  }
  function addCanvas() {
    this.$canvasElement = $('<canvas id="canvas"></canvas>')
      .attr({
        width: this.options.width,
        height: this.options.height
      })
    this.$wrapperElement.append(this.$canvasElement)
  }
  function addDebug() {
    this.$debugDiv = $('<p id="canvas-debug">(debug goes here)</p>')
    this.$controlsDiv.append(this.$debugDiv)
  }
  function drawObjects() {
    this.objects.redraw()
  }
  function addFpsDisplay() {
    this.$fpsDiv = $('<p id="canvas-fps">f/s:</p>')
    this.$controlsDiv.append(this.$fpsDiv)
  }
  function dumpFps() {
    var now, timeElapsed, fps, mspf
    if (!this.frameNo || !this.startTime) return
    now = new Date()
    timeElapsed = (now - this.startTime) / 1000
    fps = this.frameNo / timeElapsed
    mspf = 1000 / fps
    this.$fpsDiv.html("f/s: " + fps + "<br />ms/f: " + mspf)
  }
  function addClock() {
    this.$clockDiv = $('<p id="canvas-clock">Time elapsed:</p>')
    this.$controlsDiv.append(this.$clockDiv)
  }
  function redrawClock() {
    var now, diff
    now = new Date()
    diff = (now - this.startTime) / 1000
    this.$clockDiv.html("Time elapsed: " + diff + " s")
  }

  $.v.extend(proto, {
    init: function(id, options) {
      this.$wrapperElement = $(id)
      this.options = options
      if (!this.options.fps) this.options.fps = 30
      if (!this.options.width) this.options.width = 800
      if (!this.options.height) this.options.height = 500

      addControls.call(this)
      if (this.options.debug) addDebug.call(this)
      if (this.options.trackFps) addFpsDisplay.call(this)
      if (this.options.showClock) addClock.call(this)
      addCanvas.call(this)

      this.ctx = this.$canvasElement[0].getContext("2d")
      this.mspf = 1000 / this.options.fps

      this.frameNo = 0
      this.state = "stopped"
      this.objects = DrawableCollection(this)
    },

    drawOne: function() {
      this.clear()
      drawObjects.call(this)
      this.frameNo++
    },
    redraw: function() {
      if (this.options.trackFps) dumpFps.call(this)
      if (this.options.showClock) redrawClock.call(this)
      this.drawOne()
    },
    start: function() {
      this.reset()
      this.clearTimer()
      this.revive()
      this.$starterBtn.text("Stop")
      this.$pauserBtn.attr("disabled", false)
      this.$drawBtn.attr("disabled", true)
    },
    kill: function() {
      this.clearTimer()
      this.startTime = null
      this.state = "stopped"
    },
    stop: function() {
      this.kill()
      this.$starterBtn.text("Start")
      this.$pauserBtn.attr("disabled", true)
      this.$drawBtn.attr("disabled", false)
    },
    clearTimer: function() {
      if (this.timer) clearInterval(this.timer)
      this.timer = null
    },
    pause: function() {
      this.clearTimer()
      this.state = "paused"
      this.$pauserBtn.text("Resume")
      this.$starterBtn.text("Start")
    },
    startTimer: function() {
      var _this = this
      // TODO: This should subtract time paused or something...
      this.startTime = new Date()
      this.redraw()
      // TODO: Use requestAnimationFrame
      this.timer = setInterval(function () {
        _this.redraw()
      }, this.mspf)
    },
    revive: function() {
      this.startTimer()
      this.state = "running"
    },
    resume: function() {
      this.revive()
      this.$pauserBtn.text("Pause")
      this.$starterBtn.text("Stop")
    },
    reset: function() {
      this.frameNo = 0
      this.kill()
      this.clear()
    },
    clear: function() {
      this.ctx.clearRect(0, 0, this.options.width, this.options.height)
      //this.options.width = this.options.width
      //log("Clearing the canvas, width is " + this.options.width + ", height is " + this.options.height)
      if (this.options.debug) this._clearDebug()
    },

    bounds: function(miter) {
      var miter
      miter = miter || 0
      return [
        [0 + miter, this.options.width - miter],
        [0 + miter, this.options.height - miter]
      ]
    },
    randomPos: function(bx, by) {
      var bx, by
      switch(arguments.length) {
        case 2:
          bx = arguments[0]
          by = arguments[1]
          break
        case 1:
          bx = by = arguments[0]
          break
        case 0:
          bx = by = 0
          break
      }
      return Vec2(
        util.rand.int(this.options.width - bx),
        util.rand.int(this.options.height - by)
      )
    },
    center: function() {
      return [
        this.options.width / 2,
        this.options.height / 2
      ]
    },

    _clearDebug: function() {
      this.$debugDiv.html("")
    },
    debug: function(msg) {
      if (this.debug) this.$debugDiv.append("<p>"+msg+"</p>")
    }
  })

  $.v.extend(proto, CanvasHelpers)
})
