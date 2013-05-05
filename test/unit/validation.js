describe('unit/validation.js', function() {
	var fake
	beforeEach(function() {
		fake = fzkes.fake()
	})
	describe('When a fake have not been called', function() {
		it('should have a call count of 0', function() {
			expect(fake).to.have.property('callCount', 0)
		})
		it('should return false for `wasCalled()`', function() {
			expect(fake.wasCalled()).to.equal(false)
		})
	})
	describe('When a fake have been called', function() {
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
	})
})
