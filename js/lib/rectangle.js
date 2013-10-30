
yorp.def('Rectangle', yorp.Polygon, function (proto) {
  var Vec2 = yorp.Vec2

  function buildVertices(width, height) {
    var hw = width / 2,
        hh = height / 2
    // clockwise
    return [
      Vec2(-hw, -hh),
      Vec2(hw, -hh),
      Vec2(hw, hh),
      Vec2(-hw, hh)
    ]
  }

  this.setOptions = function (opts) {
    var width = opts.dimensions.width,
        height = opts.dimensions.height
    if (opts.dimensions == null || opts.dimensions.width == null ||
        opts.dimensions.height == null) {
      throw new Error("You must supply a width and a height for a Rectangle")
    }
    opts.vertices = buildVertices(width, height)
    proto.setOptions.call(this, opts)
  }
})
