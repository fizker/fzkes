describe('unit/injecting-data.js', function() {
	describe('When calling `fzkes.fake()`', function() {
		it('should return a function', function() {
			expect(fzkes.fake()).to.be.a('function')
		})
		it('should do nothing when called', function() {
			var fake = fzkes.fake()
			expect(fake()).to.equal(undefined)
		})
	})
	describe('When asking a fake to call a specific function', function() {
		var fake
		var wasCalled
		var params
		beforeEach(function() {
			fake = fzkes.fake()
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
		var fake
		beforeEach(function() {
			fake = fzkes.fake()
		})
		it('should have a function called `returns`', function() {
			expect(fake.returns).to.be.a('function')
		})
		it('should then return the requested value', function() {
			fake.returns('abc')
			expect(fake()).to.equal('abc')
		})
	})
})
