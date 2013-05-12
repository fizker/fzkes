#!/usr/bin/env node
var glob = require('glob')
var fs = require('fs')

var files = glob.sync('test/*/**/*.js')
var scripts = files
	.map(function(f) {
		return '<script src=' + f.replace(/^test\//, '') + '></script>'
	})
	.join('\n')
var tmpl = fs.readFileSync('./test/browser.mustache', 'utf8')
var html = tmpl.replace('{{{scripts}}}', scripts)
fs.writeFileSync('./test/browser.html', html)

var browserify = require('browserify')
browserify()
	.require('./index.js', { expose: 'fzkes' })
	.bundle()
	.pipe(fs.createWriteStream('browser.js'))

browserify()
	.external('./index.js')
	.add('./test/common.js')
	.bundle()
	.pipe(fs.createWriteStream('browser-test.js'))
