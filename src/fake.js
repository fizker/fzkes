module.exports = createFake

var __slice = Array.prototype.slice

function createFake(target, property) {
	var action = null
	var calls = []
	var unhandledCalls = []
	var constrainedFakes = []
	constrainedFakes.find = function(args, options) {
		options = options || {}
		var fake
		if(!constrainedFakes.some(function(f) {
			fake = f.fake
			if(options.exactMatch && f.args.length != args.length) {
				return false
			}
			return compareArrays(f.args, args)
		})) { fake = null }
		return fake
	}

	var fake = function() {
		var args = __slice.call(arguments)
		var act = constrainedFakes.find(args) || action
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
			return
		}
		action = fn
	}
	fake.callsArg = function(options) {
		var getCallback
		switch(options.arg) {
			case 'first':
				getCallback = function(args) {
					for(var i = 0; i < args.length; i++) {
						if(typeof(args[i]) == 'function') {
							return args[i]
						}
					}
					return function() {}
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
					return function() {}
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
		this.calls(function() {
			var args = __slice.call(arguments)
			var callback = getCallback(args)
			callback.apply(null, options.arguments || [])
		}, { now: options.now })
	}
	fake.returns = function(val) {
		this.calls(function() { return val })
	}
	fake.throws = function(val) {
		this.calls(function() { throw val || new Error })
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
		var args = __slice.call(arguments)
		var newFake = constrainedFakes.find(args, { exactMatch: true })
		if(newFake) {
			return newFake
		}
		newFake = createFake()
		constrainedFakes.push(
		{ args: args
		, fake: newFake
		})
		constrainedFakes.sort(constrainedFakesSorter)
		return newFake
	}
	fake.restore = function() {
		if(target && property) {
			target[property] = original
		}
	}
	fake.callsOriginal = function(options) {
		this.calls(original, options)
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
