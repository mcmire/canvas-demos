
'use strict';

yorp.def('DOMEventEmitter', function (proto) {
  function namespacedEventName(name) {
    return [name, this.__name__].join('.')
  }

  this.addEvents = function () {
    throw new Error('DOMEventEmitter#addEvents needs to be overridden')
  }

  this.removeEvents = function () {
    throw new Error('DOMEventEmitter#removeEvents needs to be overridden')
  }

  this.destroy = function () {
    this.removeEvents()
    this.proto.destroy.call(this)
  }

  this.bindEvents = function (elem, events) {
    var _this = this
    $.v.each(events, function (name, handler) {
      var nameWithNs = namespacedEventName.call(_this, name)
      $(elem).bind(nameWithNs, handler)
    })
  }

  this.unbindEvents = function (/* elem, names... */) {
    var _this = this,
        names = Array.prototype.slice.call(arguments),
        elem = names.shift()
    $.v.each(names, function (name) {
      var nameWithNs = namespacedEventName.call(_this, name)
      $(elem).unbind(nameWithNs)
    })
  }

  this.triggerEvents = function (/* elem, names... */) {
    var _this = this,
        names = Array.prototype.slice.call(arguments),
        elem = names.shift()
    $.v.each(names, function (name) {
      var nameWithNs = namespacedEventName.call(_this, name)
      $(elem).trigger(nameWithNs)
    })
  }
})

