window.Vector = (->
  Vector = Array.extend({})
  
  coerce = (v,n) ->
    return v if $.isArray(v)
    return v for [1..n]
    
  normalizeList = (vectors) ->
    for vec in vectors
      if typeof vec == 'number'
        coerce vec, vectors[0].length
      else
        vec
        
  makeFunction = (operator, initialValue) ->
    injector = new Function("acc", "v", "return acc " + operator + " v");
    return ->
      vectors = normalizeList(arguments);
      zipped = _.zip(vectors...)
      coords = _.inject(v, injector, ([initialValue] if initialValue?)...) for v in zipped
      new Vector(coords)
      
  methods =
    add: makeFunction("+")
    subtract: makeFunction("-")
    multiply: makeFunction("*")
    divide: makeFunction("/")
  
    distance: (v1, v2) -> Vector.subtract(v2, v1).magnitude()
    magnitude: (v) ->
      sum = 0; sum += Math.pow(a, 2) for a in v
      Math.sqrt(sum)
    
    # Note that this is only a 2D concept, so no need to abstract this
    slope: ->
      if arguments.length == 1
        arguments[0][1] / arguments[0][0];
      else
        (arguments[1][1] - arguments[0][1]) / (arguments[1][0] - arguments[0][0])
      
    invert: (v) -> Vector.multiply(v, -1)
  
    limit: (v1, v2) ->
      v1 = v1.slice() # dupe the array
      for i in [0..v1.length]
        if      v1[i] > 0 then v1[i] =  v2[i] if v1[i] >  v2[i]
        else if v1[i] < 0 then v1[i] = -v2[i] if v1[i] < -v2[i]
      new Vector(v1)
    
    angle: (v) ->
      slope = v[1] / v[0]
      theta = 0
      if v[0] == 0
        # piping the slope into atan would cause a division by zero error
        # so we'll just pick these ourselves
        theta =
          if      v[1] > 0 then  Math.PI / 2
          else if v[1] < 0 then -Math.PI / 2
      else
        theta = Math.atan(slope)
        # atan's domain is -pi/2 to pi/2
        # so if the x-value is negative, we need to rotate the angle around
        theta += Math.PI if v[0] < 0
      return theta
    
    isBeyond: (v1, v2) ->
      _(v1).chain()
        .zip(v2).any((pair) -> pair[0] > pair[1])
      .value()
    
  methods.plus  = methods.add
  methods.minus = methods.subtract
  methods.times = methods.multiply
  methods.over  = methods.divide
    
  # Make class and instance method versions of the above methods
  for method, func of methods
    Vector[method] = func
    Vector.prototype[method] = ->
      args = Array.prototype.slice.call(arguments)
      args.unshift(this)
      func.apply this, args
  
  return Vector
)()
  
# Just a shortcut
# XXX: Performance issue?
window.$V = -> new window.Vector(Array.prototype.slice.call(arguments))
$.extend window.$V, window.Vector