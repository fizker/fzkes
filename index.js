module.exports =
{ fake: createFake
}

function createFake() {
	var __slice = Array.prototype.slice
	var action = function() {}
	var calls = []
	var constrainedFakes = []
	constrainedFakes.find = function(args) {
		var fake
		if(!constrainedFakes.some(function(f) {
			fake = f.fake
			return compareArrays(args, f.args)
		})) { fake = null }
		return fake
	}
	var fake = function() {
		var args = __slice.call(arguments)
		calls.push(args)
		return (constrainedFakes.find(args) || action).apply(this, args)
	}
	fake.__defineGetter__('callCount', function() {
		return calls.length
	})
	fake.calls = function(fn) {
		action = fn
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
	fake.withArgs = function() {
		var args = __slice.call(arguments)
		var newFake = createFake()
		constrainedFakes.push(
		{ args: args
		, fake: newFake
		})
		return newFake
	}
	return fake
}

function compareArrays(a, b) {
	return a.every(function(itm, idx) {
		return itm == b[idx]
	})
}
