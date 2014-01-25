describe('unit/faking.js', function() {
	describe('When `fzkes.fakeAll(obj)` is called', function() {
		var obj
		var originalObj
		beforeEach(function() {
			var a = fzkes.fake('original-a').returns(1)
			var c = fzkes.fake('original-c').returns(3)
			var e = fzkes.fake('original-e').returns(5)
			originalObj =
				{ a: a
				, b: 1
				, c: c
				, d: 2
				, e: e
				}
			obj =
				{ a: a
				, b: 1
				, c: c
				, d: 2
				, e: e
				}
		})

		describe('without any options', function() {
			beforeEach(function() {
				fzkes.fakeAll(obj)
			})
			it('should fake all functions on `obj`', function() {
				obj.should.have.property('a').not.equal(originalObj.a)
				obj.should.have.property('b').equal(1)
				obj.should.have.property('c').not.equal(originalObj.b)
				obj.should.have.property('d').equal(2)
				obj.should.have.property('e').not.equal(originalObj.c)
			})
			it('should call the original per default', function() {
				obj.a()
				originalObj.a.should.have.been.called
			})
		})

		describe('and a default action is supplied as an option', function() {
			describe('and the default is `none`', function() {
				beforeEach(function() {
					fzkes.fakeAll(obj, { action: 'none' })
				})
				it('should fake all functions on `obj`', function() {
					obj.should.have.property('a').not.equal(originalObj.a)
					obj.should.have.property('b').equal(1)
					obj.should.have.property('c').not.equal(originalObj.b)
					obj.should.have.property('d').equal(2)
					obj.should.have.property('e').not.equal(originalObj.c)
				})
				it('should do nothing', function() {
					obj.c()
					originalObj.c.should.not.have.been.called
				})
			})

			describe('and the default action is `callsOriginal`', function() {
				beforeEach(function() {
					fzkes.fakeAll(obj, { action: 'callsOriginal' })
				})
				it('should fake all functions on `obj`', function() {
					obj.should.have.property('a').not.equal(originalObj.a)
					obj.should.have.property('b').equal(1)
					obj.should.have.property('c').not.equal(originalObj.b)
					obj.should.have.property('d').equal(2)
					obj.should.have.property('e').not.equal(originalObj.c)
				})
				it('should call the original', function() {
					obj.e()
					originalObj.e.should.have.been.called
				})
			})

			describe('and the default action is `throws`', function() {
				beforeEach(function() {
					fzkes.fakeAll(obj, { action: 'throws' })
				})
				it('should fake all functions on `obj`', function() {
					obj.should.have.property('a').not.equal(originalObj.a)
					obj.should.have.property('b').equal(1)
					obj.should.have.property('c').not.equal(originalObj.b)
					obj.should.have.property('d').equal(2)
					obj.should.have.property('e').not.equal(originalObj.c)
				})
				it('should throw a `Fake not overridden` error', function() {
					expect(function() {
						obj.a()
					}).to.throw('Fake not overridden')
				})
			})
		})
	})

	describe('When `fake()` is called with a function', function() {
		var fn
		var fake

		beforeEach(function() {
			fn = fzkes.fake('original')
			fake = fzkes.fake(fn)
		})
		describe('and the fake is called', function() {
			beforeEach(function() {
				fake()
			})
			it('should automatically call the original', function() {
				fn.should.have.been.called
			})
		})
	})

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

		describe('and `reset()` is called on the fake', function() {
			beforeEach(function() {
				obj.a(1, 'a')
				fake.reset()
			})
			it('should keep the original faked', function() {
				expect(obj.a).not.to.equal(fn)
				expect(obj.a).to.equal(fake)
			})
		})

		describe('and `reset()` is called on `fzkes`', function() {
			beforeEach(function() {
				obj.a(1, 'a')
				fzkes.reset()
			})
			it('should not restore any fakes', function() {
				expect(obj.a).not.to.equal(fn)
				expect(obj.a).to.equal(fake)
			})
		})
	})
})
