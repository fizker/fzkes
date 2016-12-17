var decircularize = require('decircularize')
var isFake = require('./is-fake')

module.exports = attachToChai

var __slice = Array.prototype.slice

function assertIsFake(fake) {
	if(!isFake(fake)) {
		throw new Error(`\`${fake}\` is not a fake`)
	}
}

function attachToChai(chai, utils) {
	chai.Assertion.addChainableMethod('called', function(expectedCallCount) {
		var fake = utils.flag(this, 'object')
		var actualCallCount = fake.callCount
		var expected = expectedCallCount + (expectedCallCount == 1 ? ' time' : ' times' )
		var actual = actualCallCount + (actualCallCount == 1 ? ' time' : ' times' )
		this.assert(
		  actualCallCount == expectedCallCount
		, 'expected `' + fake._name + '` to have been called ' + expected + ', but it was called ' + actual
		, 'expected `' + fake._name + '` to not have been called ' + expected + ', but it was'
		)
	}, function() {
		var fake = utils.flag(this, 'object')
		assertIsFake(fake)

		this.assert(
		  fake.wasCalled()
		, 'expected `' + fake._name + '` to have been called'
		, 'expected `' + fake._name + '` to not have been called'
		)
	})
	chai.Assertion.addMethod('calledWith', function() {
		var params = __slice.call(arguments)
		var paramsAsString = formatCall(params)
		var fake = utils.flag(this, 'object')
		assertIsFake(fake)

		var callsAsString = formatCalls(fake._calls)
		this.assert(
		  fake.wasCalledWith.apply(fake, params)
		, 'expected `' + fake._name + '` to have been called with ' + paramsAsString + callsAsString
		, 'expected `' + fake._name + '` to not have been called with ' + paramsAsString
		)
	})
	chai.Assertion.addMethod('calledWithExactly', function() {
		var params = __slice.call(arguments)
		var paramsAsString = formatCall(params)
		var fake = utils.flag(this, 'object')
		assertIsFake(fake)

		var callsAsString = formatCalls(fake._calls)
		this.assert(
		  fake.wasCalledWithExactly.apply(fake, params)
		, 'expected `' + fake._name + '` to have been called with exactly ' + paramsAsString + callsAsString
		, 'expected `' + fake._name + '` to not have been called with exactly ' + paramsAsString
		)
	})

	function formatCall(params) {
		return JSON.stringify(params ? decircularize(params) : params)
	}
	function formatCalls(calls) {
		calls = calls.map(formatCall)
		var callsAsString = ', but was never called'
		if(calls.length) {
			callsAsString = ', but was called with:\n' + calls.join('\n')
		}
		return callsAsString
	}
}
