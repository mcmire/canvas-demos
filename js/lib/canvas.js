
'use strict';

window.Canvas = P(function(proto, uber, klass, uberklass) {
  domEventEmitter.mixInto(proto, 'canvas')

  return {
    init: function(id, options) {
      var options

      this.$wrapperElement = $(id)
      this.options = options = options || {}

      this.ticksPerSecond = ('ticksPerSecond' in options) ? options.ticksPerSecond : 15
      this.width = ('width' in options) ? options.width : 800
      this.height = ('height' in options) ? options.height : 500

      this._addControls()
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

        tick = function (isForOneFrame) {
          console.log('tick')
          var currentTime, tickTime, deltaTime
          if (isForOneFrame) {
            _this.objects.update(_this.gameTime, timeStep)
            _this.clear()
            _this.objects.render()
          }
          else {
            // http://gafferongames.com/game-physics/fix-your-timestep/
            currentTime = (new Date()).getTime()
            tickTime = currentTime - _this.lastTickTime
            while (tickTime > 0) {
              deltaTime = Math.min(tickTime, timeStep)
              _this.objects.update(_this.gameTime, deltaTime)
              tickTime -= deltaTime
              _this.gameTime += deltaTime
            }
            _this.clear()
            _this.objects.render()
            _this.lastTickTime = currentTime
          }
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

    removeEvents: function () {
      this.keyboard.removeEvents()
    },

    clear: function() {
      this.ctx.clearRect(0, 0, this.width, this.height)
    },

    start: function() {
      this.addEvents()
      this.clear()
      this.isRunning = true
      this._startTimer()
      this.$starterBtn.text('Stop')
      this.$drawBtn.attr('disabled', true)
    },

    stop: function() {
      this.removeEvents()
      this.isRunning = false
      this._stopTimer()
      this.$starterBtn.text('Start')
      this.$drawBtn.attr('disabled', false)
    },

    reset: function () {
      this.stop()
      this.clear()
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

    fixPossibleCollision: function (obj) {
      var state = obj.state,
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
        // coefficient of restitution
        mom[0] = -(mom[0] * 0.65)
        fixed = true
      }

      if (hitTop || hitBottom) {
        pos[1] = hitTop ? ohh : (h - ohh)
        vel[1] = -vel[1]
        mom[1] = -(mom[1] * 0.65)
        fixed = true
      }

      return fixed
    },

    //---

    _startTimer: function() {
      var _this = this
      this.startTime = this.lastTickTime = (new Date()).getTime()
      this.gameTime = 0
      this.loop()
    },

    _stopTimer: function () {
      if (this.timer) { clearRequestInterval(this.timer) }
      this.timer = null
    },

    //---

    _addControls: function () {
      var $controlsDiv, $p, canvas, $drawBtn, $starterBtn, $resetBtn

      $controlsDiv = $('<div id="canvas-controls"></div>')

      $p = $('<p id="canvas-anim-controls"></p>')
      canvas = this
      $drawBtn = $('<button>Next frame</button>')
      $starterBtn = $('<button>Start</button>')
      $resetBtn = $('<button>Reset</button>')

      $drawBtn.on('click', function() {
        canvas.tick(true)
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

      $p
        .append($starterBtn)
        .append($drawBtn)
        .append($resetBtn)

      $controlsDiv.append($p)
      this.$wrapperElement.append($controlsDiv)

      this.$controlsDiv = $controlsDiv
      this.$drawBtn = $drawBtn
      this.$starterBtn = $starterBtn
      this.$resetBtn = $resetBtn
    },

    _addCanvas: function () {
      this.$canvasWrapperElement = $('<div id="canvas" class="canvas-wrapper"></div>')
        .css({
          width: this.width,
          height: this.height
        })
      this.$canvasElement = $('<canvas></canvas>')
        .attr({
          width: this.width,
          height: this.height
        })
      this.$canvasWrapperElement.append(this.$canvasElement)
      this.$wrapperElement.append(this.$canvasWrapperElement)
    }
  }
})

