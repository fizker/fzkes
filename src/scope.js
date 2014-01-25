module.exports = createScope

var __slice = Array.prototype.slice

function createScope() {
	var subs = []

	return { fake: sub(require('./fake'))
	       , scope: sub(createScope)
	       , restore: restoreSub
	       , reset: resetSub
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

	function sub(fn) {
		return function() {
			var sub = fn.apply(null, arguments)
			subs.push(sub)
			return sub
		}
	}
}
