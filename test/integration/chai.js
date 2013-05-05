describe('integration/chai.js', function() {
	var fake
	beforeEach(function() {
		fake = fzkes.fake()
		chai.use(fzkes.chai)
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
	})
	describe('When asserting for `calledWith`', function() {
		it('should pass if the parameters match', function() {
			fake(1, 2)
			expect(function() {
				expect(fake).to.have.been.calledWith(1, 2)
			}).not.to.throw()
		})
		it('should fail if the parameters does not match', function() {
			fake(1, 2)
			expect(function() {
				expect(fake).to.have.been.calledWith('a', 'b')
			}).to.throw()
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
