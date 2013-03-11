
yorp.def('PeriodicLogger', function (proto) {
  this._setup = function () {
    this.reset()
  }

  this.reset = function () {
    this.timeLastLogged = (new Date()).getTime()
  }

  this.log = function (/* args... */) {
    var t = (new Date()).getTime()
    if ((t - this.timeLastLogged) >= 1000) {
      console.log.apply(console, arguments)
      this.reset()
    }
  }
})

