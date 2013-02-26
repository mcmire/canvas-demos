
window.keyboard = (function () {
  var KEYS, MODIFIER_KEYS, PressedKeys, KeyTracker, keyboard

  KEYS = {
    KEY_UP: 38,
    KEY_DOWN: 40,
    KEY_LEFT: 37,
    KEY_RIGHT: 39,
    KEY_SPACE: 32
  }

  MODIFIER_KEYS = [
    KEYS.KEY_SHIFT,
    KEYS.KEY_CTRL,
    KEYS.KEY_ALT,
    KEYS.KEY_META,
  ]

  // PressedKeys is the internal data structure for the KeyTracker class. It is a
  // record of all keys that are currently being held down (yes, and that is
  // plural, so multiple keys can be tracked).  The keys are stored in a stack.
  // The idea is that we only ever care about the last key pressed, and if that
  // key is released and other keys are still being pressed then now our focus
  // moves to the last key before that one. The time that each key was pressed is
  // also stored; this makes it possible to discern whether any keys are "stuck"
  // and need to be unset.
  //
  PressedKeys = P(function (proto) {
    proto.init = function () {
      this.reset()
      return this
    }

    proto.reset = function () {
      this.tsByKey = {}
      this.keys = []
    }

    proto.get = function (key) {
      return this.tsByKey[key]
    }

    proto.getMostRecent = function () {
      return this.keys[0]
    }

    proto.put = function (key, ts) {
      this.has(key) && this.del(key)
      this.tsByKey[key] = ts
      this.keys.unshift(key)
    }

    proto.del = function (key) {
      var ts
      if (this.has(key)) {
        ts = this.tsByKey[key]
        delete this.tsByKey[key]
        this.keys.splice(this.keys.indexOf(key), 1)
      }
    }

    proto.has = function (key) {
      return this.tsByKey.hasOwnProperty(key)
    }

    proto.each = function (fn) {
      var i, len
      for (i = 0, len = this.keys.length; i < len; i++) {
        fn(this.keys[i], this.tsByKey[this.keys[i]])
      }
    }
  })

  // KeyTracker lets you track certain keys and then ask if those keys are
  // currently being pressed.
  //
  // This fits into the keyboard class. To actually add a KeyTracker to the
  // current process you must do this:
  //
  //   keys = [...]
  //   keyTracker = keyboard.KeyTracker.create(keys)
  //   keyboard.addKeyTracker(keyTracker)
  //
  // To then check whether a tracked key is being pressed, you can say this
  // anywhere in the process:
  //
  //   keyboard.isTrackedKeyPressed('KEY_UP')
  //
  // A KeyTracker is most useful if there is a chance that some of the given keys
  // may be pressed simultaneously and yet the desired behavior is that the last
  // key pressed overrides any other keys being pressed. (Arrow keys for movement
  // is a good example.) If you are in an event such as mousedown or mouseup and
  // you want to know whether a key is being pressed, then you can simply use
  // keyboard.isKeyPressed(evt).
  //
  KeyTracker = P(function (proto) {
    var KEY_TIMEOUT = 500

    proto.init = function (keyCodes) {
      this.trackedKeys = $.v.reduce(keyCodes, function (o, c) { o[c] = 1; return o }, {})
      this.pressedKeys = PressedKeys()
    }

    proto.reset = function () {
      this.pressedKeys.reset()
      return this
    }

    proto.keydown = function (keyCode, ts) {
      if (this.trackedKeys.hasOwnProperty(keyCode)) {
        this.pressedKeys.put(keyCode, ts)
        return true
      }
      return false
    }

    proto.keyup = function (keyCode) {
      if (this.trackedKeys.hasOwnProperty(keyCode)) {
        this.pressedKeys.del(keyCode)
        return true
      }
      return false
    },

    proto.isKeyPressed = function (keyCodes) {
      var _this = this
      return !!$.v.find(keyCodes, function (keyCode) {
        return _this.pressedKeys.has(keyCode)
      })
    },

    proto.clearStuckKeys = function (now) {
      var _this = this
      this.pressedKeys.each(function (key, ts) {
        if ((now - ts) >= KEY_TIMEOUT) {
          this.pressedKeys.del(key)
        }
      })
    }

    proto.getLastPressedKey = function () {
      return this.pressedKeys.getMostRecent()
    }
  })

  keyboard = (function () {
    var kb = {}

    function onKeyDown() {
      var key = event.keyCode,
          isTracked = false,
          i, len
      for (i = 0, len = kb.keyTrackers.length; i < len; i++) {
        if (kb.keyTrackers[i].keydown(key, event.timeStamp)) {
          isTracked = true
        }
      }
      if (isTracked) {
        event.preventDefault()
        return false
      }
    }

    function onKeyUp() {
      var key = event.keyCode,
          isTracked = false,
          i, len
      for (i = 0, len = kb.keyTrackers.length; i < len; i++) {
        if (kb.keyTrackers[i].keyup(key)) {
          isTracked = true
        }
      }
      if (isTracked) {
        event.preventDefault()
        return false
      }
    }

    function onWindowBlur() {
      kb.reset()
    }

    domEventEmitter.mixInto(kb, 'keyboard')

    //
    //
    kb.KeyTracker = KeyTracker

    //
    //
    kb.keys = KEYS

    //
    //
    kb.modifierKeys = MODIFIER_KEYS

    //
    //
    kb.keyTrackers = []

    //
    //
    kb.init = function () {
      this.reset()
      return this
    }

    //
    //
    kb.reset = function () {
      if (this.keyTrackers) {
        $.v.each(this.keyTrackers, function (tracker) {
          tracker.reset()
        })
      }
      return this
    }

    //
    //
    kb.addEvents = function () {
      this.bindEvents(document, {
        keydown: onKeyDown,
        keyup: onKeyUp
      })
      this.bindEvents(window, {
        blur: onWindowBlur
      })
      return this
    }

    //
    //
    kb.removeEvents = function () {
      this.unbindEvents(document, 'keydown', 'keyup')
      this.unbindEvents(window, 'blur')
      return this
    },

    //
    //
    kb.addKeyTracker = function (tracker) {
      this.keyTrackers.push(tracker)
      return this
    },

    //
    //
    kb.removeKeyTracker = function (tracker) {
      // seriously, Javascript, how am I supposed to live without a delete method
      this.keyTrackers.splice(this.keyTrackers.indexOf(tracker), 1)
      return this
    }

    // Determine whether the given event (which is expected to have a valid
    // keyCode property) refers to the given key or keys.
    //
    // keys - Integers that are key codes, or Strings that map to key codes in
    //        the KEYS hash. (Technically, what keyboard.keyCodeFor accepts.)
    //
    // Examples:
    //
    //   keyboard.isKeyPressed(evt, 37)  // left arrow key
    //   keyboard.isKeyPressed(evt, 'KEY_LEFT')
    //   keyboard.isKeyPressed(evt, 'left', 'a')
    //
    // Returns true or false.
    //
    // Raises an Error if any of `keys` are not known keys.
    //
    // This is also aliased to #isKeyUnpressed.
    //
    kb.isKeyPressed = function (/* evt, keys... */) {
      var keys = Array.prototype.slice.call(arguments),
          evt = keys.shift()
      return ~this.keyCodesFor(keys).indexOf(evt.keyCode)
    }

    // Determine whether a key or keys which are being tracked using a
    // KeyTracker are being pressed.
    //
    // keys - Integers that are key codes, or Strings that map to key codes in
    //        the KEYS hash. (Technically, what keyboard.keyCodeFor accepts.)
    //
    // Examples:
    //
    //   keyboard.isTrackedKeyPressed(37)  // left arrow key
    //   keyboard.isTrackedKeyPressed('KEY_LEFT')
    //   keyboard.isTrackedKeyPressed('left', 'a')
    //
    // Returns true or false.
    //
    // Raises an Error if any of `keys` are not known keys.
    //
    kb.isTrackedKeyPressed = function (/* keys... */) {
      var _this = this,
          keys = Array.prototype.slice.call(arguments)
      return $.v.find(this.keyTrackers, function (tracker) {
        // TODO: This needs to pass an event
        return tracker.isKeyPressed(_this.keyCodesFor(keys))
      })
    }

    //
    //
    kb.clearStuckKeys = function (now) {
      $.v.each(this.keyTrackers, function (tracker) {
        tracker.clearStuckKeys(now)
      })
      return this
    }

    //
    //
    kb.isModifierKeyPressed = function (event) {
      return (
        event.shiftKey ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      )
    }

    //
    //
    kb.keyCodesFor = function (/* keys... */) {
      var _this = this,
          args = Array.prototype.slice.call(arguments)
      return $.v.map($.v.flatten(args), function (key) {
        return _this.keyCodeFor(key)
      })
    }

    // Convert the given value into a key code (the same thing that
    // event.keyCode would return).
    //
    // key - A String name of an exact key in the KEYS hash, or a String that
    //       omits the "KEY_" part of the KEYS key, or an Integer key code.
    //
    // Examples:
    //
    //   keyCodeFor(38)        //=> 38
    //   keyCodeFor('KEY_UP')  //=> 38
    //   keyCodeFor('up')      //=> 38
    //
    // Returns an Integer.
    //
    // Raises an Error if `key` does not refer to a known key.
    //
    kb.keyCodeFor = function (givenKey) {
      var key = givenKey,
          keyCode
      if (typeof key === 'string') {
        if (!/^KEY_/.test(key)) { key = "KEY_" + key.toUpperCase() }
        keyCode = KEYS[key]
        if (!keyCode) {
          throw new Error("'" + givenKey + "' is not a known key. Known keys are: " + $.v.keys(KEYS).join(", "))
        }
        return keyCode
      } else {
        return key
      }
    }

    return kb
  })()

  return keyboard
})()

