(function() {
  var init = function() {
    window.DrawableCollection = Drawable.extend({
      init: function(canvas, number, klass, args) {
        this._super(canvas);
        this.drawables = [];
        if (arguments.length == 4) this.addMany(number, klass, args);
      },
      addMany: function(number, klass, args) {
        var isFunc = (typeof args == "function");
        for (var i=0; i<number; i++) {
          var fargs = isFunc ? args(i) : args;
          this.add(klass, fargs);
        }
      },
      create: function(klass, args) {
        var obj;
        if (arguments.length == 2) {
          var klass = arguments[0], args = arguments[1];
          // Ensure the drawable's parent is the collection
          args = [this].concat(args);
          obj = new klass.splat(args);
        } else {
          obj = arguments[0];
        }
        this.drawables.push(obj);
        return obj;
      },
      // Like create, but it doesn't return the object created
      add: function() {
        this.create.apply(this, arguments);
        return this;
      }
    })
  }
  require(["scripts/lib/drawable.js"], init);
})()