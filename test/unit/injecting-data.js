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
		beforeEach(function() {
			returnValue = null
			firstCB = fzkes.fake('first callback')
			lastCB = fzkes.fake('last callback')
		})
		describe('with `async: false` and `arg: first`', function() {
			beforeEach(function() {
				returnValue = fake.callsArg({ async: false, arguments: [ 1, 2 ], arg: 'first' })
				fake(123, 'abc', firstCB, lastCB)
			})
			it('should return the fake', function() {
				expect(returnValue).to.equal(fake)
			})
			it('should call the right callback', function() {
				expect(firstCB).to.have.been.called
				expect(lastCB).to.not.have.been.called
			})
			it('should pass the arguments along', function() {
				firstCB.should.have.been.calledWithExactly(1, 2)
			})
		})
		describe('with `async: false` and `arg: last`', function() {
			beforeEach(function() {
				returnValue = fake.callsArg({ async: false, arguments: [ 1, 2 ], arg: 'last' })
				fake(123, 'abc', firstCB, lastCB)
			})
			it('should return the fake', function() {
				expect(returnValue).to.equal(fake)
			})
			it('should call the right callback', function() {
				expect(firstCB).to.not.have.been.called
				expect(lastCB).to.have.been.called
			})
			it('should pass the arguments along', function() {
				lastCB.should.have.been.calledWithExactly(1, 2)
			})
		})
		describe('with `async: false` and no `arg` option', function() {
			beforeEach(function() {
				returnValue = fake.callsArg({ async: false })
				fake(123, 'abc', firstCB, lastCB)
			})
			it('should return the fake', function() {
				expect(returnValue).to.equal(fake)
			})
			it('should default to the last callback', function() {
				expect(firstCB).to.not.have.been.called
				expect(lastCB).to.have.been.called
			})
		})
		describe('with `async: false` and `arg: 2`', function() {
			var cb
			beforeEach(function() {
				cb = fzkes.fake()
				returnValue = fake.callsArg({ async: false, arg: 2 })
				fake(123, firstCB, cb, lastCB)
			})
			it('should return the fake', function() {
				expect(returnValue).to.equal(fake)
			})
			it('should call the right callback', function() {
				expect(firstCB).to.not.have.been.called
				expect(cb).to.have.been.called
				expect(lastCB).to.not.have.been.called
			})
		})
		describe('with `async: true`', function() {
			beforeEach(function() {
				returnValue = fake.callsArg({ async: true, arguments: [1,2] })
				fake(firstCB)
			})
			it('should return the fake', function() {
				expect(returnValue).to.equal(fake)
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
