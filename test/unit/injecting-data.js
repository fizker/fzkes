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
		beforeEach(function() {
			firstCB = fzkes.fake('first callback')
			lastCB = fzkes.fake('last callback')
		})
		describe('with `async: false` and `arg: first`', function() {
			beforeEach(function() {
				fake.callsArg({ async: false, arguments: [ 1, 2 ], arg: 'first' })
				fake(123, 'abc', firstCB, lastCB)
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
				fake.callsArg({ async: false, arguments: [ 1, 2 ], arg: 'last' })
				fake(123, 'abc', firstCB, lastCB)
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
				fake.callsArg({ async: false })
				fake(123, 'abc', firstCB, lastCB)
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
				fake.callsArg({ async: false, arg: 2 })
				fake(123, firstCB, cb, lastCB)
			})
			it('should call the right callback', function() {
				expect(firstCB).to.not.have.been.called
				expect(cb).to.have.been.called
				expect(lastCB).to.not.have.been.called
			})
		})
		describe('with `async: true`', function() {
			beforeEach(function() {
				fake.callsArg({ async: true, arguments: [1,2] })
				fake(firstCB)
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
	describe('When asking a fake to call a specific function', function() {
		var wasCalled
		var params
		beforeEach(function() {
			wasCalled = false
			params = null
			fake.calls(function() {
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
	})
	describe('When asking a fake to return values', function() {
		it('should then return the requested value', function() {
			fake.returns('abc')
			expect(fake()).to.equal('abc')
		})
	})
	describe('When asking a fake to throw', function() {
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
