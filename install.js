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
		.bundle()
		.pipe(fs.createWriteStream('browser.js'))
}

function browserTests() {
	var glob = require('glob')
	var files = glob.sync('test/*/**/*.js')
	var scripts = files
		.map(function(f) {
			return '<script src=' + f.replace(/^test\//, '') + '></script>'
		})
		.join('\n')
	var tmpl = fs.readFileSync('./test/browser.mustache', 'utf8')
	var html = tmpl.replace('{{{scripts}}}', scripts)
	fs.writeFileSync('./test/browser.html', html)

	browserify()
		.external('./index.js')
		.add('./test/common.js')
		.bundle()
		.pipe(fs.createWriteStream('browser-test.js'))
}
