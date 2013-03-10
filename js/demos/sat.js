
'use strict';

(function() {
  var mouse, SATCanvas, Shape
  var canvas, objectCollection
  var anchorObject, activeObject

  mouse = {
    activeShape: null,
    findShapeAt: function (v) {
      return activeObject.coordsAreInside(v) && activeObject
    }
  }

  SATCanvas = P(Canvas, function (proto, uber) {
    proto.init = function () {
      uber.init.apply(this, arguments)
      this.$mouseDiv = $('<div class="mouse-info"></div>')
      this.$canvasWrapperElement.append(this.$mouseDiv)
    }

    proto.addEvents = function () {
      var _this = this,
          celem = this.$canvasElement[0],
          cpos = this.$canvasElement.offset()
      uber.addEvents.call(this)
      this.bindEvents(this.$canvasElement[0], {
        mousedown: function (evt) {
          var x = evt.pageX - cpos.left,
              y = evt.pageY - cpos.top,
              v = Vec2(x, y),
              shape
          mouse.downAt = v
          shape = mouse.activeShape = mouse.findShapeAt(v)
          if (shape) {
            mouse.offsetFromActiveShape = Vec2.nsub(shape.state.position, v)
          }
          // prevent i-beam cursor from appearing on drag
          evt.preventDefault()
        },

        mousemove: function (evt) {
          var x = evt.pageX - cpos.left,
              y = evt.pageY - cpos.top,
              v = Vec2(x, y)
          if (mouse.activeShape) {
            mouse.activeShape.state.position = Vec2.nadd(v, mouse.offsetFromActiveShape)
            // ... here we want to draw the SAT normal vector and all of the
            // guides and so forth ...
            _this.$canvasElement.attr('data-cursor', 'close-hand')
          } else if (mouse.findShapeAt(v)) {
            _this.$canvasElement.attr('data-cursor', 'open-hand')
          } else {
            _this.$canvasElement.attr('data-cursor', '')
          }
          _this.$mouseDiv.html("x: " + x + ", y: " + y)
          // prevent i-beam cursor from appearing on drag
          evt.preventDefault()
        },

        mouseup: function (evt) {
          mouse.activeShape = null
          // better safe than sorry
          evt.preventDefault()
        }
      })
    }

    proto.removeEvents = function () {
      var _this = this
      uber.removeEvents.call(this)
      this.unbindEvents(this.$canvasElement[0],
        'mousedown',
        'mousemove',
        'mouseup'
      )
    }
  })

  Shape = P(Polygon, function (proto) {
  })

  //---

  canvas = SATCanvas("#wrapper", {
    width: 1000,
    height: 400
  })
  objectCollection = canvas.buildObjectCollection(CanvasObjectCollection)
  anchorObject = objectCollection.addObject(Shape, {
    position: Vec2((canvas.width / 2) - 200, canvas.height / 2),
    vertices: [Vec2(-40,-80), Vec2(40,-80), Vec2(80,0), Vec2(0,80), Vec2(-80,0)],
    color: 'red',
    drawStyle: 'stroke',
    hasGravity: false
  })
  activeObject = objectCollection.addObject(Shape, {
    position: Vec2((canvas.width / 2) + 200, canvas.height / 2),
    vertices: [Vec2(0,-80), Vec2(80,80), Vec2(-80,80)],
    color: 'blue',
    drawStyle: 'stroke',
    hasGravity: false
  })
  activeObject.update = 

  window.canvas = canvas
})()

