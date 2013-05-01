fzkes
=====

A faking library

I must immediately apologize for the name; it is a horrible pun combining `fzk`
(a shortening of the name of my compay) and `fakes`. But it does ring clear,
and I want it to be short and unique. So there it is.


Features
--------

The features rotate around two simple concepts:

1. Getting data into the system (controlling the flow and provoking actions)
2. Getting data out of the system (in order to validate)

This is a simple list of the features I want this to have:

- Replace a function
- A way to verify that the fake was called, and with the expected parameters
- A way to have it execute a specific function
- A way to have it execute the original function
- A way to return a specific value
- A way to throw a specific error
- A way to call the last function passed as a parameter (node callback style)
- A way to call the first function passed as a parameter
- A way to call a specific parameter as if it was a function
- A way to call a function (any of the above) on the next tick instead of
  immediately

All the ways to inject data into the system should allow setting both future
calls and to the last call received. The only exceptions are the throw and
return parts, which only makes sense for future calls.
