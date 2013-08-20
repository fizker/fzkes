#!/usr/bin/env node
var fs = require('fs')
var browserify = require('browserify')

browser()

if(fs.existsSync('test')) {
	browserTests()
}

function browser() {
	browserify()
		.require('./index.js', { expose: 'fzkes' })
		.bundle(function(err, content) {
			var before =
';(function(root,factory) {\n\
if (typeof define === "function" && define.amd) {\n\
	// AMD. Register as an anonymous module.\n\
	define(factory);\n\
} else if (typeof exports === "object") {\n\
	// Node. Does not work with strict CommonJS, but\n\
	// only CommonJS-like enviroments that support module.exports,\n\
	// like Node.\n\
	module.exports = factory();\n\
} else {\n\
	// Browser globals (root is window)\n\
	root.fzkes = factory();\n\
}}(this,function(){var require;'
			var after = 'return require("fzkes")}));'
			fs.writeFileSync('browser.js', before + content + after)
		})
}

function browserTests() {
	browserify()
		.add('./test/common.js')
		.bundle()
		.pipe(fs.createWriteStream('browser-test.js'))
}
