Vector.repulsion = function(objBounds, fieldBounds, k, pos, vel, restrictionType) {
  // objBounds are [[xa, xb], [ya, yb]]
  // fieldBounds are [[xa, xb], [ya, yb]]
  
  // what the points would be after the velocity change
  //var points2 = $.map(function(p) { return Vector.add(p, vel) });
  
  // smooth repulsion:
  // * at |x - p| = k, factor = 0
  // * at |x - p| = 0, factor = 1
  // so, factor for x direction is ((k - |x - p|) / k)
  var vel2 = vel.slice(0); // dup the velocity
  var disp = [0, 0];
  if (restrictionType == "inside") {
    /*
    var diffs = [
      Math.abs(points[0][0] - bounds[0][0]),
      Math.abs(points[0][1] - bounds[0][1]),
      Math.abs(points[1][0] - bounds[1][0]),
      Math.abs(points[1][1] - bounds[1][1])
    ]
    if (dxa < k) {
      var xr = f[0] * ((k - dxa) / k);
      v[0] += xr;
    }
    if (dxb < k) {
      var xr = f[0] * ((k - dxb) / k);
      v[0] -= xr;
    }
    if (dya < k) {
      var yr = f[1] * ((k - dya) / k);
      v[1] += yr;
    }
    if (dyb < k) {
      var yr = f[1] * ((k - dyb) / k);
      v[1] -= yr;
    }
    */
    // TODO: Back up the object by some inverse portion of the velocity enough to reach the bound
    if (objBounds[0][0] < fieldBounds[0][0]) {
      disp = Vector.subtract(disp, vel)
      disp[0] = fieldBounds[0][0] - objBounds[0][0];
    } else if (objBounds[0][1] > fieldBounds[0][1]) {
      disp[0] = fieldBounds[0][1] - objBounds[0][1];
    }
    if (objBounds[1][0] < fieldBounds[1][0]) {
      disp[1] = fieldBounds[1][0] - objBounds[1][0];
    } else if (objBounds[1][1] > fieldBounds[1][1]) {
      disp[1] = fieldBounds[1][1] - objBounds[1][1];
    }
    
    // calculate what the objBounds would be after the displacement
    var objBounds2 = [
      [objBounds[0][0] + disp[0], objBounds[0][1] + disp[0]],
      [objBounds[1][0] + disp[1], objBounds[1][1] + disp[1]]
    ]
    
    if (objBounds2[0][0] == fieldBounds[0][0] || objBounds2[0][1] == fieldBounds[0][1]) {
      vel2[1] = vel2[1] * -1;
    }
    if (objBounds2[1][0] == fieldBounds[1][0] || objBounds2[1][1] == fieldBounds[1][1]) {
      vel2[0] = vel2[0] * -1;
    }
  }
  return [disp, vel2];
}

function debug(msg) {
  $('#debug').html(msg);
}

var Ball = Class.extend({
  init: function(canvas) {
    this.canvas = canvas;
    this.cxt = canvas.cxt;
    this.radius = 10;
    this.speed = 10;
    this.pos = [
      Math.rand(this.canvas.canvasElement.width - (this.radius / 2)),
      Math.rand(this.canvas.canvasElement.height - (this.radius / 2))
    ];
    this.vel = [
      Math.rand(-this.speed, this.speed),
      Math.rand(-this.speed, this.speed)
    ];
  },
  draw: function() {
    /*
    //console.log("Position: " + this.pos);
    //console.log("Velocity: " + this.vel);
    var newpos = Vector.add(this.pos, this.vel);
    //console.log("Position after adding velocity: " + this.pos);
    var vectors = this.canvas.repulsion(this.bounds(newpos), newpos, this.vel);
    this.pos = Vector.add(this.pos, this.vel, vectors[0]);
    //console.log("Position after repulsion: " + this.pos);
    this.vel = vectors[1];
    //console.log("Velocity after repulsion: " + this.vel);
    */
    var vectors = this.canvas.collision(this);
    this.pos = Vector.add(this.pos, vectors[0]);
    this.vel = vectors[1];
    debug(
      "<p>Velocity: " + this.vel + "</p>" +
      "<p>Position: " + this.pos + "</p>"
    );
    this.cxt.beginPath();
    this.cxt.arc(this.pos[0], this.pos[1], this.radius, 0, 2*Math.PI);
    this.cxt.closePath();
    this.cxt.fill();
  },
  bounds: function(pos) { // x1, x2, y1, y2
    return [
      [pos[0] - this.radius, pos[0] + this.radius],
      [pos[1] - this.radius, pos[1] + this.radius]
    ]
  }
})

var RepulsionCanvas = Canvas.extend({
  init: function(id) {
    this._super(id);
    this.ball = new Ball(this, {radius: 10});
  },
  draw: function() {
    this._super();
    this.ball.draw();
  },
  repulsion: function(objBounds, pos, vel) {
    return Vector.repulsion(objBounds, this.bounds(), RepulsionCanvas.repulsionLimit, pos, vel, "inside")
  },
  collision: function(obj) {
    // calculate new displacement
    var cb = this.bounds();
    var newpos = Vector.add(obj.pos, obj.vel);
    var ob = obj.bounds(newpos);
    var disp = [0, 0];
    if (ob[0][0] < cb[0][0]) {
      var extra = cb[0][0] - ob[0][0];
      disp[0] = extra;
      disp[1] = extra * (obj.vel[1] / obj.vel[0]);
    } else if (ob[0][1] > cb[0][1]) {
      var extra = cb[0][1] - ob[0][1];
      disp[0] = extra;
      disp[1] = extra * (obj.vel[1] / obj.vel[0]);
    }
    if (ob[1][0] < cb[1][0]) {
      var extra = cb[1][0] - ob[1][0];
      disp[1] = extra;
      disp[0] = extra * (obj.vel[0] / obj.vel[1]);
    } else if (ob[1][1] > cb[1][1]) {
      var extra = cb[1][1] - ob[1][1];
      disp[1] = extra;
      disp[0] = extra * (obj.vel[0] / obj.vel[1]);
    }
    var disp = Vector.add(obj.vel, disp);
    
    // calculate new velocity
    var newpos = Vector.add(obj.pos, disp);
    var ob = obj.bounds(newpos);
    var vel = obj.vel.slice(0);
    if (ob[0][0] == cb[0][0] || ob[0][1] == cb[0][1]) vel[0] = vel[0] * -1;
    if (ob[1][0] == cb[1][0] || ob[1][1] == cb[1][1]) vel[1] = vel[1] * -1;
    
    return [disp, vel];
  }
})
RepulsionCanvas.repulsionLimit = 30;

$(function() {
  var canvas = new RepulsionCanvas("#canvas");
})