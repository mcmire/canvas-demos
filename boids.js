var LOGGING = true;

Function.prototype.bind = function(self) {
  var func = this;
  return function() { func.call(self, arguments) }
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

var Vector = {};
Vector.operators = [
  {name: "add",      code: "+",        factory: "accum", type: "arithmetic"},
  {name: "subtract", code: "-",        factory: "accum", type: "arithmetic"},
  {name: "multiply", code: "*",        factory: "accum", type: "arithmetic"},
  {name: "divide",   code: "/",        factory: "accum", type: "arithmetic"},
  {name: "gt",       code: ">",        factory: "accum", type: "boolean"},
  {name: "lt",       code: "<",        factory: "accum", type: "boolean"},
  {name: "gte",      code: ">=",       factory: "accum", type: "boolean"},
  {name: "lte",      code: "<=",       factory: "accum", type: "boolean"},
  {name: "eq",       code: "==",       factory: "accum", type: "boolean"},
  {name: "abs",      code: "Math.abs", factory: "map",   type: "arithmetic"}
];
Vector.coerce = function(arg, numAxes) {
  if (arg instanceof Array) {
    return arg;
  } else {
    var arr = [];
    for (var i=0; i<numAxes; i++) arr.push(arg);
    return arr;
  }
}
Vector.functionFactories = {
  accum: function(op) {
    var code = "vector[j] = vector[j] "+op.code+" v[j]";
    return function() {
      var vector = Vector.coerce(arguments[0], 2).slice(0); // dupe the array
      for (var i=1; i<arguments.length; i++) {
        var v = Vector.coerce(arguments[i], 2);
        for (var j=0; j<v.length; j++) eval(code);
      }
      if (op.type == "boolean") {
        var ret = true;
        for (var i=0; i<vector.length; i++) ret = ret && vector[i];
        return ret;
      } else {
        return vector;
      }
    }
  },
  map: function(op) {
    var code = "vector[i] = "+op.code+"(vector[i])";
    return function(vector) {
      var vector = vector.slice(0); // dupe the array
      for (var i=0; i<vector.length; i++) eval(code);
      return vector;
    }
  }
}
for (var i=0; i<Vector.operators.length; i++) {
  var op = Vector.operators[i];
  Vector[op.name] = Vector.functionFactories[op.factory](op);
}

var Boid = function(boidColl) {
  this.boidColl = boidColl;
  this.canvas = boidColl.canvas;
  this.cxt = boidColl.cxt;
  this.position = [
    Math.rand(this.canvas.canvasElement.width),
    Math.rand(this.canvas.canvasElement.height)
  ];
  this.velocity = [Math.rand(-10, 10), Math.rand(-10, 10)];
}
Boid.size = [3, 3];
$.extend(Boid.prototype, {
  draw: function() {
    var rule1 = this.boidColl.rule1(this);
    var rule2 = this.boidColl.rule2(this);
    //var rule3 = this.boidColl.rule3(this);
    var boundRepulsion = this.boidColl.keepWithinBounds(this);
    this.velocity = Vector.add(this.velocity, rule1, rule2, boundRepulsion);
    this.position = Vector.add(this.position, this.velocity);
    this.cxt.fillRect(this.position[0], this.position[1], Boid.size[0], Boid.size[1]);
  }
})

var BoidCollection = function(canvas, length) {
  this.canvas = canvas;
  this.cxt = canvas.cxt;
  this.boids = [];
  for (var i=0; i<length; i++) this.boids.push(new Boid(this));
}
$.extend(BoidCollection.prototype, {
  draw: function() {
    for (var i=0; i<this.boids.length; i++) this.boids[i].draw();
  },
  // Rule 1: Boids try to fly towards the centre of mass of neighbouring boids.
  // However, the 'centre of mass' is a property of the entire flock; it is not something that would
  // be considered by an individual boid. I prefer to move the boid toward its 'perceived centre', 
  // which is the centre of all the other boids, not including itself
  rule1: function(boid) {
    var center = [0, 0];
    for (var i=0; i<this.boids.length; i++) {
      var b = this.boids[i];
      if (b == boid) continue;
      center = Vector.add(center, b.position);
    }
    center = Vector.divide(center, this.boids.length - 1);
    /*
    //this.cxt.save();
      this.cxt.moveTo(boid.position[0], boid.position[1]);
      this.cxt.lineTo(center[0], center[1]);
      //this.cxt.strokeStyle = '#ff0000';
      this.cxt.stroke();
    //this.cxt.restore();
    */
    var distance = Vector.subtract(center, boid.position)
    var vector = Vector.divide(distance, 100);
    return vector;
  },
  // Rule 2: Boids try to keep a small distance away from other objects (including other boids).
  // The purpose of this rule is to for boids to make sure they don't collide into each other. I
  // simply look at each boid, and if it's within a defined small distance of
  // another boid move it as far away again as it already is. 
  rule2: function(boid) {
    var center = [0, 0];
    var range = 2;
    for (var i=0; i<this.boids.length; i++) {
      var b = this.boids[i];
      if (b == boid) continue;
      var diff = Vector.subtract(b.position, boid.position)
      var dist = Vector.abs(diff);
      var withinRange = Vector.lt(dist, range)
      if (withinRange) center = Vector.subtract(center, diff);
    }
    return center;
  },
  keepWithinBounds: function(boid) {
    var xmin = 0,
        ymin = 0,
        xmax = this.canvas.canvasElement.width,
        ymax = this.canvas.canvasElement.height;
    var v = [0, 0];
    var force = 0.3;
    
    if (boid.position[0] < xmin) v[0] = force;
    else if (boid.position[0] > xmax) v[0] = -force;
    
    if (boid.position[1] < ymin) v[1] = force;
    else if (boid.position[1] > ymax) v[1] = -force;
    
    return v;
  }
})

var Canvas = function(id) {
  this.canvasElement = $(id)[0];
  this.cxt = this.canvasElement.getContext("2d");
  this.speed = 4;
  this.frameRate = 50;
  
  this.boidColl = new BoidCollection(this, 100);
}
$.extend(Canvas.prototype, {
  clear: function() {
    this.cxt.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    //this.canvasElement.width = this.canvasElement.width;
    //log("Clearing the canvas, width is " + this.canvasElement.width + ", height is " + this.canvasElement.height);
  },
  draw: function() {
    this.clear();
    var self = this;
    self.boidColl.draw()
    //setTimeout(function() {  }, 500);
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