module.exports = require('./src/chai')

module.exports.fake = createFake
module.exports.scope = createScope
module.exports.restore = restoreAll
module.exports.chai = function() {
	console.warn('`chai.use(fzkes.chai)` is deprecated, please use `chai.use(fzkes)` going forward.')
	module.exports.apply(null, arguments)
}
module.exports.version = require('./package.json').version

var __slice = Array.prototype.slice
var getFake = require('./src/fake')
var getScope = require('./src/scope')

var fakes = []
function restoreAll() {
	fakes.forEach(function(fake) {
		fake.restore()
	})
	fakes = []
}

function createScope() {
	var scope = getScope()
	fakes.push(scope)
	return scope
}

function createFake(target, property) {
	var fake = getFake(target, property)
	fakes.push(fake)
	return fake
}
