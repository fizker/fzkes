module.exports =
{ fake: createFake
, chai: attachToChai
, version: require('./package.json').version
}

var __slice = Array.prototype.slice

function attachToChai(chai, utils) {
	chai.Assertion.addChainableMethod('called', function(expectedCallCount) {
		var fake = utils.flag(this, 'object')
		var actualCallCount = fake.callCount
		var expected = expectedCallCount + (expectedCallCount == 1 ? ' time' : ' times' )
		var actual = actualCallCount + (actualCallCount == 1 ? ' time' : ' times' )
		this.assert(
		  actualCallCount == expectedCallCount
		, 'expected fake to have been called ' + expected + ', but it was called ' + actual
		, 'expected fake to not have been called ' + expected + ', but it was'
		)
	}, function() {
		var fake = utils.flag(this, 'object')
		this.assert(
		  fake.wasCalled()
		, 'expected ' + fake.name + ' to have been called'
		, 'expected ' + fake.name + ' to not have been called'
		)
	})
	chai.Assertion.addMethod('calledWith', function() {
		var params = __slice.call(arguments)
		var fake = utils.flag(this, 'object')
		this.assert(
		  fake.wasCalledWith.apply(fake, params)
		, 'expected fake to have been called with #{this}'
		, 'expected fake to not have been called with #{this}'
		)
	})
}

function createFake(target, property) {
	var action = function() {}
	var calls = []
	var constrainedFakes = []
	constrainedFakes.find = function(args) {
		var fake
		if(!constrainedFakes.some(function(f) {
			fake = f.fake
			return compareArrays(f.args, args)
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
	fake.__defineGetter__('_calls', function() {
		return calls
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
	fake.restore = function() {
		if(target && property) {
			target[property] = original
		}
	}
	fake.callsOriginal = function() {
		this.calls(original)
	}

	var original
	fake.name = 'fake'
	if(target && property) {
		fake.name = property
		original = target[property]
		target[property] = fake
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
