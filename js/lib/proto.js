
'use strict';

// Sources of inspiration:
//
// * http://www.adobe.com/devnet/html5/articles/javascript-object-creation.html
// * https://github.com/jayferd/pjs
//
yorp.Proto = (function () {
  var util = yorp.util,
      Proto = {}

  Proto.__name__ = 'Proto'
  Proto.__mixins__ = {}

  // Define a prototype from one or more mixin objects.
  //
  // Returns a new object.
  //
  // mixins... - A optional varadic list of function or object. If a function,
  //             it is called with two arguments: the newly created clone object
  //             and the object from which it was cloned. You can either modify
  //             the clone object or return a new object which will be merged
  //             with the clone object. The function usage is superior as it
  //             lets you define private properties and functions if need be.
  //
  Proto.clone = Proto.cloneWith = function (/* mixins... */) {
    var mixins = Array.prototype.slice.call(arguments),
        idx
    if (mixins.length) {
      // Saying this:
      //
      //   obj1.clone(mixin1, mixin2, mixin3)
      //
      // is kind of like saying this:
      //
      //   obj1
      //     .clone().extend(mixin1)        //=> mixins = [mixin1]
      //       .clone().extend(mixin2)      //=> mixins = [mixin1, mixin2]
      //         .clone().extend(mixin3)    //=> mixins = [mixin1, mixin2, mixin3]
      //
      // except that our #extend method doesn't handle functions as we are
      // handling them here.
      //
      idx = 0
      return $.v.reduce(mixins, function (proto, mixin) {
        // Because we're making a clone of the previous proto, the final object
        // will never technically be a prototype of the last element in the
        // mixins array. It will, however, always be a prototype of `this`.
        var clone = Object.create(proto),
            ret
        clone.__mixins__ = util.dup(proto.__mixins__)
        if (typeof mixin === 'function') {
           mixin.call(clone, proto)
        } else {
          clone.extend(mixin)
          if (! '__name__' in mixin) {
            clone.__name__ = 'unknown object'
          }
        }
        idx++
        return clone
      }, this)
    } else {
      return Object.create(this)
    }
  }

  // Define a named prototype from one or more mixin objects.
  //
  // Returns a new object.
  //
  // name      - The String name of the prototype.
  // mixins... - A varadic list of function or object. If a function, it is
  //             called with two arguments: the newly created clone object and
  //             the object from which it was cloned. You can either modify the
  //             clone object or return a new object which will be merged with
  //             the clone object. The function usage is superior as it lets
  //             you define private properties and functions if need be.
  //
  Proto.cloneAs = function (/* name, mixins... */) {
    var name = arguments[0],
        mixins = Array.prototype.slice.call(arguments, 1)
    var clone = this.cloneWith.apply(this, mixins)
    clone.__name__ = name
    return clone
  }

  // Clone an object and then run its #init method. Any arguments given to this
  // method will be passed along to #init.
  //
  // Returns this same object for chaining purposes.
  //
  Proto.create = function () {
    var clone = this.clone()
    return clone.init.apply(clone, arguments)
  }

  // Merge an object into this object. If the given object is a child of Proto
  // then this method becomes a mixin routine and we add a check to ensure that
  // the object has not already been mixed into this one.
  //
  // Note that you cannot use this method to override methods; instead you must
  // create a new object via #clone.
  //
  // obj - A clone of yorp.Proto, or a POJO.
  //
  // Returns this same object for chaining purposes.
  //
  Proto.extend = function (obj) {
    var isProtoChild = yorp.Proto.isPrototypeOf(obj),
        key
    if (isProtoChild && obj.__name__ in this.__mixins__) {
      return
    }
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        this[key] = obj[key]
      }
    }
    if (isProtoChild) {
      this.__mixins__[obj.__name__] = 1
    }
    return this
  }

  // Determine whether this object is a clone of the given object (direct or
  // otherwise). You must use this rather than Object#isPrototypeOf when
  // working with Proto objects, as #isPrototypeOf may not return true when you
  // expect it to due to how #clone works (see that for details).
  //
  // obj - A clone of yorp.Proto.
  //
  // Returns true or false.
  //
  Proto.isAncestorOf = function (obj) {
    return (
      this.isPrototypeOf(obj) || (
        yorp.Proto.isPrototypeOf(obj) &&
        this.__name__ in obj.__mixins__
      )
    )
  }

  // Like #isAncestorOf, except this is used to determine whether the given
  // object is a clone of this object (direct or otherwise).
  //
  // obj - A clone of yorp.Proto.
  //
  // Returns true or false.
  //
  Proto.isDescendantOf = function (obj) {
    return (
      obj.isPrototypeOf(this) ||
      obj.__name__ in this.__mixins__
    )
  }

  // Initialize an instance (clone) of this object.
  //
  // Do not override this method when configuring your prototype; instead,
  // override #_setup.
  //
  Proto.init = function () {
    this._setup.apply(this, arguments)
    return this
  }

  // Destroy an instance (clone) of this object.
  //
  // Do not override this method when configuring your prototype; instead,
  // override #_teardown.
  //
  Proto.destroy = function () {
    this._teardown.apply(this, arguments)
    return this
  }

  // Private: Override this method to initialize an instance of this object.
  // For instance, you could set properties required for this object to function
  // completely.
  //
  Proto._setup = function () {
  }

  // Private: Override this method to destroy an instance of this object.
  // For instance, you could free memory by unsetting large properties.
  //
  Proto._teardown = function () {
  }

  return Proto
})()

