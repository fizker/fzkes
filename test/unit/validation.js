describe('unit/validation.js', function() {
	var testData
	var fake
	beforeEach(function() {
		fake = fzkes.fake()
		testData = {
			fake
		}
	})

	describe('Asserting against a circular structure', () => {
		beforeEach(() => {
			var input = { a: {}, b: 1 }
			input.a = input
			fake(input)
			testData.circularStructure = { b: 1 }
			testData.circularStructure.a = testData.circularStructure
		})
		describe('with `wasCalledWith()`', () => {
			it('should pass if asserting against other props', () => {
				expect(fake.wasCalledWith({ b: 1 })).to.be.true
			})
			it('should fail with a warning about circular structures in test data', () => {
				expect(() => {
					fake.wasCalledWith(testData.circularStructure)
				}).to.throw(/circular structures.*not supported/i)
			})
		})
		describe('with `wasCalledWithExactly()`', () => {
			it('should not throw if asserting against other props', () => {
				expect(() => {
					fake.wasCalledWith({ b: 1 })
				}).to.not.throw()
			})
			it('should fail with a warning about circular structures in test data', () => {
				expect(() => {
					fake.wasCalledWithExactly(testData.circularStructure)
				}).to.throw(/circular structures.*not supported/i)
			})
		})
	})

	describe('When a fake have not been called', function() {
		it('should have a call count of 0', function() {
			expect(fake).to.have.property('callCount', 0)
		})
		it('should return false for `wasCalled()`', function() {
			expect(fake.wasCalled()).to.equal(false)
		})
		it('should return false for `wasCalledWith({})`', () => {
			expect(fake.wasCalledWith({})).to.equal(false)
			expect(fake).to.not.have.been.calledWith({ a: { b: {} } })
		})
	})

	describe('When a fake have been called with (123, "abc")', function() {
		beforeEach(function() {
			fake(123, 'abc')
		})
		it('should report the correct call count', function() {
			expect(fake).to.have.property('callCount', 1)
		})
		it('should return true for `wasCalled()`', function() {
			expect(fake.wasCalled()).to.equal(true)
		})
		it('should return true for `wasCalledWith(123, "abc")`', function() {
			expect(fake.wasCalledWith(123, 'abc')).to.equal(true)
		})
		it('should return false for `wasCalledWith("abc", 123)`', function() {
			expect(fake.wasCalledWith('abc', 123)).to.equal(false)
		})
		it('should return true for `wasCalledWith(123)`', function() {
			expect(fake.wasCalledWith(123)).to.equal(true)
		})
		it('should return false for `wasCalledWithExactly(123)`', function() {
			expect(fake.wasCalledWithExactly(123)).to.be.false
		})
		it('should return true for `wasCalledWithExactly(123, "abc")`', function() {
			expect(fake.wasCalledWithExactly(123, 'abc')).to.be.true
		})
		it('should return false for `wasCalledWith({})`', () => {
			expect(fake.wasCalledWith({})).to.equal(false)
		})

		describe('and `fake.reset()` is called', function() {
			beforeEach(function() {
				fake.reset()
			})
			it('should reset all calls on the fake', function() {
				expect(fake).not.to.have.been.called
				expect(fake.callCount).to.equal(0)
			})
		})

		describe('and `fzkes.reset()` is called', function() {
			var wasCalled
			beforeEach(function() {
				wasCalled = false
				fake.reset = function() { wasCalled = true }
				fzkes.reset()
			})
			it('should call `fake.reset()` behind the scenes', function() {
				expect(wasCalled).to.be.true
			})
		})

		describe('with an object', function() {
			beforeEach(function() {
				fake({ a: 1, b: [ 2, { c: 3 } ] })
			})
			it('should match `wasCalledWith` deeply', function() {
				expect(fake.wasCalledWith({ a: 1, b: [ 2, { c: 3 } ] })).to.be.true
			})
			it('should return false for `wasCalledWith({})`', () => {
				expect(fake.wasCalledWith({ a: { b: {} } })).to.equal(false)
			})
		})

		describe('with no parameters at first', function() {
			beforeEach(function() {
				fake()
			})
			describe('and then evaluated against an object', function() {
				beforeEach(function() {
					fake({ a: 1 })
				})
				it('should correctly match against all calls', function() {
					expect(fake.wasCalledWith({ a: 1 })).to.be.true
				})
			})
		})
	})
})
