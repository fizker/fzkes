mocha.setup(
	{ ui: 'bdd'
	// We are checking for leaks in node, not in the browser (which is for
	// cross-browser testing anyway!)
	, ignoreLeaks: true
	}
)
