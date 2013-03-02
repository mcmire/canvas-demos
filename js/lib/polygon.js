
// Here I am using SAT (Separation Axis Theorem) for collision
// detection/resolution.
//
// See here for resources:
//
// * http://www.codezealot.org/archives/55
// * http://physics2d.com/content/separation-axis

window.Polygon = P(CanvasObject, function (proto, uber) {
  function buildEdgeNormals(vertices) {
    var normals = [],
        i, len, v1, v2, normal
    // Build edges going clockwise around the polygon
    for (i = 0, len = vertices.length; i < len; i++) {
      v1 = vertices[i]
      v2 = vertices[i+1 > len-1 ? 0 : i+1]
      normal = Vec2.nsub(v1, v2, edge)
      // Rotate edge CCW to point outward
      Vec2.lperp(normal)
      Vec2.norm(normal)
      normals.push(normal)
    }
    return normals
  }

  function concatAxes(axes1, axes2) {
    var axesHash = {},
        axesArr = [],
        i, len, k
    for (i = 0, len = axes1.length; i < len; i++) {
      k = [axes1[i][0], axes1[i][1]].join(',')
      axesHash[k] = axes1[i]
    }
    for (i = 0, len = axes2.length; i < len; i++) {
      k = [axes2[i][0], axes2[i][1]].join(',')
      axesHash[k] = axes2[i]
    }
    for (k in axesHash) { axesArr.push(axesHash[k]) }
    return axesArr
  }

  function getProjectionOntoAxis(axis, vertices) {
    var values = [],
        i, len
    // The dot product here is hard to visualize, but what we are essentially
    // doing here is treating the normal of an edge as an axis and then breaking
    // down the position vector of each vertex according to this new axis. This
    // gives us a distance along the axis to reach the vertex (starting from
    // the origin, (0,0)). The distance (a scalar) will be positive if the angle
    // between the vertex vector and the normal vector is less than 90°, 0
    // at 90°, and negative if greater than 90°.
    for (i = 0, len = vertices.length; i < len; i++) {
      values.push(Vec2.dot(axis, vertices[i]))
    }
    return [Math.min(values), Math.max(values)]
  }

  function getOverlapOnAxis(axis, vertices1, vertices2) {
    var p1, p2
    p1 = getProjectionOntoAxis(axis, vertices1)
    p2 = getProjectionOntoAxis(axis, vertices2)
    return getProjectionOverlap(p1, p2)
  }

  function getProjectionOverlap(p1, p2) {
    // Note that this function assumes that p2 is not inside p1.
    // If that happens then the result is undefined or incorrect.
    if (p1[0] > p2[0]) { tmp = p1; p1 = p2; p2 = tmp }  // ensure p1[0] < p2[0]
    if (p1[1] < p2[0]) { return null }
    return p2[0] - p1[1]
  }

  function calculateEdgeNormalOverlaps(vertices1, vertices2, axes)
    var overlappingEdge = [null, 0],
        i, len
    for (i = 0, len = axes.length; i < len; i++) {
      overlap = getOverlapOnAxis(axes[i], vertices1, vertices2)
      // All of the axes must overlap in some way for the two shapes to be
      // considered colliding. If any axes do not overlap then we can exit
      // early (this is one of the benefits of SAT).
      if (overlap === null) {
        return null
      } else if (overlap < overlappingEdge[1]) {
        overlappingEdge[0] = axes[i]
        overlappingEdge[1] = overlap
      }
    }
    return overlappingEdge
  }

  proto.init = function (parent, vertices, opts) {
    uber.init.call(this, parent, opts)
    this.vertices = vertices
    // Here we are assuming that the vertices of the shape never change
    // throughout the life of the shape
    this.edgeNormals = buildEdgeNormals(vertices)
  }

  proto.draw = function () {
    var s = this.interpState
    this.canvas.polygon(this.vertices, {
      rotate: s.orientation,
      fill: this.color
    })
  }

  proto.fixCollisions = function () {
    var overlappingEdge = [null, 0],
        i, len, axes, overlappingEdge
    uber.fixCollisions.call(this)
    for (i = 0, len = this.canvas.objects.length; i < len; i++) {
      obj = this.canvas.objects[i]
      if (obj === this) { continue }
      axes = concatAxes(this.edgeNormals, obj.edgeNormals)
      overlappingEdge = calculateEdgeNormalOverlaps(this.vertices, obj.vertices, axes)
      if (overlappingEdge) {
        Vec2.nmul(overlappingEdge[0], -overlap)
      }
    }
  }

})
