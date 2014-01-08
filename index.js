module.exports = require('./src/chai')

module.exports.fake = createFake
module.exports.fakeAll = fakeAll
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

function fakeAll(obj, opts) {
	if(!opts) opts = {}
	Object.keys(obj).forEach(function(key) {
		if(typeof(obj[key]) == 'function') {
			var fake = this.fake(obj, key)
			switch(opts.action) {
				case 'none':
					break
				case 'throws':
					fake.throws(new Error('Fake not overridden'))
					break
				default:
					fake.callsOriginal()
					break
			}
		}
	}, this)
}
