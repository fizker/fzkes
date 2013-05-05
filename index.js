module.exports =
{ fake: createFake
}

function createFake() {
	var __slice = Array.prototype.slice
	var action = function() {}
	var calls = []
	var fake = function() {
		calls.push(__slice.call(arguments))
		return action.apply(this, arguments)
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
			return args.every(function(arg, idx) {
				return arg == call[idx]
			})
		})
	}
	return fake
}
