
'use strict';

window.Canvas = P(function(proto, uber, klass, uberklass) {
  return {
    init: function(id, options) {
      this.$wrapperElement = $(id)
      this.options = options || {}
      if (!this.options.ticksPerSecond) this.options.ticksPerSecond = 15
      if (!this.options.width) this.options.width = 800
      if (!this.options.height) this.options.height = 500

      this._addControls()
      if (this.options.debug) this._addDebug()
      if (this.options.trackFps) this._addFpsDisplay()
      if (this.options.showClock) this._addClock()
      this._addCanvas()

      this.ctx = this.$canvasElement[0].getContext('2d')
      this.secondsPerTick = 1 / this.options.ticksPerSecond

      ;(function (_this) {
        var dt, loop, tick

        dt = _this.secondsPerTick

        loop = function () {
          tick()
          if (_this.isRunning) {
            _this.timer = requestAnimFrame(loop)
          }
        }

        tick = function () {
          _this.objects.clear()
          _this.objects.update(_this.gameTime, dt)
          _this.objects.render()
          _this.gameTime += dt
        }

        _this.loop = loop
        _this.tick = tick
      })(this)
    },

    buildObjectCollection: function (cons) {
      var objects
      objects = cons(this)
      this.objects = objects
      return objects
    },

    start: function() {
      this._clear()
      this.isRunning = true
      this._startTimer()
      this.$starterBtn.text('Stop')
      this.$pauserBtn.attr('disabled', false)
      this.$drawBtn.attr('disabled', true)
    },

    stop: function() {
      this.isRunning = false
      this._stopTimer()
      this.$starterBtn.text('Start')
      this.$pauserBtn.attr('disabled', true)
      this.$drawBtn.attr('disabled', false)
    },

    pause: function() {
      this.isRunning = false
      this._stopTimer()
      this.isPaused = true
      this.$pauserBtn.text('Resume')
      this.$starterBtn.text('Start')
    },

    resume: function() {
      this.isRunning = true
      this._startTimer()
      this.isPaused = false
      this.$pauserBtn.text('Pause')
      this.$starterBtn.text('Stop')
    },

    reset: function () {
      this.stop()
      this._clear()
    },

    debug: function(msg) {
      if (this.debug) this.$debugDiv.append("<p>"+msg+"</p>")
    },

    getBounds: function(miter) {
      var miter
      miter = miter || 0
      return [
        [0 + miter, this.options.width - miter],
        [0 + miter, this.options.height - miter]
      ]
    },

    randomPos: function(bx, by) {
      var bx, by
      switch (arguments.length) {
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
      return Vec2(
        Math.floor(this.options.width / 2),
        Math.floor(this.options.height / 2)
      )
    },

    //---

    _startTimer: function() {
      var _this = this
      // TODO: This should subtract time paused or something...
      this.startTime = (new Date()).getTime()
      this.gameTime = 0
      this.loop()
    },

    _stopTimer: function () {
      if (this.timer) clearRequestInterval(this.timer)
      this.timer = null
    },

    _clear: function() {
      this.ctx.clearRect(0, 0, this.options.width, this.options.height)
      if (this.options.debug) this._clearDebug()
    },

    //---

    _addControls: function () {
      var $controlsDiv, $p, canvas, $pauserBtn, $drawBtn, $starterBtn, $resetBtn

      $controlsDiv = $('<div id="canvas-controls"></div>')

      $p = $('<p id="canvas-anim-controls"></p>')
      canvas = this
      $pauserBtn = $('<button disabled="disabled">Pause</button>')
      $drawBtn = $('<button>Next frame</button>')
      $starterBtn = $('<button>Start</button>')
      $resetBtn = $('<button>Reset</button>')

      $pauserBtn.on('click', function() {
        if (canvas.isPaused) {
          canvas.resume()
        } else {
          canvas.pause()
        }
        return false
      })

      $drawBtn.on('click', function() {
        canvas.tick()
        return false
      })

      $starterBtn.on('click', function() {
        if (canvas.isRunning) {
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
    },

    _addCanvas: function () {
      this.$canvasElement = $('<canvas id="canvas"></canvas>')
        .attr({
          width: this.options.width,
          height: this.options.height
        })
      this.$wrapperElement.append(this.$canvasElement)
    },

    _addDebug: function () {
      this.$debugDiv = $('<p id="canvas-debug">(debug goes here)</p>')
      this.$controlsDiv.append(this.$debugDiv)
    },

    _tickObjects: function () {
      this.objects.tick()
    },

    _addFpsDisplay: function () {
      this.$ticksPerSecondDiv = $('<p id="canvas-ticksPerSecond">f/s:</p>')
      this.$controlsDiv.append(this.$ticksPerSecondDiv)
    },

    _dumpFps: function () {
      var now, timeElapsed, ticksPerSecond, msPerTick
      if (!this.frameNo || !this.startTime) return
      now = new Date()
      timeElapsed = (now - this.startTime) / 1000
      ticksPerSecond = this.frameNo / timeElapsed
      msPerTick = 1000 / ticksPerSecond
      this.$ticksPerSecondDiv.html("f/s: " + ticksPerSecond + "<br />ms/f: " + msPerTick)
    },

    _addClock: function () {
      this.$clockDiv = $('<p id="canvas-clock">Time elapsed:</p>')
      this.$controlsDiv.append(this.$clockDiv)
    },

    _tickClock: function () {
      var now, diff
      now = new Date()
      diff = (now - this.startTime) / 1000
      this.$clockDiv.html("Time elapsed: " + diff + " s")
    },

    _clearDebug: function() {
      this.$debugDiv.html("")
    }
  }
})

