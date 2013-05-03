describe('unit/injecting-data.js', function() {
	var fake
	beforeEach(function() {
		fake = fzkes.fake()
	})
	describe('When calling a clean `fake`', function() {
		it('should do nothing', function() {
			expect(fake()).to.equal(undefined)
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
