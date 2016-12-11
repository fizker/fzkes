var createFake = require('./fake')

module.exports = createScope

var __slice = Array.prototype.slice

function createScope() {
	var subs = []

	return {
		fake: sub(createFake),
		scope: sub(createScope),
		reset: resetSub,
		restore: restoreSub,
	}

	function restoreSub() {
		subs.forEach(function(sub) {
			sub.restore()
		})
	}

	function resetSub() {
		subs.forEach(function(sub) {
			sub.reset()
		})
	}

	function sub(factory) {
		return function() {
			var sub = factory.apply(null, arguments)
			subs.push(sub)
			return sub
		}
	}
}
