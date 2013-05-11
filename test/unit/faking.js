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
		describe('and it is told to `callsOriginal()`', function() {
			beforeEach(function() {
				fake.callsOriginal()
			})
			it('should call the original', function() {
				obj.a()
				fn.should.have.been.called
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
