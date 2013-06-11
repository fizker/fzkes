fzkes
=====

A faking library

I must immediately apologize for the name; it is a horrible pun combining `fzk`
(a shortening of the name of my compay) and `fakes`. But it does ring clear,
and I want it to be short and unique. So there it is.


How to use
----------

### Creating fakes

	var fzkes = require('fzkes')
	var fake = fzkes.fake()
	var fs = require('fs')
	fzkes.fake(fs, 'readFile')


### Restoring original functions

There are three ways to easily doing this, depending on the scope:

1. Restoring a single fake: `fake.restore()`
2. Restoring all fakes across the board: `fzkes.restore()`

The last is a bit more tricky; A sub-scope can be creating by calling `fzkes.scope()`.
The scope have all methods (except `chai`) that the original `fzkes` object have,
except the `restore()` function on a scope only affects fakes created within
that scope.


### Injecting data

	fake.returns('abc')
	fake.throws(new Error('some error'))
	fake.calls(function() { console.log('was called') })

	// If it replaced a function on an object:
	fake.callsOriginal()

	// Conditional injects
	fake.withArgs(1,2).returns(3)
	fake.withArgs(1,2).callsOriginal()


### Calling callbacks

	// Default is calling the last function found, node-style
	fake.callsArg()

	// It can be controlled
	fake.callsArg({ arg: 'first' })
	// 0-indexed argument list
	fake.callsArg({ arg: 1 })

	// It defaults to calling the callback immediately, but this can be changed
	fake.callsArg({ async: true })

	// Default is no parameters to the callback, but these can be controlled
	fake.callsArg({ arguments: [ 1, 2 ] })


### Emulating calls after they have been called

Sometimes, it is not feasible to prepare the fake properly; in these cases,
emulating the call after the fact makes the code much better.

`fzkes` supports this as an option for the `fake.calls()`, `fake.callsArg()` and
`fake.callsOriginal()` functions.

The code would look as the following:

	fake(1,2,3)

	fake.calls(fn, { now: true })
	fake.callsOriginal({ now: true })
	fake.callsArg({ now: true })

It works with all other options on the `fake.callsArg()` call.

It forwards the next unhandled call as it appeared on the `fake`, and throws an
exception if there are no unhandled calls:

	fake(1,2,3)
	// Goes through
	fake.callsOriginal({ now: true })

	try {
		fake.calls(fn, { now: true })
	} catch(e) {
		// e.message would say that fake had no unhandled calls.
	}

If any of the functions was called without `{ now: true }`, calls are not
considered unhandled, and any call with `{ now: true }` will throw an exception.
To begin building unhandled calls, make a `fake.calls(null)` invocation.


### Asserting

	fake.wasCalled()
	fake.wasCalledWith(1, 2, 3)
	fake.wasCalledWithExactly(1, 2, 3)
	fake.callCount == 2


### Using with [chai](http://chaijs.com)

	chai.use(fzkes)
	fake.should.have.been.called // at least once
	fake.should.have.been.called(2) // precisely 2 times
	fake.should.have.been.calledWith(1,2,3)


### Running in the browser

When installing the package, a convenience package is built using browserify.
It makes the experience of using `fzkes` in the browser similar to using it with
node; it even adds a `require` function, which responds to `require('fzkes')`.

The browser-version is located in the root folder, and is called `browser.js`.
It can either be included by `<script src="node_modules/fzkes/browser.js"></script>`,
or copied to a lib-folder of your choosing.

Then simply follow the guide above for setting it up and interacting with it.


--------

The text below here are from the original mission statement, and will be
replaced with proper documentation as some point.


Supported environments
----------------------

This should work at least in the current minor version of Node.

This should also work in modern browsers (the current version of at least Chrome,
Firefox, Safari, Opera, IE) and hopefully support can be extended to earlier
versions of browsers. I only expect issues with IE8-9, but they should be
solvable.

There are no plans to support IE7 or earlier.


Features
--------

The features rotate around two simple concepts:

1. Getting data into the system (controlling the flow and provoking actions)
2. Getting data out of the system (in order to validate)

This is a simple list of the features I want this to have:

- <s>Replace a function</s>
- <s>A way to verify that the fake was called, and with the expected parameters</s>
- <s>A way to have it execute a specific function</s>
- <s>A way to have it execute the original function</s>
- <s>A way to return a specific value</s>
- <s>A way to throw a specific error</s>
- <s>A way to call the last function passed as a parameter (node callback style)</s>
- <s>A way to call the first function passed as a parameter</s>
- <s>A way to call a specific parameter as if it was a function</s>
- <s>A way to call a function (any of the above) on the next tick instead of
  immediately</s>
- <s>A way to restore the system after a fake</s>
- <s>A way to easily set up and restore multiple fakes</s>

All the ways to inject data into the system should allow setting <s>both future
calls and to</s> the last call received. The only exceptions are the throw and
return parts, which only makes sense for future calls.

<s>All ways (really all this time around) should allow for specific parameters to be
required before taking effect, allowing for handling more complex interactions.</s>
