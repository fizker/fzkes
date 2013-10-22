module.exports = createFake

var __slice = Array.prototype.slice
var __find = Array.prototype.find || function find(fn, ctx) {
	var l = this.length
	for(var i = 0; i < l; i++) {
		var o = this[i]
		if(fn.call(ctx, o, i, this)) {
			return o
		}
	}
	return null
}
var __map = Array.prototype.map

function noop() {}

function createFake(target, property) {
	var action = null
	var calls = []
	var unhandledCalls = []
	var constrainedFakes = []
	constrainedFakes.find = function(fn) {
		var result = __find.call(this, fn)
		return result && result.fake
	}

	var fake = function() {
		var args = __slice.call(arguments)
		var act = constrainedFakes.find(function(f) {
			return f.args.every(function(arg, i) {
				if(!arg) return true
				var val = args[i]
				if(arg.regex) return typeof(val) == 'string' && arg.regex.test(val)
				if(arg.value) return compareObjects(arg.value, val)
				return true
			})
		}) || action
		calls.push(args)
		if(!act) {
			unhandledCalls.push(args)
			return
		}
		return act.apply(this, args)
	}
	Object.defineProperty(fake, 'callCount', {
		get: function() { return calls.length }
	})
	Object.defineProperty(fake, '_calls', {
		get: function() { return calls }
	})
	fake.calls = function(fn, options) {
		if(options && options.now) {
			var lastCall = unhandledCalls.shift()
			if(!lastCall) {
				throw new Error('No unhandled calls registered on the fake')
			}
			fn.apply(null, lastCall)
			return this
		}
		action = fn
		return this
	}
	fake.callsArg = function(options) {
		var getCallback
		if(!options) options = {}
		switch(options.arg) {
			case 'first':
				getCallback = function(args) {
					for(var i = 0; i < args.length; i++) {
						if(typeof(args[i]) == 'function') {
							return args[i]
						}
					}
					return noop
				}
				break
			case 'last':
			default:
				getCallback = typeof(options.arg) == 'number'
				? function(args) { return args[options.arg] }
				: function(args) {
					for(var i = args.length - 1; i >= 0; i--) {
						if(typeof(args[i]) == 'function') {
							return args[i]
						}
					}
					return noop
				}
		}
		if(options.async) {
			var internalGetCB = getCallback
			getCallback = function(args) {
				var cb = internalGetCB(args)
				return function() {
					var args = __slice.call(arguments)
					process.nextTick(function() {
						cb.apply(null, args)
					})
				}
			}
		}
		return this.calls(function() {
			var args = __slice.call(arguments)
			var callback = getCallback(args)
			var result
			var error
			try {
				result = callback.apply(null, options.arguments || [])
			} catch(e) {
				error = e
				if(options.notify) {
					options.notify(e)
					throw e
				}
			}
			result = options.notify && options.notify(null, result)
			return options.returns || result
		}, { now: options.now })
	}
	fake.returns = function(val) {
		return this.calls(function() { return val })
	}
	fake.throws = function(val) {
		return this.calls(function() { throw val || new Error })
	}
	fake.wasCalled = function() {
		return !!fake.callCount
	}
	fake.wasCalledWith = function() {
		var args = __slice.call(arguments)
		return calls.some(function(call) {
			return compareArrays(args, call)
		})
	}
	fake.wasCalledWithExactly = function() {
		var args = __slice.call(arguments)
		return calls.some(function(call) {
			return call.length == args.length && compareArrays(args, call)
		})
	}
	fake.withArgs = function() {
		return this.withComplexArgs.apply(this, __map.call(arguments, function(val) { return { value: val } }))
	}
	fake.withComplexArgs = function() {
		var args = __slice.call(arguments)
		var newFake = constrainedFakes.find(function(f) {
			if(f.args.length != args.length) {
				return false
			}
			return compareArrays(f.args, args)
		})
		if(newFake) {
			return newFake
		}
		newFake = createFake()
		constrainedFakes.push(
		{ args: args
		, fake: newFake
		})
		constrainedFakes.sort(constrainedFakesSorter)
		var oldCalls = newFake.calls
		newFake.calls = function() {
			oldCalls.apply(this, arguments)
			return fake
		}
		return newFake
	}
	fake.restore = function() {
		if(target && property) {
			target[property] = original
		}
	}
	fake.callsOriginal = function(options) {
		return this.calls(original, options)
	}

	var original
	fake._name = 'fake'
	if(target) {
		if(property) {
			fake._name = property
			original = target[property]
			target[property] = fake
		} else {
			fake._name = target
		}
	}

	return fake
}

function compareObjects(a, b) {
	switch(typeof(a)) {
		case 'object':
			if(a == null) {
				return a === b
			}

			if(a instanceof RegExp && b instanceof RegExp) {
				return a.toString() === b.toString()
			}

			return Object.keys(a).every(function(prop) {
				return compareObjects(a[prop], b[prop])
			})
		default:
			return a === b
	}
}

function compareArrays(a, b) {
	return compareObjects(a, b)
}

function constrainedFakesSorter(a, b) {
	return b.args.length - a.args.length
}
