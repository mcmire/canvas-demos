
'use strict'

var CanvasHelpers = {
  line: function(x1, y1, x2, y2, options) {
    var options
    options = $.v.extend({}, options, {
      origin: [ ((x2-x1)/2), ((y2-y1)/2) ],
      coords: [ [x1, y1], [x2, y2] ]
    })
    this.createShape(options, function(o) {
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
    this.createShape(options, function(o) {
      this.ctx.arc(o.origin[0], o.origin[1], radius, 0, 2*Math.PI)
    })
  },
  triangle: function(x, y, w, h, options) {
    var options
    options = $.v.extend({}, options, {
      origin: [x, y],
      coords: [[x, y]]
    })
    this.createShape(options, function(o) {
      this.ctx.moveTo(o.origin[0] - (w / 2), o.origin[1] - (h / 2))
      this.ctx.lineTo(o.origin[0] - (w / 2), o.origin[1] + (h / 2))
      this.ctx.lineTo(o.origin[0] + (w / 2), o.origin[1]          )
    })
  },
  // TODO: Apply transformation, and add createShape
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
  createShape: function(/* options, callback | callback */) {
    var args, sgra, callback, options, action, color

    args = Array.prototype.slice.call(arguments)
    sgra = args.reverse()
    callback = sgra[0], options = sgra[1]
    options = this.applyRotation(options || {})

    if (options.fill) { action = "fill"; color = options.fill }
    if (options.stroke) { action = "stroke"; color = options.stroke }
    if (color) this.ctx[action + "Style"] = color
    if (options.lineWidth) this.ctx.lineWidth = options.lineWidth

    if (options.rotate || options.translate) {
      this.withinState(function() {
        if (options.translate) this.ctx.translate.apply(this.ctx, options.translate)
        if (options.rotate) this.ctx.rotate(options.rotate)
        this.withinPath(callback, options)
      })
    } else {
      this.withinPath(callback, options)
    }

    if (action) this.ctx[action]()
  },
  applyRotation: function(args) {
    if (!args.rotate || args.translate) return args
    //var args = $.v.extend(true, {}, args); // deep copy
    $.v.each(args.coords, function(coord) {
      coord[0] -= args.origin[0]
      coord[1] -= args.origin[1]
    })
    args.translate = args.origin
    args.origin = [0, 0]
    return args
  }
}

