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

	fake.restore()


### Injecting data

	fake.returns('abc')
	fake.throws(new Error('some error'))
	fake.calls(function() { console.log('was called') })
	fake.withArgs(1,2).returns(3)
	fake.withArgs(1,2).callsOriginal()

	// If it replaced a function on an object:
	fake.callsOriginal()


### Asserting

	fake.wasCalled()
	fake.wasCalledWith(1, 2, 3)
	fake.callCount == 2


### Using with `chai`

	chai.use(fzkes.chai)
	fake.should.have.been.called // at least once
	fake.should.have.been.called(2) // precisely 2 times
	fake.should.have.been.calledWith(1,2,3)


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
- A way to call the last function passed as a parameter (node callback style)
- A way to call the first function passed as a parameter
- A way to call a specific parameter as if it was a function
- A way to call a function (any of the above) on the next tick instead of
  immediately
- <s>A way to restore the system after a fake</s>
- A way to easily set up and restore multiple fakes

All the ways to inject data into the system should allow setting both future
calls and to the last call received. The only exceptions are the throw and
return parts, which only makes sense for future calls.

<s>All ways (really all this time around) should allow for specific parameters to be
required before taking effect, allowing for handling more complex interactions.</s>
