module.exports =
{ fake: createFake
, scope: createScope
, restore: restoreAll
, chai: require('./src/chai')
, version: require('./package.json').version
}

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
