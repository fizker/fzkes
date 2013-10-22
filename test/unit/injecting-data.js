describe('unit/injecting-data.js', function() {
	var fake
	beforeEach(function() {
		fake = fzkes.fake()
	})
	describe('When calling a clean `fake`', function() {
		it('should return nothing', function() {
			expect(fake()).to.equal(undefined)
		})
	})
	describe('When calling `callsArg()`', function() {
		var firstCB
		var lastCB
		var returnValue
		var actionResult
		beforeEach(function() {
			returnValue = null
			actionResult = null
			firstCB = fzkes.fake('first callback')
			lastCB = fzkes.fake('last callback')
		})
		describe('with no arguments', function() {
			beforeEach(function() {
				fake.callsArg()
				fake(firstCB, lastCB)
			})
			it('should call the last callback immediately', function() {
				lastCB.should.have.been.called
			})
		})
		describe('with `notify` set to a function', function() {
			var notifier
			beforeEach(function() {
				notifier = fzkes.fake('notifier').returns('a1')
				fake.callsArg({ notify: notifier })
				firstCB.returns('abc')
				returnValue = fake(123, firstCB)
			})
			it('should call the function when the called arg returns', function() {
				notifier.should.have.been.called
			})
			it('should pass the returned object along as the second parameter', function() {
				notifier.should.have.been.calledWith(null, 'abc')
			})
			it('should return what the notifier returns', function() {
				expect(returnValue).to.equal('a1')
			})
			describe('and the callback throws', function() {
				var action
				beforeEach(function() {
					firstCB.throws('error')
					action = function() { fake(123, firstCB) }
				})
				it('should throw the error along', function() {
					action.should.throw('error')
				})
				it('should pass the thrown object as the first parameter', function() {
					try { action() } catch(e) {}
					notifier.should.have.been.calledWithExactly('error')
				})
			})
			describe('and `notify` throws', function() {
				var action
				beforeEach(function() {
					notifier.throws('error')
					action = function() { fake(firstCB) }
				})
				it('should not call `notify` with the new error', function() {
					try { action() } catch(e) {}
					notifier.should.not.have.been.calledWith('error')
				})
				it('should cascade the error', function() {
					action.should.throw('error')
				})
				it('should still call the callback', function() {
					firstCB.should.have.been.called
				})
			})
		})
		describe('with `returns: val` and `notify: function`', function() {
			var val
			var notifier
			beforeEach(function() {
				notifier = fzkes.fake('notifier').returns('a1')
				val = {}
				fake.callsArg({ returns: val, notify: notifier })
				returnValue = fake(firstCB)
			})
			it('should return `val`', function() {
				expect(returnValue).to.equal(val)
			})
		})
		describe('with `async: false` and `arg: first`', function() {
			beforeEach(function() {
				actionResult = fake.callsArg({ async: false, arguments: [ 1, 2 ], arg: 'first' })
				firstCB.returns('a1')
				returnValue = fake(123, 'abc', firstCB, lastCB)
			})
			it('should return the fake', function() {
				expect(actionResult).to.equal(fake)
			})
			it('should call the right callback', function() {
				expect(firstCB).to.have.been.called
				expect(lastCB).to.not.have.been.called
			})
			it('should pass the arguments along', function() {
				firstCB.should.have.been.calledWithExactly(1, 2)
			})
			it('should return `undefined`', function() {
				expect(returnValue).to.be.undefined
			})
		})
		describe('with `async: false` and `arg: last`', function() {
			beforeEach(function() {
				actionResult = fake.callsArg({ async: false, arguments: [ 1, 2 ], arg: 'last' })
				lastCB.returns('a1')
				returnValue = fake(123, 'abc', firstCB, lastCB)
			})
			it('should return the fake', function() {
				expect(actionResult).to.equal(fake)
			})
			it('should call the right callback', function() {
				expect(firstCB).to.not.have.been.called
				expect(lastCB).to.have.been.called
			})
			it('should pass the arguments along', function() {
				lastCB.should.have.been.calledWithExactly(1, 2)
			})
			it('should return `undefined`', function() {
				expect(returnValue).to.be.undefined
			})
		})
		describe('with `async: false` and no `arg` option', function() {
			beforeEach(function() {
				actionResult = fake.callsArg({ async: false })
				lastCB.returns('a1')
				returnValue = fake(123, 'abc', firstCB, lastCB)
			})
			it('should return the fake', function() {
				expect(actionResult).to.equal(fake)
			})
			it('should default to the last callback', function() {
				expect(firstCB).to.not.have.been.called
				expect(lastCB).to.have.been.called
			})
			it('should return `undefined`', function() {
				expect(returnValue).to.be.undefined
			})
		})
		describe('with `async: false` and `arg: 2`', function() {
			var cb
			beforeEach(function() {
				cb = fzkes.fake()
				actionResult = fake.callsArg({ async: false, arg: 2 })
				cb.returns('a1')
				returnValue = fake(123, firstCB, cb, lastCB)
			})
			it('should return the fake', function() {
				expect(actionResult).to.equal(fake)
			})
			it('should call the right callback', function() {
				expect(firstCB).to.not.have.been.called
				expect(cb).to.have.been.called
				expect(lastCB).to.not.have.been.called
			})
			it('should return `undefined`', function() {
				expect(returnValue).to.be.undefined
			})
		})
		describe('with `async: true`', function() {
			beforeEach(function() {
				actionResult = fake.callsArg({ async: true, arguments: [1,2] })
				returnValue = fake(firstCB)
			})
			it('should return the fake', function() {
				expect(actionResult).to.equal(fake)
			})
			it('should not call it immediately', function(done) {
				expect(firstCB).to.not.have.been.called
				firstCB.calls(done.bind(null, null))
			})
			it('should still pass arguments along correctly', function(done) {
				firstCB.calls(function() {
					firstCB.should.have.been.calledWith(1,2)
					done()
				})
			})
			it('should return `undefined`', function() {
				expect(returnValue).to.be.undefined
			})
		})
		describe('with `async: true` and `returns: val`', function() {
			var val
			beforeEach(function() {
				val = {}
				fake.callsArg({ async: true, returns: val })
				returnValue = fake(firstCB)
			})
			it('should return `val`', function() {
				expect(returnValue).to.equal(val)
			})
		})
		describe('with `async: false` and `returns: val`', function() {
			var val
			beforeEach(function() {
				val = {}
				fake.callsArg({ async: false, returns: val })
				returnValue = fake(firstCB)
			})
			it('should return `val`', function() {
				expect(returnValue).to.equal(val)
			})
		})
		describe('with `now: true`', function() {
			beforeEach(function() {
				fake(firstCB)
				returnValue = fake.callsArg({ now: true })
			})
			it('should return the fake', function() {
				expect(returnValue).to.equal(fake)
			})
			it('should be called immediately', function() {
				firstCB.should.have.been.called
			})
		})
		describe('with `now: true` and `async: true`', function() {
			beforeEach(function() {
				fake(firstCB)
				returnValue = fake.callsArg({ now: true, async: true, arguments: [ 1, 2 ] })
			})
			it('should return the fake', function() {
				expect(returnValue).to.equal(fake)
			})
			it('should not call the callback immediately', function() {
				firstCB.should.not.have.been.called
			})
			it('should still pass arguments along', function(done) {
				firstCB.calls(function() {
					firstCB.should.have.been.calledWith(1, 2)
					done()
				})
			})
		})
	})
	describe('When calling `withArgs()`', function() {
		var constrained
		beforeEach(function() {
			constrained = fake.withArgs(1, 2)
		})
		describe('and calling `returns()`', function() {
			beforeEach(function() {
				fake.returns(123)
				constrained.returns('abc')
			})
			it('should return the general if the parameters does not match', function() {
				expect(fake('a', 'b')).to.equal(123)
			})
			it('should return the specific if the arguments match', function() {
				expect(fake(1, 2)).to.equal('abc')
			})
			it('should return the specific even if more argments are passed than required', function() {
				expect(fake(1,2,3)).to.equal('abc')
			})
			it('should return the original fake', function() {
				expect(constrained.returns('abc')).to.equal(fake)
			})
		})
		describe('with the same args', function() {
			it('should reuse the same fake', function() {
				var _1 = fake.withArgs(1)
				var _2 = fake.withArgs(1)
				expect(_1).to.equal(_2)
			})
		})
		describe('with increasing restriction of args', function() {
			var _1, _2
			beforeEach(function() {
				fake = fzkes.fake()
				_1 = fake.withArgs(1)
				_2 = fake.withArgs(1, 2)
				_3 = fake.withArgs(3, 4)
				_4 = fake.withArgs(3)
			})
			it('should use two different fakes (least no of args first)', function() {
				expect(_1).to.not.equal(_2)
			})
			it('should use two different fakes (least no of args last)', function() {
				expect(_3).to.not.equal(_4)
			})
			it('should call the most closely matched fake only (least no of args first)', function() {
				fake(1, 2)
				_1.should.not.have.been.called
				_2.should.have.been.called
			})
			it('should call the most closely matched fake only (least no of args last)', function() {
				fake(3, 4)
				_3.should.have.been.called
				_4.should.not.have.been.called
			})
		})
	})
	describe('When calling `withComplexArgs()`', function() {
		var constrained
		beforeEach(function() {
			constrained = fake.withComplexArgs({ value: null }, null, { value: 2 }, { regex: /ab?c/ })
			fake.returns(1)
		})
		describe('with a null value', function() {
			beforeEach(function() {
				constrained = fake.withComplexArgs(null, { value: 2 })
				constrained.returns(2)
			})
			it('should ignore the first parameter for the match', function() {
				expect(fake(2,1)).to.equal(1)
				expect(fake(1,2)).to.equal(2)
			})
		})
		describe('with no known properties set', function() {
			beforeEach(function() {
				constrained = fake.withComplexArgs({ abc: 123 })
				constrained.returns(2)
			})
			it('should return constrained value', function() {
				expect(fake({})).to.equal(2)
			})
		})
		describe('with `value` property set', function() {
			beforeEach(function() {
				constrained = fake.withComplexArgs({ value: 1 }, { value: 2 })
				constrained.returns(2)
			})
			it('should match for those arguments', function() {
				expect(fake(1,2)).to.equal(2)
				expect(fake(2,1)).to.equal(1)
			})
		})
		describe('with `regex` property set', function() {
			beforeEach(function() {
				constrained = fake.withComplexArgs({ regex: /ab?c/ })
				constrained.returns(2)
			})
			describe('and there is another constrained', function() {
				beforeEach(function() {
					fake.withComplexArgs({ regex: /def/ }).returns(3)
				})
				it('should match the right constraint', function() {
					expect(fake('ac')).to.equal(2)
					expect(fake('def')).to.equal(3)
				})
			})
			describe('and the regex match', function() {
				it('should return constrained value', function() {
					expect(fake('ac')).to.equal(2)
				})
			})
			describe('and the regex does not match', function() {
				it('should not return constrained value', function() {
					expect(fake('ad')).to.equal(1)
				})
			})
			describe('and the function is called with a non-string', function() {
				it('should not return constrained value', function() {
					expect(fake({toString:function() {return 'ac'}})).to.equal(1)
				})
			})
		})
		describe('with the same args', function() {
			beforeEach(function() {
				constrained = fake.withComplexArgs({ regex: /abc/ }, { value: 123 })
			})
			it('should return the same constrained fake', function() {
				expect(fake.withComplexArgs({ regex: /abc/ }, { value: 123 }))
					.to.equal(constrained)
			})
		})
	})
	describe('When calling `calls()`', function() {
		var wasCalled
		var params
		var returnValue
		beforeEach(function() {
			wasCalled = false
			params = null
			returnValue = fake.calls(function() {
				wasCalled = true
				params = Array.prototype.slice.call(arguments)
				return 123
			})
		})
		it('should call the function as requested', function() {
			fake()
			expect(wasCalled).to.be.ok
		})
		it('should return the value as requested', function() {
			expect(fake()).to.equal(123)
		})
		it('should pass all parameters', function() {
			fake(1,2,'abc')
			expect(params).to.deep.equal([1,2,'abc'])
		})
		it('should return the fake', function() {
			expect(returnValue).to.equal(fake)
		})
		describe('and then calling with `null` as the argument', function() {
			beforeEach(function() {
				fake()
				fake.calls(null)
			})
			it('should start stacking unhandled functions', function() {
				fake.call()
				expect(function() {
					fake.calls(function() {}, { now: true })
				}).not.to.throw()
			})
		})
	})
	describe('When calling `calls()` with `now: true` option', function() {
		var fn
		beforeEach(function() {
			fake = fzkes.fake()
			fn = fzkes.fake()
		})
		describe('with a single call', function() {
			var returnValue
			beforeEach(function() {
				fake(123, 'abc')
				returnValue = fake.calls(fn, { now: true })
			})
			it('should call the function', function() {
				fn.should.have.been.called
			})
			it('should pass the parameters', function() {
				fn.should.have.been.calledWith(123, 'abc')
			})
			it('should return the fake', function() {
				expect(returnValue).to.equal(fake)
			})
		})
		describe('with two calls', function() {
			beforeEach(function() {
				fake(1, 'a')
				fake(2, 'b')
			})
			it('should emulate the first call first', function() {
				fake.calls(fn, { now: true })
				fn.should.have.been.calledWith(1, 'a')
			})
			it('should emulate the second call next', function() {
				fake.calls(function() {}, { now: true })
				fake.calls(fn, { now: true })
				fn.should.have.been.calledWith(2, 'b')
			})
			it('should throw on the third attempt', function() {
				fake.calls(function() {}, { now: true })
				fake.calls(function() {}, { now: true })
				expect(function() {
					fake.calls(fn, { now: true })
				}).to.throw()
			})
		})
		describe('with no calls', function() {
			it('should throw an exception', function() {
				expect(function() {
					fake.calls(fn, { now: true })
				}).to.throw()
			})
			it('should not call the passed function', function() {
				try {
					fake.calls(fn, { now: true })
				} catch(e) {}
				fn.should.not.have.been.called
			})
		})
		describe('with the fake called after calling `calls()`', function() {
			beforeEach(function() {
				fake(1, 'a')
				fake.calls(fn, { now: true })
				fake(2, 'a')
			})
			it('should not catch subsequent calls', function() {
				expect(fn.callCount).to.equal(1)
			})
		})
	})
	describe('When asking a fake to return values', function() {
		it('should return the requested value when called', function() {
			fake.returns('abc')
			expect(fake()).to.equal('abc')
		})
		it('should return the fake when setting up', function() {
			expect(fake.returns('abc')).to.equal(fake)
		})
	})
	describe('When asking a fake to throw', function() {
		it('should return the fake', function() {
			expect(fake.throws()).to.equal(fake)
		})
		it('should do that', function() {
			fake.throws()
			expect(function() { fake() }).to.throw()
		})
		describe('with a parameter', function() {
			it('should throw that object', function() {
				var o = { }
				fake.throws(o)
				try {
					fake()
				} catch(e) {
					expect(e).to.equal(o)
				}
			})
		})
	})
})
