
// Here I am using SAT (Separation Axis Theorem) for collision
// detection/resolution.
//
// See here for resources:
//
// * http://www.codezealot.org/archives/55
// * http://physics2d.com/content/separation-axis

yorp.def('Polygon', yorp.CanvasObject, function (proto) {
  var Vec2 = yorp.Vec2

  function buildEdges(absVertices) {
    var edges = [],
        i, len, v1, v2
    // Assume that vertices have been given going clockwise around the polygon
    for (i = 0, len = absVertices.length; i < len; i++) {
      v1 = absVertices[i]
      v2 = absVertices[i+1 > len-1 ? 0 : i+1]
      edges.push(Vec2.nsub(v1, v2))
    }
    return edges
  }

  function buildEdgeNormals(vertices) {
    var normals = [],
        i, len,
        v1, v2, normal
    // Build edges going clockwise around the polygon
    for (i = 0, len = vertices.length; i < len; i++) {
      v1 = vertices[i]
      v2 = vertices[i+1 > len-1 ? 0 : i+1]
      normal = Vec2.nsub(v1, v2)
      // Rotate edge CCW to point outward
      Vec2.lperp(normal)
      Vec2.normalize(normal)
      normals.push(normal)
    }
    return normals
  }

  function buildAbsVertices(vertices, position, orientation, radius) {
    var absVertices = [],
        offset = [
          position[0] + radius * Math.cos(orientation),
          position[1] + radius * Math.sin(orientation)
        ],
        i, len, v
    for (i = 0, len = vertices.length; i < len; i++) {
      absVertices.push(Vec2(
        vertices[i][0] + offset[0],
        vertices[i][1] + offset[1]
      ))
    }
    return absVertices
  }

  function calculateBounds(vertices) {
    var i, len, v,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity
    for (i = 0, len = vertices.length; i < len; i++) {
      v = vertices[i]
      if (v[0] <= x1) { x1 = v[0] }
      if (v[0] >= x2) { x2 = v[0] }
      if (v[1] <= y1) { y1 = v[1] }
      if (v[1] >= y2) { y2 = v[1] }
    }
    return [Vec2(x1, x2), Vec2(y1, y2)]
  }

  function calculateDimensions(bounds) {
    return {
      width: bounds[1][0] - bounds[0][0],
      height: bounds[1][1] - bounds[0][1]
    }
  }

  function calculateHalfDimensions(dims) {
    return {
      width: dims.width / 2,
      height: dims.height / 2
    }
  }

  function calculateRadius(vertices) {
    var bounds = calculateBounds(vertices),
        dims = calculateDimensions(bounds)
    return Math.max(dims.width, dims.height)
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
    // shape B overlaps shape A
    // {      [  }        ]
    if (p2[0] <= p1[1] && p2[1] >= p1[1]) {
      return p2[0] - p1[1]
    }
    // shape A overlaps shape B
    // [      {  ]        }
    else if (p1[0] <= p2[1] && p1[1] >= p2[1]) {
      return p1[0] - p2[1]
    }
    // shape B inside shape A
    // {  [    ]    }
    else if (p2[0] >= p1[1] && p2[1] <= p1[1]) {
      return p1[1] - p2[0]
    }
    // shape A inside shape B
    // [  {    }    ]
    else if (p1[0] >= p2[1] && p1[1] <= p2[1]) {
      return p2[1] - p1[0]
    }
  }

  function calculateEdgeNormalOverlaps(vertices1, vertices2, axes) {
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

  this._setup = function(parent, opts) {
    proto._setup.apply(this, arguments)
    if (!opts) {
      throw new Error("Options are required")
    }
  }

  this.setOptions = function (opts) {
    var _this = this
    if (opts.vertices == null) {
      throw new Error("Polygon.create requires a list of vertices")
    }
    this.vertices = opts.vertices
    // Here we are assuming that the vertices of the shape never change
    // throughout the life of the shape
    this.edges = buildEdges(this.vertices)
    this.edgeNormals = buildEdgeNormals(this.vertices)
    proto.setOptions.call(this, opts)
  }

  this.onUpdateState = function () {
    this.radius = calculateRadius(this.vertices)
    this.absVertices = buildAbsVertices(
      this.vertices,
      this.state.position,
      this.state.orientation,
      this.radius
    )
    proto.onUpdateState.call(this)
    this.dimensions = calculateDimensions(this.bounds)
    this.halfDimensions = calculateHalfDimensions(this.dimensions)
  }

  this.updateBounds = function () {
    this.bounds = calculateBounds(this.absVertices)
    console.log({bounds: this.bounds})
  }

  this.draw = function () {
    var s = this.renderState
    this.canvas.polygon(s.position, this.vertices, {
      rotate: s.orientation,
      drawStyle: this.drawStyle,
      color: this.color
    })
  }

  this.fixCollisions = function () {
    var overlappingEdge = [null, 0],
        i, len, axes, overlappingEdge
    proto.fixCollisions.call(this)
    for (i = 0, len = this.canvas.objects.length; i < len; i++) {
      obj = this.canvas.objects[i]
      if (obj === this) { continue }
      axes = concatAxes(this.edgeNormals, obj.edgeNormals)
      overlappingEdge = calculateEdgeNormalOverlaps(this.vertices, obj.vertices, axes)
      // TODO............
      /*
      if (overlappingEdge) {
        Vec2.nmul(overlappingEdge[0], -overlap)
      }
      */
    }
  }

  // Determine if a point is within the polygon.
  //
  // Returns true or false.
  //
  // Sources:
  //
  // * http://stackoverflow.com/questions/1119627/how-to-test-if-a-point-is-inside-of-a-convex-polygon-in-2d-integer-coordinates
  // * http://demonstrations.wolfram.com/AnEfficientTestForAPointToBeInAConvexPolygon/
  // * http://www.exaflop.org/docs/naifgfx/naifpip.html
  //
  this.pointIsInside = function (v) {
    var i, len, v1, v2, edge, x
    // Assume that vertices are defined for the polygon going clockwise. First
    // translate the polygon so that `v` is the origin. Then, for each edge,
    // get the angle between two vectors: 1) the edge vector and 2) the vector
    // of the first vertex of the edge. If all of the angles are the same sign
    // (which is negative since they will be counter-clockwise) then the point
    // is inside the polygon; otherwise, the point is outside.
    for (i = 0, len = this.absVertices.length; i < len; i++) {
      v1 = Vec2.nsub(this.absVertices[i], v)
      v2 = Vec2.nsub(this.absVertices[i+1 > len-1 ? 0 : i+1], v)
      edge = Vec2.nsub(v1, v2)
      // Note that we could also do this by using the normal + dot product
      x = Vec2.perpdot(edge, v1)
      // If the point lies directly on an edge then count it as in the polygon
      if (x < 0) { return false }
    }
    return true
  }
})

