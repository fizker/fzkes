module.exports =
{ fake: createFake
, chai: attachToChai
}

var __slice = Array.prototype.slice

function attachToChai(chai, utils) {
	chai.Assertion.addChainableMethod('called', function(expectedCallCount) {
		var fake = utils.flag(this, 'object')
		var actualCallCount = fake.callCount
		var expected = expectedCallCount + (expectedCallCount == 1 ? ' time' : ' times' )
		var actual = actualCallCount + (actualCallCount == 1 ? ' time' : ' times' )
		new chai.Assertion(actualCallCount).assert(
		  actualCallCount == expectedCallCount
		, 'expected fake to have been called ' + expected + ', but it was called ' + actual
		, 'expected fake to not have been called ' + expected + ', but it was'
		)
	}, function() {
		var fake = utils.flag(this, 'object')
		new chai.Assertion(fake).assert(
		  fake.wasCalled()
		, 'expected fake to have been called'
		, 'expected fake to not have been called'
		)
	})
	chai.Assertion.addMethod('calledWith', function() {
		var params = __slice.call(arguments)
		var fake = utils.flag(this, 'object')
		new chai.Assertion(params).assert(
		  fake.wasCalledWith.apply(fake, params)
		, 'expected fake to have been called with #{this}'
		, 'expected fake to not have been called with #{this}'
		)
	})
}

function createFake() {
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
