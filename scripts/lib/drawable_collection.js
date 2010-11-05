var DrawableCollection = Array.extend([Drawable], {
  init: function(canvas, number, klass, args) {
    this._super(args || []);
    Drawable.prototype.init.call(this, canvas);
    if (arguments.length == 4) this.addMany(number, klass, args);
    return args;
  },
  redraw: function() {
    _(this).chain().
      select(function(obj) { return obj.drawable }).
      each(function(obj) { obj.redraw() });
  },
  add: function() {
    this.create.apply(this, arguments);
    return this;
  },
  addMany: function(number, klass, args) {
    var isFunc = $.isFunction(args);
    for (var i=0; i<number; i++) {
      var fargs = isFunc ? args(i) : args;
      this.add(klass, fargs);
    }
  },
  // Like add, but returns the object added
  create: function(klass, args) {
    // This assumes that the klass's first argument is a 'parent' value
    var args = args ? [this].concat(args) : [this];
    var obj = Function.splat(klass, args);
    this.push(obj);
    return obj;
  }
})