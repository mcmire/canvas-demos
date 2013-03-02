
window.domEventEmitter = (function () {
  var ev = {}

  ev.mixInto = function (obj, namespace) {
    function namespacedEventName(name) {
      return name + "." + namespace
    }

    var mixin = {}

    mixin.addEvents = function () {
      throw new Error('addEvents must be overridden')
    }

    mixin.removeEvents = function () {
      throw new Error('removeEvents must be overridden')
    }

    mixin.destroy = function () {
      this.removeEvents()
      this._super()
    }

    mixin.bindEvents = function (elem, events) {
      var _this = this
      $.v.each(events, function (name, handler) {
        var nameWithNs = namespacedEventName(name)
        $(elem).bind(nameWithNs, handler)
      })
    }

    mixin.unbindEvents = function (/* elem, names... */) {
      var _this = this,
          names = Array.prototype.slice(args),
          elem = names.shift()
      $.v.each(names, function (name) {
        var nameWithNs = namespacedEventName(name)
        $(elem).unbind(nameWithNs)
      })
    }

    mixin.triggerEvents = function (/* elem, names... */) {
      var _this = this,
          names = Array.prototype.slice(args),
          elem = names.shift()
      $.v.each(names, function (name) {
        var nameWithNs = namespacedEventName.call(this, name)
        $(elem).trigger(nameWithNs)
      })
    }

    $.v.extend(obj, mixin)
  }

  return ev
})()

