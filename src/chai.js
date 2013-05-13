module.exports = attachToChai

var __slice = Array.prototype.slice

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
		this.assert(
		  fake.wasCalled()
		, 'expected `' + fake._name + '` to have been called'
		, 'expected `' + fake._name + '` to not have been called'
		)
	})
	chai.Assertion.addMethod('calledWith', function() {
		var params = __slice.call(arguments)
		var fake = utils.flag(this, 'object')
		this.assert(
		  fake.wasCalledWith.apply(fake, params)
		, 'expected `' + fake._name + '` to have been called with #{this}'
		, 'expected `' + fake._name + '` to not have been called with #{this}'
		)
	})
	chai.Assertion.addMethod('calledWithExactly', function() {
		var params = __slice.call(arguments)
		var fake = utils.flag(this, 'object')
		this.assert(
		  fake.wasCalledWithExactly.apply(fake, params)
		, 'expected `' + fake._name + '` to have been called with exactly #{this}'
		, 'expected `' + fake._name + '` to not have been called with exactly #{this}'
		)
	})
}
