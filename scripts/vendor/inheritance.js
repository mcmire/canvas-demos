/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
//
// CHANGES FROM THE ORIGINAL:
// - Add classProperties
// - Add special logic for extending an array
// - Add a sort of multiple inheritance
//
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  function initArray() {
    // Accept an array or a list of values as the arguments
    var args = ($.isArray(arguments[0]) ? arguments[0] : arguments)
    var arr = [ ];
    arr.push.apply(arr, args);
    // This doesn't work in IE < 8 but I don't really care
    // Note that "this" refers to the prototype object defined below
    arr.__proto__ = this;
    return arr;
  }
  
  // Create a new Class that inherits from this class
  Class.extend = function(/*[mixins, ]instanceProperties[, classProperties]*/) {
    var mixins, instanceProperties, classProperties;
    if (arguments.length == 3) {
      mixins = arguments[0], instanceProperties = arguments[1], classProperties = arguments[2];
    } else {
      instanceProperties = arguments[0], classProperties = arguments[1];
    }
    
    var superclass = this;
    var _super = this.prototype;
    var prototype;
    
    // The dummy class constructor
    function Class() {
      if (initializing) return;
      if (this.init) {
        // All construction is actually done in the init method
        var ret = this.init.apply(this, arguments);
        // PATCH: Special logic for a subclass of Array
        if (superclass === Array) return ret;
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
        prototype[name] = mixin.prototype[name]
      }
    }
    
    // Copy the properties over onto the new prototype
    for (var name in instanceProperties) {
      // Check if we're overwriting an existing function
      if (
        (typeof instanceProperties[name] == "function") && 
        (typeof _super[name] == "function") &&
        fnTest.test(instanceProperties[name])
      ) {
        // Wrap the method with a function that sets _super(), runs the method, and unsets _super()
        prototype[name] = (function(name, fn) {
          return function() {
            var tmp = this._super;
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            var ret = fn.apply(this, arguments);
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
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
    if (this === Array) {
      if (prototype.init) {
        prototype.init = (function(fn) {
          return function() {            
            var tmp = this._super;
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            var arr = fn.apply(this, arguments);
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            this._super = tmp;
            return initArray.apply(this, arr);
            
            // var arr = initArray.apply(prototype, arguments);
            // this._super = _super[name];
            // fn.apply(arr, arguments);
            // return arr;
          }
        })(prototype.init);
      } else {
        prototype.init = initArray;
      }
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