
'use strict';

yorp.Canvas.extend({
  line: function(x1, y1, x2, y2, options) {
    var options
    options = $.v.extend({}, options, {
      origin: [ ((x2-x1)/2), ((y2-y1)/2) ],
      coords: [ [x1, y1], [x2, y2] ]
    })
    this.configurePath(options, function(o) {
      this.ctx.moveTo(o.coords[0][0], o.coords[0][1])
      this.ctx.lineTo(o.coords[1][0], o.coords[1][1])
    })
  },

  circle: function(x, y, radius, options) {
    var options
    options = $.v.extend({}, options, {
      origin: [x, y],
      coords: [[x, y]]
    })
    this.configurePath(options, function(o) {
      this.ctx.arc(o.origin[0], o.origin[1], radius, 0, 2*Math.PI)
    })
  },

  rect: function (x, y, w, h, options) {
    this.withinState(function () {
      this.ctx.translate(x, y)
      if (options.rotate) { this.ctx.rotate(options.rotate) }
      this.withinPath(function () {
        this.ctx.moveTo(-w/2, -h/2)
        this.ctx.lineTo(w/2, -h/2)
        this.ctx.lineTo(w/2, h/2)
        this.ctx.lineTo(-w/2, h/2)
        this.ctx.lineTo(-w/2, -h/2)
      })
      if (options.fill) {
        this.ctx.fillStyle = options.fill
        this.ctx.fill()
      }
      if (options.stroke) {
        this.ctx.strokeStyle = options.stroke
        this.ctx.stroke()
      }
    })
  },

  triangle: function(x, y, w, h, options) {
    this.withinState(function () {
      this.ctx.translate(x, y)
      if (options.rotate) { this.ctx.rotate(options.rotate) }
      this.withinPath(function () {
        // point to the right
        this.ctx.moveTo(-(w / 2), -(h / 2))
        this.ctx.lineTo(-(w / 2), (h / 2))
        this.ctx.lineTo((w / 2), 0)
      })
      if (options.fill) {
        this.ctx.fillStyle = options.fill
        this.ctx.fill()
      }
    })
  },

  polygon: function (pos, verts, options) {
    var drawStyle = options.drawStyle || 'fill'
    var color = options.color || 'black'
    verts = verts.concat([verts[0]])
    this.withinState(function () {
      this.ctx.translate(pos[0], pos[1])
      if (options.rotate) { this.ctx.rotate(options.rotate) }
      this.withinPath(function () {
        var i, len, method
        for (i = 0, len = verts.length; i < len; i++) {
          method = (i === 0) ? 'moveTo' : 'lineTo'
          this.ctx[method](verts[i][0], verts[i][1])
        }
      })
      this.ctx[drawStyle + 'Style'] = color
      this.ctx[drawStyle]()
    })
  },

  // TODO: Apply transformation, and add configurePath
  arrow: function(p1, p2) {
    var dy, dx, f, sdy, sdx
    dy = p2[1] - p1[1]
    dx = p1[1] - p1[0]
    f = 0.01
    sdy = -dx - 1
    sdx = f * dy
    this.ctx.moveTo(p1[0]-sdx, p1[1]-sdy)
    this.ctx.lineTo(p1[0]+sdx, p1[1]+sdy)
    this.ctx.lineTo(p2[0]+sdx, p2[1]+sdy)
    this.ctx.lineTo(p2[0]+(sdx*2), p2[1]+(sdy*2))
    this.ctx.lineTo(p2[0]-(dx*2), p2[1]+(dy*2))
    this.ctx.lineTo(p2[0]-(sdx*2), p2[1]-(sdy*2))
    this.ctx.lineTo(p2[0]-sdx, p2[1]-sdy)
  },

  withinState: function(callback) {
    this.ctx.save()
    callback.call(this)
    this.ctx.restore()
  },

  withinPath: function(callback, options) {
    this.ctx.beginPath()
    callback.call(this, options)
    this.ctx.closePath()
  },

  configurePath: function(/* options, callback | callback */) {
    var args, callback, options, action, color

    args = Array.prototype.slice.call(arguments)
    args.reverse()
    callback = args[0], options = args[1]
    if (!options) options = {}
    options = this.applyRotation(options)

    if (options.fill) { action = "fill"; color = options.fill }
    if (options.stroke) { action = "stroke"; color = options.stroke }
    if (color) this.ctx[action + "Style"] = color
    if (options.lineWidth) this.ctx.lineWidth = options.lineWidth

    this.configureShape(options, callback)

    if (action) this.ctx[action]()
  },

  configureShape: function (options, callback) {
    if (options.rotate || options.translate) {
      this.withinState(function() {
        if (options.translate) {
          this.ctx.translate.apply(this.ctx, options.translate)
        }
        if (options.rotate != null) {
          this.ctx.rotate(options.rotate)
        }
        this.withinPath(callback, options)
      })
    } else {
      this.withinPath(callback, options)
    }
  },

  applyRotation: function(/* options, callback | callback */) {
    var args, callback, options, i, len, coord
    args = Array.prototype.slice.call(arguments)
    args.reverse()
    callback = args[0], options = args[1]
    if (!options) options = {}

    // Both rotate and translate cannot be given
    if (!options.rotate || options.translate) return options

    for (i = 0, len = options.coords.length; i < len; i++) {
      options.coords[i][0] -= options.origin[0]
      options.coords[i][1] -= options.origin[1]
    }
    options.translate = options.origin
    options.origin = [0, 0]
    return options
  }
})

