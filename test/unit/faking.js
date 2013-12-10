describe('unit/faking.js', function() {
	describe('When `fake(obj, name)` is called', function() {
		var fake
		var obj
		var fn

		beforeEach(function() {
			fn = fzkes.fake()
			obj = { a: fn }
			fake = fzkes.fake(obj, 'a')
		})
		it('should replace `name` on `obj`', function() {
			expect(obj.a).not.to.equal(fn)
			expect(obj.a).to.equal(fake)
		})
		it('should no longer call the original', function() {
			obj.a()
			fn.should.not.have.been.called
		})

		describe('where `name` points to a non-function', function() {
			beforeEach(function() {
				obj.a = 123
				fn = function() {
					fzkes.fake(obj, 'a')
				}
			})
			it('should throw an exception', function() {
				fn.should.throw()
			})
			it('should not replace the property', function() {
				obj.a.should.equal(123)
			})
		})

		describe('and it is told to `callsOriginal()`', function() {
			var returnValue
			beforeEach(function() {
				returnValue = fake.callsOriginal()
			})
			it('should call the original', function() {
				obj.a()
				fn.should.have.been.called
			})
			it('should return the fake', function() {
				expect(returnValue)
					.to.equal(fake)
			})
		})

		describe('and calling `callsOriginal({ now: true })`', function() {
			describe('before a call is registered', function() {
				it('should throw an exception', function() {
					expect(function() {
						fake.callsOriginal({ now: true })
					}).to.throw()
				})
			})

			describe('after a call is registered', function() {
				beforeEach(function() {
					fake(1, 'a')
					fake.callsOriginal({ now: true })
				})
				it('should call the original with the params', function() {
					fn.should.have.been.calledWith(1, 'a')
				})
			})
		})

		describe('and `restore` is called on the fake', function() {
			beforeEach(function() {
				fake.restore()
			})
			it('should restore the original', function() {
				expect(obj.a).to.equal(fn)
				expect(obj.a).not.to.equal(fake)
			})
		})

		describe('and `restore()` is called on `fzkes`', function() {
			beforeEach(function() {
				fzkes.restore()
			})
			it('should restore all fakes', function() {
				expect(obj.a).to.equal(fn)
				expect(obj.a).not.to.equal(fake)
			})
		})
	})
})
