/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
//
// CHANGES FROM THE ORIGINAL:
// - Add classProperties
// - Add special logic for extending an array
//   (Inspired by http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/)
// - Add a sort of multiple inheritance
//
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  function initArray(proto) {
    var arr = [ ];
    // This doesn't work in IE < 8 but I don't really care
    arr.__proto__ = proto;
    //arr.constructor = Array;
    return arr;
  }
  
  // Create a new Class that inherits from this class
  Class.extend = function(/*[mixins, ]instanceProperties[, classProperties]*/) {
    var mixins, instanceProperties, classProperties;
    if ($.isArray(arguments[0])) {
      mixins = arguments[0], instanceProperties = arguments[1], classProperties = arguments[2];
    } else {
      instanceProperties = arguments[0], classProperties = arguments[1];
    }
    
    var superclass = this;
    var _super = this.prototype;
    var prototype;
    
    var subclassingArray = (this === Array);
    
    // The dummy class constructor
    function Class() {
      if (initializing) return;
      if (this.init) {
        // PATCH: Special logic for a subclass of Array
        if (subclassingArray) {
          // Set the context for all future interaction with the object we are building,
          // which is an array instead of a direct instance of the class we have just created
          // (its prototype is the prototype we built when building the class, though, so it works out).
          var ret = initArray(Class.prototype); // Class.prototype or this?
          // All construction is actually done in the init method
          this.init.apply(ret, arguments);
          return ret;
        } else {
          // All construction is actually done in the init method
          this.init.apply(this, arguments);
        }
      }
    }
    // PATCH: Add classProperties
    if (classProperties) {
      for (var name in classProperties) Class[name] = classProperties[name];
    }
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    prototype = new this();
    initializing = false;
    
    // PATCH: Copy the prototypes of the given mixins onto the new prototype
    // Note that "instanceof" will always point to the main subclass, never any mixins
    // Also, there isn't a way to access any of these mixins via _super, you'll have to do that yourself.
    for (var i=0; i<mixins; i++) {
      var mixin = mixins[i];
      for (var name in mixin.prototype) {
        if (name != "init" && mixin.prototype.hasOwnProperty(name)) prototype[name] = mixin.prototype[name];
      }
    }
    
    // Copy the properties over onto the new prototype
    for (var name in instanceProperties) {
      // Check if we're overwriting an existing function
      // Note that for Array, we will be overriding the 'init' function which is defined at the bottom
      if (
        (typeof instanceProperties[name] == "function") && 
        (typeof _super[name] == "function") &&
        fnTest.test(instanceProperties[name])
      ) {
        //
        // Wrap the method with a function that sets _super(), runs the method, and unsets _super().
        //
        // In effect, if we have something like this:
        //
        //   Subclass = Superclass.extend({
        //     zing: function(foo, bar) {
        //       this._super(foo);
        //       this.bar = bar;
        //     }
        //   })
        //
        // it will turn into this...
        //
        //   Subclass.prototype.zing = function(foo, bar) {
        //     var tmp = this._super;
        //     this._super = Superclass.prototype.zing;
        //     this.bar = bar;
        //     this._super = tmp;
        //   }
        //
        prototype[name] = (function(name, fn) {
          return function() {
            var tmp = this._super;
            // Remember that _super here refers to the class being extended's prototype
            this._super = _super[name];
            var ret = fn.apply(this, arguments);
            this._super = tmp;
            return ret;
          };
        })(name, instanceProperties[name]);
      }
      else {
        prototype[name] = instanceProperties[name];
      }
    }
    
    // PATCH: Add special logic for extending an array
    // http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/
    /*
    if (this === Array) {
      if (prototype.init) {
        //
        // Wrap the 'init' function as defined on the prototype above
        // in another function that initializes an array and uses that 
        // as the context for the above 'init' function.
        //
        // In effect, if we have something that looks like this...
        //
        //   ArraySubclass = Array.extend({
        //     init: function(foo, args) {
        //       this._super(args);
        //       this.foo = foo;
        //     }
        //   })
        //
        // it will turn into this...
        //
        //   function ArraySubclass() {
        //     arr = initArray.call(this);
        //     arr = Array.prototype.init.apply(arr, arguments);
        //     arr.foo = foo;
        //     return arr;
        //   }
        //
        prototype.init = (function(fn) {
          return function() {
            //var arr = initArray.call(this);
            fn.apply(this, arguments);
            return this;
          }
        })(prototype.init);
      } else {
    */
      if (subclassingArray && !prototype.init) {
        prototype.init = function() {
          //var arr = initArray.call(this);
          Array.prototype.init.apply(this, arguments);
          return this;
        }
      }
    /*
      }
    }
    */
    
    if (subclassingArray) {
      // Wrap slice in a function that ensures we return a Vector
      prototype.slice = (function(fn, klass) {
        return function() {
          var ret = fn.apply(this, arguments);
          return new klass(ret);
        }
      })(Array.prototype.slice, Class)
    }
    
    // PATCH: Add a way to access private members
    // http://webreflection.blogspot.com/2008/04/natural-javascript-private-methods.html
    prototype._ = function(callback) {
      var self = this;
      return function() {
        return callback.apply(self, arguments);
      };
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    // PATCH: Class.constructor -> prototype.constructor
    prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();

// PATCH: Make it possible to extend an Array too
Array.extend = Class.extend;
Array.prototype.init = function() {
  // Accept an array or a list of values as the arguments
  // XXX: Performance issue?
  var args = _.flatten(arguments);
  this.push.apply(this, args);
  return this;
}