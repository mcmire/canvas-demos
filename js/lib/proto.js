
'use strict';

// Sources of inspiration:
//
// * http://www.adobe.com/devnet/html5/articles/javascript-object-creation.html
// * https://github.com/jayferd/pjs
//
yorp.Proto = (function () {
  var Proto = {}

  // Define a prototype from one or more prototypes.
  //
  // Returns a new object.
  //
  // protos... - A optional varadic list of function or object. If a function,
  //             it is called with two arguments: the newly created clone object
  //             and the object from which it was cloned. You can either modify
  //             the clone object or return a new object which will be merged
  //             with the clone object. The function usage is superior as it
  //             lets you define private properties and functions if need be.
  //
  Proto.clone = Proto.cloneWith = function (/* protos... */) {
    var protos = Array.prototype.slice.call(arguments)
    if (protos.length) {
      return $.v.reduce(protos, function (proto, mixin) {
        var clone = Object.create(proto),
            ret
        if (typeof mixin === 'function') {
          ret = mixin.call(clone, proto)
          if (typeof ret !== 'undefined') {
            clone.extend(ret)
          }
        } else {
          clone.extend(mixin)
        }
        return clone
      }, this)
    } else {
      return Object.create(this)
    }
  }

  // Define a named prototype from one or more prototypes.
  //
  // Returns a new object.
  //
  // name      - The String name of the prototype.
  // protos... - A varadic list of function or object. If a function, it is
  //             called with two arguments: the newly created clone object and
  //             the object from which it was cloned. You can either modify the
  //             clone object or return a new object which will be merged with
  //             the clone object. The function usage is superior as it lets
  //             you define private properties and functions if need be.
  //
  Proto.cloneAs = function (/* name, protos ... */) {
    var name = arguments[0],
        protos = Array.prototype.slice.call(arguments, 1)
    var clone = this.cloneWith.apply(this, protos)
    clone.__name__ = name
    return clone
  }

  // Clone an object and then run its #init method.
  //
  Proto.create = function () {
    var clone = this.clone()
    return clone.init.apply(clone, arguments)
  }

  // Merge an object into this object.
  //
  // Note that you cannot use this method to override methods or mix in modules;
  // instead you must create a new object via #cloneWith.
  //
  Proto.extend = function (props) {
    var prop
    for (prop in props) {
      if (props.hasOwnProperty(prop)) {
        this[prop] = props[prop]
      }
    }
  }

  // Initialize an instance (clone) of this object.
  //
  // Do not override this method; instance, override #_setup.
  //
  Proto.init = function () {
    this._setup.apply(this, arguments)
    return this
  }

  // Destroy an instance (clone) of this object.
  //
  // Do not override this method; instance, override #_teardown.
  //
  Proto.destroy = function () {
    this._teardown.apply(this, arguments)
    return this
  }

  // Private: Override this method to initialize an instance of this object.
  // Perhaps you could set properties required for this object to function
  // completely.
  //
  Proto._setup = function () {
    throw "Proto#_setup must be overridden"
  }

  // Private: Override this method to destroy an instance of this object.
  // Perhaps you could free memory by unsetting large properties.
  //
  Proto._teardown = function () {
    throw "Proto#_teardown must be overridden"
  }

  return Proto
})()

