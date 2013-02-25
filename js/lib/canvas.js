
'use strict';

window.Canvas = P(function(proto, uber, klass, uberklass) {
  return {
    init: function(id, options) {
      var options

      this.$wrapperElement = $(id)
      this.options = options = options || {}

      this.ticksPerSecond = ('ticksPerSecond' in options) ? options.ticksPerSecond : 15
      this.width = ('width' in options) ? options.width : 800
      this.height = ('height' in options) ? options.height : 500

      this._addControls()
      if (this.options.debug) this._addDebug()
      if (this.options.trackFps) this._addFpsDisplay()
      if (this.options.showClock) this._addClock()
      this._addCanvas()

      this.ctx = this.$canvasElement[0].getContext('2d')
      this.secondsPerTick = 1 / this.ticksPerSecond

      this.keyboard = keyboard.init()

      ;(function (_this) {
        var timeStep, loop, tick

        timeStep = _this.secondsPerTick

        loop = function () {
          tick()
          if (_this.isRunning) {
            _this.timer = requestAnimFrame(loop)
          }
        }

        tick = function () {
          var t, tickElapsedTime
          t = (new Date()).getTime()
          tickElapsedTime = t - _this.lastTickTime
          // Cap this to avoid "spiral of death".
          // (Honestly not sure why this is 250ms? A magic number if I ever saw one)
          if (tickElapsedTime > 250) { tickElapsedTime = 250 }

          _this.ctx.clearRect(0, 0, _this.width, _this.height)
          //_this.objects.clear()
          _this.objects.update(tickElapsedTime, timeStep)
          _this.objects.render(timeStep)

          _this.lastTickTime = t
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

    addEvents: function () {
      this.keyboard.addEvents()
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
        [0 + miter, this.width - miter],
        [0 + miter, this.height - miter]
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
        util.rand.int(this.width - bx),
        util.rand.int(this.height - by)
      )
    },

    center: function() {
      return Vec2(
        Math.floor(this.width / 2),
        Math.floor(this.height / 2)
      )
    },

    /*
    repulsionForce: function (obj) {
      var maxForce, k, xxa, xxb, xya, xyb, fxa, fxb, fya, fyb
      // force pushed on an object if it ends up getting so close that it
      // touches the border of the canvas
      maxForce = 20
      // not sure how to describe this number, but it affects the
      // acceleration curve over time - the smaller the number, the faster the
      // acceleration tapers off as the object backs away from the border;
      // the larger the number, the sooner the force starts to affect the object
      // as it gets closer to the border
      k = 32
      xxa = newState.pos[0]
      xxb = this.canvas.width - newState.pos[0]
      xya = newState.pos[1]
      xyb = this.canvas.width - newState.pos[1]
      // I just figured this out with a graphing calculator
      fxa = maxForce / (((xxa * xxa) / k) + 1)
      fxb = -maxForce / (((xxb * xxb) / k) + 1)
      fya = maxForce / (((xya * xya) / k) + 1)
      fyb = -maxForce / (((xyb * xyb) / k) + 1)
      return Vec2(fxa + fxb, fya + fyb)
    },
    */

    fixPossibleCollision: function (obj) {
      var state = obj.currState,
          mom = state.momentum,
          vel = state.velocity,
          pos = state.position,
          w = this.width,
          h = this.height,
          ohw = obj.width / 2,
          ohh = obj.height / 2,
          leftEdge = pos[0] - ohw,
          rightEdge = pos[0] + ohw,
          topEdge = pos[1] - ohh,
          bottomEdge = pos[1] + ohh,
          hitLeft = (leftEdge < 0),
          hitRight = (rightEdge > w),
          hitTop = (topEdge < 0),
          hitBottom = (bottomEdge > h),
          fixed = false
      if (hitLeft || hitRight) {
        pos[0] = hitLeft ? ohw : (w - ohw)
        vel[0] = -vel[0]
        mom[0] = -mom[0]
        fixed = true
      }
      if (hitTop || hitBottom) {
        pos[1] = hitTop ? ohh : (h - ohh)
        vel[1] = -vel[1]
        mom[1] = -mom[1]
        fixed = true
      }
      return fixed
    },

    //---

    _startTimer: function() {
      var _this = this
      // TODO: This should subtract time paused or something...
      this.startTime = this.lastTickTime = (new Date()).getTime()
      this.timeSinceLastUpdate = 0
      this.loop()
    },

    _stopTimer: function () {
      if (this.timer) clearRequestInterval(this.timer)
      this.timer = null
    },

    _clear: function() {
      this.ctx.clearRect(0, 0, this.width, this.height)
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
          width: this.width,
          height: this.height
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

