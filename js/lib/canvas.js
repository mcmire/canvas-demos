
'use strict';

// TODO: Split this out into a main class
yorp.def('Canvas', yorp.DOMEventEmitter, function (proto) {
  var Vec2 = yorp.Vec2,
      keyboard = yorp.keyboard

  this._setup = function(id, options) {
    var options

    this.$wrapperElement = $(id)
    this.options = options = options || {}

    this.ticksPerSecond =
      ('ticksPerSecond' in options) ? options.ticksPerSecond : 60
    this.speedFactor =
      ('speedFactor' in options) ? options.speedFactor : 1
    this.dimensions = ('dimensions' in options) ?
      {width: options.dimensions.width, height: options.dimensions.height} :
      {width: 800, height: 500}

    this._addControls()
    this._addCanvas()

    this.ctx = this.$canvasElement[0].getContext('2d')
    this.secondsPerTick = 1 / this.ticksPerSecond

    keyboard.init()

    ;(function (_this) {
      var timeStep, speedFactor, loop, tick

      timeStep = _this.secondsPerTick
      speedFactor = _this.speedFactor

      loop = function () {
        tick()
        if (_this.isRunning) {
          _this.timer = requestAnimFrame(loop)
        }
      }

      tick = function (isForOneFrame) {
        //console.log('tick')
        var currentTime, tickTime, updateTime, deltaTime
        if (isForOneFrame) {
          _this.objects.update(5)
          _this.clear()
          _this.objects.render()
        }
        else {
          // http://gafferongames.com/game-physics/fix-your-timestep/
          currentTime = (new Date()).getTime()
          //tickTime = currentTime - _this.lastTickTime
          updateTime = currentTime - _this.lastUpdateTime
          //while (tickTime > 0) {
          if (updateTime >= timeStep * 1000) {
            //deltaTime = Math.min(tickTime, timeStep)
            deltaTime = updateTime
            _this.objects.update(deltaTime * speedFactor)
            //tickTime -= deltaTime
            //_this.gameTime += deltaTime
            _this.lastUpdateTime = currentTime
          }
          _this.clear()
          _this.objects.render()
          //_this.lastTickTime = currentTime
        }
      }

      _this.loop = loop
      _this.tick = tick
    })(this)
  }

  this.buildObjectCollection = function (proto) {
    var objects
    objects = proto.create(this)
    this.objects = objects
    return objects
  }

  this.addEvents = function () {
    keyboard.addEvents()
  }

  this.removeEvents = function () {
    keyboard.removeEvents()
  }

  this.clear = function() {
    this.ctx.clearRect(0, 0, this.dimensions.width, this.dimensions.height)
  }

  this.start = function() {
    this.addEvents()
    this.clear()
    this.isRunning = true
    this._startTimer()
    this.$starterBtn.text('Stop')
    this.$drawBtn.attr('disabled', true)
  }

  this.stop = function() {
    this.removeEvents()
    this.isRunning = false
    this._stopTimer()
    this.$starterBtn.text('Start')
    this.$drawBtn.attr('disabled', false)
  }

  this.reset = function () {
    this.stop()
    this.clear()
  }

  this.randomPos = function(bx, by) {
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
      util.rand.int(this.dimensions.width - bx),
      util.rand.int(this.dimensions.height - by)
    )
  }

  this.center = function() {
    return Vec2(
      Math.floor(this.dimensions.width / 2),
      Math.floor(this.dimensions.height / 2)
    )
  }

  this.fixPossibleCollision = function (obj) {
    var state = obj.state,
        mom = state.momentum,
        vel = state.velocity,
        bounds = obj.bounds,
        w = this.dimensions.width,
        h = this.dimensions.height,
        ohw = Math.ceil(obj.dimensions.width / 2),
        ohh = Math.ceil(obj.dimensions.height / 2),
        leftEdge = bounds[0] - ohw,
        rightEdge = bounds[0] + ohw,
        topEdge = bounds[1] - ohh,
        bottomEdge = bounds[1] + ohh,
        hitLeft = (leftEdge <= 0),
        hitRight = (rightEdge >= w),
        hitTop = (topEdge <= 0),
        hitBottom = (bottomEdge >= h),
        fixed = false

    /*
    if (hitLeft) {
      vn = $.v.find(obj.vertices, function (v) { v[0] < 0 })
      n = Vec2.dot(vn, Vec2(-1, 0))
    }
    */

    if (hitLeft || hitRight) {
      pos[0] = hitLeft ? ohw : w - ohw
      vel[0] = -vel[0]
      // coefficient of restitution
      mom[0] = -(mom[0] * 0.65)
      fixed = true
    }

    if (hitTop || hitBottom) {
      pos[1] = hitTop ? ohh : h - ohh
      vel[1] = -vel[1]
      mom[1] = -(mom[1] * 0.65)
      fixed = true
    }

    return fixed
  }

  //---

  this._startTimer = function() {
    var _this = this
    this.startTime = this.lastTickTime = this.lastUpdateTime = (new Date()).getTime()
    this.gameTime = 0
    this.loop()
  }

  this._stopTimer = function () {
    if (this.timer) { clearRequestInterval(this.timer) }
    this.timer = null
  }

  //---

  this._addControls = function () {
    var $controlsDiv, $para, canvas, $drawBtn, $starterBtn, $resetBtn

    $controlsDiv = $('<div id="canvas-controls"></div>')

    $para = $('<p id="canvas-anim-controls"></p>')
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

    $para
      .append($starterBtn)
      .append($drawBtn)
      .append($resetBtn)

    $controlsDiv.append($para)
    this.$wrapperElement.append($controlsDiv)

    this.$controlsDiv = $controlsDiv
    this.$drawBtn = $drawBtn
    this.$starterBtn = $starterBtn
    this.$resetBtn = $resetBtn
  }

  this._addCanvas = function () {
    this.$canvasWrapperElement = $('<div id="canvas" class="canvas-wrapper"></div>')
      .css(this.dimensions)
    this.$canvasElement = $('<canvas></canvas>')
      .attr(this.dimensions)
    this.$canvasWrapperElement.append(this.$canvasElement)
    this.$wrapperElement.append(this.$canvasWrapperElement)
  }
})

