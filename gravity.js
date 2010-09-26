function clearDebug() {
  $('#debug').html("");
}
function debug(msg) {
  return;
  $('#debug').html($('#debug').html() + "<p>"+msg+"</p>");
}

var Ball = Class.extend({
  init: function(canvas, options) {
    this.canvas = canvas;
    this.cxt = canvas.cxt;
    this.mass = options.mass;
    this.radius = options.radius;
    this.pos = options.pos || this.canvas.randomPos(this.radius * 4);
    this.vel = [0, 0];
    //this.speed = options.speed || 10;
    //this.vel = options.vel || this.canvas.randomVel(this.speed);
    this.forceDirection = (options.type == "repulsive") ? -1 : 1;
    this.color = options.color || "black";
  },
  draw: function() {
    var vectors = this.canvas.objectGravity(this);
    this.pos = vectors[0];
    this.vel = vectors[1];
    
    //var vectors = this.canvas.collision(this);
    //this.pos = vectors[0];
    //this.vel = vectors[1];
    
    //console.log("Position: " + this.pos)
    
    this.drawCircle();
  },
  drawCircle: function() {
    this.cxt.save();
    this.cxt.fillStyle = this.color;
    this.cxt.beginPath();
    this.cxt.arc(this.pos[0], this.pos[1], this.radius, 0, 2*Math.PI);
    this.cxt.closePath();
    this.cxt.fill();
    this.cxt.restore();
  },
  bounds: function(pos) { // x1, x2, y1, y2
    var pos = pos || this.pos;
    return [
      [pos[0] - this.radius, pos[0] + this.radius],
      [pos[1] - this.radius, pos[1] + this.radius]
    ]
  },
  // FAIL: If this mass is smaller, then the gforce is smaller
  // Is that supposed to happen?
  gravityForce: function(ball2) {
    var G = 6.67428 * Math.pow(10, -11)
    var r = Vector.distance(this.pos, ball2.pos);
    var F = this.forceDirection * G * (this.mass * ball2.mass) / Math.pow(r, 2);
    // http://www.richardsimoes.com/gravity.html
    var Fx = (this.pos[0] - ball2.pos[0]) / r * F;
    var Fy = (this.pos[1] - ball2.pos[1]) / r * F;
    return [Fx, Fy];
  }
})
Ball.generate = function(canvas, options) {
  var options = $.extend({
    radius: Math.rand(5, 10),
    mass: Math.rand(1, 4) * Math.pow(10, 6)
  }, options);
  return new this(canvas, options);
}

/*
var BallCollection = {};
BallCollection.create = function(canvas) {
  var collection = [];
  collection.add = function(options) {
    this.push(new Ball(canvas, options));
  }
  return collection;
}
*/

var GravityCanvas = Canvas.extend({
  init: function(id) {
    this._super(id);
    this.frameRate = 20;
    // this.balls = BallCollection.create(this);
    this.balls = [];
    var ball = Ball.generate(this, {
      type: "attractive",
      pos: Vector.subtract(this.center(), [300, 0])
    })
    this.balls.push(ball);
  },
  draw: function() {
    clearDebug();
    this._super();
    for (var i=0; i<this.balls.length; i++) this.balls[i].draw();
    if (this.mouseball) this.mouseball.drawCircle();
  },
  bindMouseCallbacks: function() {
    $(this.canvasElement).bind({
      mouseenter: this.onMouseEnter.bind(this),
      mouseleave: this.onMouseLeave.bind(this),
      mousemove: this.onMouseMove.bind(this),
      mousedown: this.onMouseDown.bind(this),
      mouseup: this.onMouseUp.bind(this)
    })
  },
  onMouseEnter: function(event) {
    this.mouseball = this.generateMouseBall(this.getMousePos(event));
  },
  onMouseLeave: function(event) {
    this.mouseball = null;
  },
  onMouseMove: function(event) {
    this.mouseball.pos = this.getMousePos(event);
  },
  onMouseDown: function(event) {
    this.mouseball.mousestart = this.getMousePos(event);
  },
  onMouseUp: function(event) {
    var mp = this.getMousePos(event);
    this.mouseball.mouseend = mp;
    this.mouseball.vel = Vector.divide(Vector.subtract(this.mouseball.mouseend, this.mouseball.mousestart), 6);
    this.mouseball.color = "black";
    this.balls.push(this.mouseball);
    this.mouseball = this.generateMouseBall(mp);
  },
  getMousePos: function(event) {
    // from http://diveintohtml5.org/canvas.html
    var mx = event.pageX - this.canvasElement.offsetLeft;
    var my = event.pageY - this.canvasElement.offsetTop;
    return [mx, my];
  },
  generateMouseBall: function(mpos) {
    var m = Math.rand(1, 4)
    var r = 3 + ((m - 1) / (4 - 1)) * (10 - 3)
    return new Ball(this, {
      radius: r,
      mass: m * Math.pow(10, 6),
      type: "attractive",
      pos: mpos,
      color: "rgba(0,0,0,0.4)"
    });
  },
  collision: function(obj) {
    /* Calculate new displacement */
    
    var bb = this.bounds();
    // Go ahead and calculate new position based on present velocity
    // even if it goes past the bound
    var newpos = Vector.add(obj.pos, obj.vel);
    var ob = obj.bounds(newpos);
    
    // The distance the object is past the bound
    var dxa = (bb[0][0] - ob[0][0]);
    var dxb = (ob[0][1] - bb[0][1]);
    var dya = (bb[1][0] - ob[1][0]);
    var dyb = (ob[1][1] - bb[1][1]);
    var velslope = (obj.vel[1] / obj.vel[0]);
    
    // If the position did cross over a bound, back up the object by a portion
    // of the velocity which will put the object exactly touching the bound
    if (dxa > 0) {
      newpos[0] += dxa;
      newpos[1] += dxa * velslope;
    }
    else if (dxb > 0) {
      newpos[0] -= dxb;
      newpos[1] -= dxb * velslope;
    }
    else if (dya > 0) {
      newpos[1] += dya;
      newpos[0] += dya / velslope;
    }
    else if (dyb > 0) {
      newpos[1] -= dyb;
      newpos[0] -= dyb / velslope;
    }
    
    /* Calculate new velocity which will apply for animation steps after the object
       hitting the bound */
    
    // We have to separate this from the above logic since pos + vel alone may end up
    // hitting the bound in which case none of the above logic has been executed
    if (dxa > 0 || dxb > 0 || dya > 0 || dyb > 0) {
      ob = obj.bounds(newpos);
    }
    var newvel = obj.vel.slice(0);
    if (ob[0][0] == bb[0][0] || ob[0][1] == bb[0][1]) newvel[0] = newvel[0] * -1;
    if (ob[1][0] == bb[1][0] || ob[1][1] == bb[1][1]) newvel[1] = newvel[1] * -1;
    
    return [newpos, newvel];
  },
  objectGravity: function(obj) {
    var newvel = obj.vel.slice(0);
    var balls = this.balls;
    $.each(balls, function() {
      if (this == obj) return;
      var f = this.gravityForce(obj);
      newvel = Vector.add(newvel, f);
    })
    newvel = Vector.limit(newvel, [20, 20]);
    var newpos = Vector.add(obj.pos, newvel);
    return [newpos, newvel];
  }
})

$(function() {
  var canvas = new GravityCanvas("#canvas");
  canvas.bindMouseCallbacks();
})