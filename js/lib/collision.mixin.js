
'use strict';

window.collision = {
  applyTo: function(canvas, obj) {
    var bb, newpos, ob, dxa, dxb, dya, dyb, velslope, newvel

    // Calculate new displacement

    // Go ahead and calculate new position based on present velocity even if it
    // goes past the bound
    bb = canvas.getBounds()             // Box bounds
    newpos = Vec2(0,0)
    Vec2.add(obj.pos, obj.vel, newpos)
    ob = obj.getBoundsAt(newpos)        // Object bounds

    dxa = (bb[0][0] - ob[0][0])         // Distance x1 box bound is past x1 obj bound
    dxb = (ob[0][1] - bb[0][1])         // Distance x2 obj bound is past x2 box bound
    dya = (bb[1][0] - ob[1][0])         // Distance y1 box bound is past y1 obj bound
    dyb = (ob[1][1] - bb[1][1])         // Distance y2 obj bound is past y2 box bound
    velslope = Vec2.slope(obj.vel)

    // If the position did cross over a box bound, back up the object by a
    // portion of the velocity which will put the object exactly touching the
    // bound.
    // TODO: Do we need this stuff here? Can we merge this with below since we
    // never use newpos?
    if (dxa > 0) {
      Vec2.add(newpos, [dxa, dxa * velslope])
    } else if (dxb > 0) {
      Vec2.sub(newpos, [dxb, dxb * velslope])
    } else if (dya > 0) {
      Vec2.add(newpos, [dya / velslope, dya])
    } else if (dyb > 0) {
      Vec2.sub(newpos, [dyb / velslope, dyb])
    }
    if (dxa > 0 || dxb > 0 || dya > 0 || dyb > 0) {
      ob = obj.getBoundsAt(newpos)
    }

    // If the object does end up hitting a box bound, then modify the velocity
    // such that the object reverses direction.
    // (We have to separate this from the above logic since pos + vel alone may
    // end up hitting the bound in which case none of the above logic has been
    // executed.)

    // Reverse x direction if the object moving left hits the left edge of the
    // box, or if the object moving right hits the right edge of the box
    if (ob[0][0] === bb[0][0] || ob[0][1] === bb[0][1]) {
      obj.vel[0] *= -1
    }
    // Reverse y direction if the object moving up hits the top edge of the
    // box, or if the object moving down hits the bottom edge of the box
    if (ob[1][0] === bb[1][0] || ob[1][1] === bb[1][1]) {
      obj.vel[1] *= -1
    }
  }
}

