describe('integration/chai.js', function() {
	var fake
	beforeEach(function() {
		fake = fzkes.fake()
		chai.use(fzkes)
	})
	describe('When asserting for `called`', function() {
		it('should pass if the fake have been called', function() {
			fake()
			expect(function() {
				expect(fake).to.have.been.called
			}).not.to.throw()
		})
		it('should fail if the fake have not been called', function() {
			expect(function() {
				expect(fake).to.have.been.called
			}).to.throw()
		})
		describe('and using `not`', function() {
			it('should not pass if the fake have been called', function() {
				fake()
				expect(function() {
					expect(fake).not.to.have.been.called
				}).to.throw()
			})
			it('should not fail if the fake have not been called', function() {
				expect(function() {
					expect(fake).not.to.have.been.called
				}).not.to.throw()
			})
		})
	})
	describe('When asserting for `calledWithExactly`', function() {
		it('should pass if the parameters match', function() {
			fake(1, 2)
			expect(function() {
				expect(fake).to.have.been.calledWithExactly(1, 2)
			}).not.to.throw()
		})
		it('should fail if the parameters does not match', function() {
			fake(1, 2)
			expect(function() {
				expect(fake).to.have.been.calledWithExactly(1)
			}).to.throw()
		})
		describe('and using `not`', function() {
			it('should not pass if the parameters match', function() {
				fake(1, 2)
				expect(function() {
					expect(fake).not.to.have.been.calledWithExactly(1, 2)
				}).to.throw()
			})
			it('should not fail if the parameters does not match', function() {
				fake(1, 2)
				expect(function() {
					expect(fake).not.to.have.been.calledWithExactly('a', 'b')
				}).not.to.throw()
			})
		})
	})
	describe('When asserting for `calledWith`', function() {
		it('should pass if the parameters match', function() {
			fake(1, 2)
			expect(function() {
				expect(fake).to.have.been.calledWith(1, 2)
			}).not.to.throw()
		})
		describe('and failing', function() {
			beforeEach(function() {
				fake(1, 2)
			})
			it('should throw', function() {
				expect(function() {
					expect(fake).to.have.been.calledWith('a', 'b')
				}).to.throw()
			})
			describe('then the error-message', function() {
				var error
				beforeEach(function() {
					try {
						expect(fake).to.have.been.calledWith('a', 'b')
					} catch(e) {
						error = e
					}
				})
				it('should tell what it was expecting', function() {
					expect(error.message)
						.to.match(/^expected `fake` to have been called with \["a","b"\]/)
				})
				it('should tell what it was called with', function() {
					expect(error.message)
						.to.match(/but was called with:\n\[1,2\]/)
				})
			})
		})
		describe('and using `not`', function() {
			it('should fail if the parameters match', function() {
				fake(1, 2)
				expect(function() {
					expect(fake).not.to.have.been.calledWith(1, 2)
				}).to.throw()
			})
			it('should not fail if the parameters does not match', function() {
				fake(1, 2)
				expect(function() {
					expect(fake).not.to.have.been.calledWith('a', 'b')
				}).not.to.throw()
			})
		})
	})
	describe('When asserting the call count', function() {
		it('should pass if the count matches', function() {
			fake()
			fake()
			expect(function() {
				expect(fake).to.have.been.called(2)
			}).to.not.throw()
		})
		it('should fail if the count does not match', function() {
			fake()
			expect(function() {
				expect(fake).to.have.been.called(2)
			}).to.throw()
		})
	})
})
