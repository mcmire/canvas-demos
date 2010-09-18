var LOGGING = false;

Function.prototype.bind = function(self) {
  var func = this;
  return function() { func.call(self, arguments) }
}
function extend(tgt, src) {
  for (prop in src) tgt[prop] = src[prop];
}
Math.rand = function() {
  var min = 0, max = 0;
  if (arguments.length == 2) {
    min = arguments[0];
    max = arguments[1];
  } else {
    max = arguments[0];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function log(msg) {
  if (LOGGING) console.log(msg);
}

var Vector = function() {
  if (arguments.length > 0) {
    this.x = arguments[0];
    this.y = arguments[1];
  } else {
    this.x = 0;
    this.y = 0;
  }
}
$.extend(Vector, {
  add: function() {
    var vector = arguments[0];
    for (var i=1; i<arguments.length; i++) {
      var v = arguments[i];
      if (!(v instanceof Vector)) v = new Vector(v, v);
      vector.x += v.x;
      vector.y += v.y;
    }
    return vector;
  },
  subtract: function() {
    var vector = arguments[0];
    for (var i=1; i<arguments.length; i++) {
      var v = arguments[i];
      if (!(v instanceof Vector)) v = new Vector(v, v);
      vector.x -= v.x;
      vector.y -= v.y;
    }
    return vector;
  },
  multiply: function() {
    var vector = arguments[0];
    for (var i=1; i<arguments.length; i++) {
      var v = arguments[i];
      if (!(v instanceof Vector)) v = new Vector(v, v);
      vector.x *= v.x;
      vector.y *= v.y;
    }
    return vector;
  },
  divide: function() {
    var vector = arguments[0];
    for (var i=1; i<arguments.length; i++) {
      var v = arguments[i];
      if (!(v instanceof Vector)) v = new Vector(v, v);
      log("dividing " + vector.x + " by " + v.x)
      vector.x /= v.x;
      log("now vector.x is " + vector.x)
      log("dividing " + vector.y + " by " + v.y)
      vector.y /= v.y;
      log("now vector.x is " + vector.y)
    }
    return vector;
  }
})
$.extend(Vector.prototype, {
  toString: function() {
    return "(" + this.x + ", " + this.y + ")"
  }
})

var Boid = function(canvas, boidColl) {
  this.canvas = canvas;
  this.cxt = canvas.cxt;
  this.boidColl = boidColl;
  this.position = new Vector(
    Math.rand(this.canvas.canvasElement.width),
    Math.rand(this.canvas.canvasElement.height)
  );
  ///log("this.position: " + this.position);
  this.velocity = new Vector(Math.rand(-10, 10), Math.rand(-10, 10));
  ///log("this.velocity: " + this.velocity);
  this.size = {x: 3, y: 3};
}
$.extend(Boid.prototype, {
  draw: function() {
    var v1 = this.boidColl.rule1(this);
    log("v1: " + v1);
    //var v2 = this.boidColl.rule2(boid);
    //var v3 = this.boidColl.rule3(boid);
    this.velocity = Vector.add(this.velocity, v1);//, v2, v3);
    ///log("now this.velocity: " + this.velocity);
    this.position = Vector.add(this.position, this.velocity);
    ///log("now this.position: " + this.position);
    this.cxt.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
  }
})

var BoidCollection = function(canvas, length) {
  this.canvas = canvas;
  this.boids = [];
  for (var i=0; i<length; i++) this.boids.push(new Boid(canvas, this));
  this.length = length;
}
$.extend(BoidCollection.prototype, {
  each: function(func) {
    for (var i=0, len=this.boids.length; i<len; i++) func(this.boids[i]);
  },
  draw: function() {
    this.each(function(b) { b.draw() });
  },
  // Rule 1: Boids try to fly towards the centre of mass of neighbouring boids.
  // However, the 'centre of mass' is a property of the entire flock; it is not something that would
  // be considered by an individual boid. I prefer to move the boid toward its 'perceived centre', 
  // which is the centre of all the other boids, not including itself
  rule1: function(boid) {
    var center = new Vector();
    this.each(function(b) {
      if (b != boid) center = Vector.add(center, b.position);
    });
    log("dividing " + center + " by " + (this.length-1))
    center = Vector.divide(center, this.length - 1);
    log("now center is: " + center)
    return Vector.divide(Vector.subtract(center, boid.position), 100);
  }
})

var Canvas = function(id) {
  this.canvasElement = $(id)[0];
  this.cxt = this.canvasElement.getContext("2d");
  this.speed = 4;
  this.frameRate = 50;
  
  this.boidColl = new BoidCollection(this, 500);
}
$.extend(Canvas.prototype, {
  clear: function() {
    this.cxt.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    //this.canvasElement.width = this.canvasElement.width;
  },
  draw: function() {
    this.clear();
    this.boidColl.draw();
  },
  start: function() {
    this.timer = setInterval(this.draw.bind(this), this.frameRate);
  },
  stop: function() {
    clearInterval(this.timer);
    this.timer = null;
  },
  isRunning: function() {
    return !!this.timer;
  }
})

$(function() {
  var canvas = new Canvas("#canvas");
  $('#startstop').click(function() {
    if (canvas.isRunning()) {
      canvas.stop();
      $(this).html("Start");
    } else {
      canvas.start();
      $(this).html("Stop");
    }
    return false;
  });
  $('#draw').click(function() {
    canvas.draw();
    return false;
  })
})