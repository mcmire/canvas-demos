(function() {
  var init;
  init = function() {
    var Boid, BoidsCanvas;
    BoidsCanvas = Canvas.extend;
    return (Boid = Shape.extend({
      setOptions: function(options) {
        this._super(options);
        this.index = options.index;
        return null;
      },
      width: function() {
        return this.options.width;
      }
    }));
  };
}).call(this);
