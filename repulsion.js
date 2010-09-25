function debug(msg) {
  $('#debug').html(msg);
}

var Ball = Class.extend({
  init: function(canvas) {
    this.canvas = canvas;
    this.cxt = canvas.cxt;
    this.radius = 10;
    this.speed = 10;
    /*
    this.pos = [
      Math.rand(this.canvas.canvasElement.width - (this.radius / 2)),
      Math.rand(this.canvas.canvasElement.height - (this.radius / 2))
    ];
    */
    this.pos = [
      this.canvas.canvasElement.width - (this.radius / 2) - 100,
      this.canvas.canvasElement.height - (this.radius / 2) - 100
    ]
    /*
    this.vel = [
      Math.rand(-this.speed, this.speed),
      Math.rand(-this.speed, this.speed)
    ];
    */
    this.vel = [10, 5]
  },
  draw: function() {
    var vectors = this.canvas.repulsion(this);
    this.pos = vectors[0];
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
    var pos = pos || this.pos;
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
  repulsion: function(obj) {
    // Smooth repulsion:
    // * at |x - p| = k, factor = 0
    // * at |x - p| = 0, factor = 1
    // So, factor for x direction is ((k - |x - p|) / k)
    
    /* Calculate new displacement */
    
    var bb = this.bounds();
    var ob = obj.bounds();
    var f = obj.vel;
    var newvel = obj.vel.slice(0);
    var k = 50;
    
    // The distance the object is past the bound
    var dxa = Math.abs(ob[0][0] - bb[0][0]);
    var dxb = Math.abs(ob[0][1] - bb[0][1]);
    var dya = Math.abs(ob[1][0] - bb[1][0]);
    var dyb = Math.abs(ob[1][1] - bb[1][1]);
    var velslope = newvel[1] / newvel[0];
    
    // Modify the velocity by the amount the object is near the bound.
    // The closer the object is to the bound (and, technically, the further it is past the
    // "safe area" which is designated by k), the further it's pushed away.
    // As long as the object is near the bound, it's continually pushed away, and the
    // effect is that it eventually changes direction.
    if (dxa < k) {
      var xr = f[0] * ((k - dxa) / k);
      newvel[0] += xr;
      newvel[1] += xr * velslope;
    }
    if (dxb < k) {
      var xr = f[0] * ((k - dxb) / k);
      newvel[0] -= xr;
      newvel[1] -= xr * velslope;
    }
    if (dya < k) {
      var yr = f[1] * ((k - dya) / k);
      newvel[1] += yr;
      newvel[0] += yr * (1/velslope);
    }
    if (dyb < k) {
      var yr = f[1] * ((k - dyb) / k);
      newvel[1] -= yr;
      newvel[0] -= yr * (1/velslope);
    }
    
    var newpos = Vector.add(obj.pos, newvel);
    return [newpos, newvel];
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
      newpos[0] += dya * (1/velslope);
    }
    else if (dyb > 0) {
      newpos[1] -= dyb;
      newpos[0] -= dyb * (1/velslope);
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
  }
})
RepulsionCanvas.repulsionLimit = 30;

$(function() {
  var canvas = new RepulsionCanvas("#canvas");
})