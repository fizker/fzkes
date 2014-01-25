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

	// Creating a stand-alone fake, great for use as a callback
	var fake = fzkes.fake()

	// For overriding an original function, great for restoring later
	var fs = require('fs')
	fzkes.fake(fs, 'readFile')

	// For faking all functions on an object
	fzkes.fakeAll(fs)


#### fakeAll

The `fzkes.fakeAll()` function can take an options-dictionary, allowing for
overriding the default action. The options are:

- `callsOriginal`: The default. `fake.callsOriginal()` is evoked on all fakes.
- `none`: No action is taken on the fakes.
- `throws`: A `'Fake not overridden'` exception will be evoked on all fakes.

All fakes can of course be overridden later on, the default is just what should
happen out-of-the-box.


### Resetting fakes

Resetting a fake (`fake.reset()`) will set its internal state to what it was
when it was new.

It is possible to reset all fakes by calling `fzkes.reset()` or `scope.reset()`.


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

Each action (`returns`, `throws`, `calls`, etc) returns the fake, to make it
easier to assign to return values and the like:

	fake.returns({
		a: fzkes.fake('a').returns(3),
		b: fzkes.fake('b').throws()
	})

It can also chain the withArgs() automatically:

	var fake = fzkes.fake('name')
		.returns(1)
		.withArgs(1,2).returns(3)
		.withArgs(1,3).returns(4)
		.withArgs(1,4).throws(new Error('some error'))
	fake(1,1) // => 1
	fake(1,2) // => 3
	fake(1,3) // => 4
	fake(1,4) // => throws


#### Advanced `withArgs`

There is a more advanced form of `withArgs` called `withComplexArgs`.
It allows for skipping arguments entirely, as well as defining regular expressions
to validate against strings.

	var fake = fzkes.fake('name')
		.returns(1)
		.withComplexArgs(null, { value: 2 }).returns(2)
		.withComplexArgs({ regex: /ab?c/ }).returns(3)

	fake(1, 1) // => 1
	fake(1, 2) // => 2
	fake('a', 2) // => 2
	fake('abc') // => 3
	fake('ac') // => 3


### Calling callbacks

There is a built-in helper for calling callbacks: `callsArg`. If the callback
throws an exception, the fake with throw it as well.

It can take the following options:

- `notify`: A function to notify whenever the fake is called. It is called as
  `function(error, returnValue)`, where `error` is whatever the callback threw,
  and `returnValue` is what the callback returned. If `async` is false, the fake
  will return whatever the `notify` function returns.

  This option is also perfect for [mocha][mocha] style async handlers.
- `returns`: A value to return whenever the fake is called. This takes presedence
  over the return-value of `notify`, but exceptions still triumph.
- `now`: A flag that determines if the action should occur for future calls or
  for the first unhandled call. This will throw if the fake have no unhandled
  calls.
- `async`: A flag determining if the callback should be called immediately or in
  the next tick (which would simulate an async call).
- `arg`: The argument to call. This can be the parameter index (0-n), `'first'`
  or `'last'`. It defaults to `'last'`.
- `arguments`: An array of the arguments to pass to the callback.


Examples follow:

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

[mocha]: http://visionmedia.github.io/mocha/

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

If any of the functions was set up in advance, calls are not considered
unhandled, and any call with `{ now: true }` will throw an exception.
To begin building unhandled calls, make a `fake.calls(null)` invocation.

	fake.callsOriginal()
	// this call is handled immediately
	fake()
	expect(function() {
		fake.callsOriginal({ now: true })
	}).to.throw()

	// resetting the expectations
	fake.calls(null)

	// it now works again
	fake()
	fake.callsOriginal({ now: true })


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
It adds both an AMD wrapper for use with `require` or a similar tool, and a
global version if neither `node` nor `AMD` is detected.

The browser-version is located in the root folder, and is called `browser.js`.
It can either be included by `<script src="node_modules/fzkes/browser.js"></script>`,
or copied to a lib-folder of your choosing.

Then simply follow the guide above for setting it up and interacting with it.

__NOTE:__ The 0.10 version of `browser.js` is incompatible with earlier versions,
because of how it is now wrapped. This should be for the better though.
