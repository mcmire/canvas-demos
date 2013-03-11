
'use strict';

yorp.def('Drawable', function (proto) {
  var Canvas = yorp.Canvas

  this._setup = function (parent) {
    if (parent) { this.setParent(parent) }
  }

  this.setParent = function (parent) {
    this.parent = parent
    this.canvas = ('canvas' in parent) ? parent.canvas : parent
    this.ctx = this.canvas.ctx
  }

  this.update = function (tickElapsedTime, timeStep) {
    throw new Error('Drawable#update needs to be overridden')
  }

  this.render = function (timeStep) {
    throw new Error('Drawable#render needs to be overridden')
  }
})
