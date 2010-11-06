init = ->
  BoidsCanvas = Canvas.extend
  Boid = Shape.extend
    setOptions: (options) ->
      @_super(options)
      @index = options.index
      return
    width: ->
      @options.width
    