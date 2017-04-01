describe('integration/chai.js', function() {
	var testData
	var fake
	beforeEach(function() {
		testData = {}
		fake = fzkes.fake()
		chai.use(fzkes)
	})
	describe('Asserting on a non-fake', () => {
		beforeEach(() => {
			testData.nonFake = function() {}
		})
		describe('with `called`', () => {
			it('should give a proper message', () => {
				expect(() => {
					expect(testData.nonFake).to.have.been.called(1)
				}).to.throw(/not a fake/)
			})
		})
		describe('with `calledWith`', () => {
			it('should give a proper message', () => {
				expect(() => {
					expect(testData.nonFake).to.have.been.calledWith(1)
				}).to.throw(/not a fake/)
			})
		})
		describe('with `calledWithExactly`', () => {
			it('should give a proper message', () => {
				expect(() => {
					expect(testData.nonFake).to.have.been.calledWithExactly(1)
				}).to.throw(/not a fake/)
			})
		})
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
		describe('when the fake was called with a circular structure', () => {
			beforeEach(() => {
				testData.circularStructure = { a: 1 }
				testData.circularStructure.circularRef = testData.circularStructure

				fake(testData.circularStructure)
			})

			it('should pass if asserting against other props', () => {
				expect(() => {
					expect(fake).to.have.been.calledWith({ a: 1 })
				}).to.not.throw()
			})
			it('should pass if asserting against the circular ref', () => {
				expect(fake).to.have.been.calledWith({ circularRef: { a: 1 } })
			})
		})
		describe('when `calledWith()` is called with a circular structure', () => {
			beforeEach(() => {
				testData.circularStructure = { a: 1 }
				testData.circularStructure.circularRef = testData.circularStructure

				let input = { a: 1 }
				input.circularRef = input
				fake(input)
			})
			it('should fail with a warning about circular structures in test data', () => {
				expect(() => {
					expect(fake).to.have.been.calledWith(testData.circularStructure)
				}).to.throw(/circular structures.*not supported/i)
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
