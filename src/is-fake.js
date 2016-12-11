module.exports = function isFake(maybeFake) {
	return typeof(maybeFake.calls) === 'function'
		&& typeof(maybeFake.wasCalled) === 'function'
}
