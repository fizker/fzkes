describe('unit/scopes.js', function() {
	var testData
	var scope
	beforeEach(function() {
		testData = {}
		scope = fzkes.scope()
	})

	describe('Calling `restore()` on a scope', () => {
		beforeEach(() => {
			testData.nonScopedFake = fzkes.fake()
			testData.outsideScope = fzkes.scope()
			testData.fakeInOutsideScope = testData.outsideScope.fake()
			testData.firstLevelFake = scope.fake()
			testData.secondLevelScope = scope.scope()
			testData.secondLevelFake = testData.secondLevelScope.fake()

			fzkes.fake(testData.firstLevelFake, 'restore')
			fzkes.fake(testData.secondLevelFake, 'restore')

			fzkes.fake(testData.nonScopedFake, 'restore')
			fzkes.fake(testData.fakeInOutsideScope, 'restore')

			scope.restore()
		})
		it('should call `restore()` on the fakes within', () => {
			expect(testData.firstLevelFake.restore).to.have.been.called(1)
			expect(testData.secondLevelFake.restore).to.have.been.called(1)
		})
		it('should not call `restore()` on fakes outside', () => {
			expect(testData.nonScopedFake.restore).to.not.have.been.called
			expect(testData.fakeInOutsideScope.restore).to.not.have.been.called
		})
	})

	describe('When creating a new scope', function() {
		it('should still have the fake and scope methods', function() {
			expect(scope).to.have.property('fake').and.be.a('function')
			expect(scope).to.have.property('scope').and.be.a('function')
		})
		it('should have a `restore()` method', function() {
			expect(scope).to.have.property('restore').and.be.a('function')
		})
		describe('and calling `fake()`', function() {
			it('should return a fake', function() {
				var fake = scope.fake()
				expect(fake).to.have.property('calls').and.be.a('function')
			})
			it('should allow overriding an original', function() {
				var a = fzkes.fake()
				var obj = { a: a }
				scope.fake(obj, 'a')
				expect(obj.a).to.not.equal(a)
			})
		})
		describe('and calling `scope()`', function() {
			it('should return a scope', function() {
				var sc = scope.scope()
				expect(sc).to.have.property('fake').and.be.a('function')
			})
		})
	})

	describe('When resetting a scope', function() {
		var fake
		beforeEach(function() {
			fake = scope.fake()
			fake()
			scope.reset()
		})
		it('should reset the fake', function() {
			expect(fake).not.to.have.been.called
		})
	})

	describe('When restoring a scope', function() {
		var obj
		var a
		beforeEach(function() {
			a = fzkes.fake('original')
			obj = { a: a }
			scope.fake(obj, 'a')
			scope.restore()
		})
		it('should restore fakes created with the scope', function() {
			expect(obj.a).to.equal(a)
		})
		describe('with sub-scopes', function() {
			var obj
			var a
			beforeEach(function() {
				a = fzkes.fake('original')
				obj = { a: a }
				scope.scope().fake(obj, 'a')
				scope.restore()
			})
			it('should restore fakes created with the sub-scope', function() {
				expect(obj.a).to.equal(a)
			})
		})
	})
	describe('When restoring `fzkes`', function() {
		var obj
		var a
		beforeEach(function() {
			a = fzkes.fake('original')
			obj = { a: a }
			scope.fake(obj, 'a')
			fzkes.restore()
		})
		it('should restore scopes as well', function() {
			expect(obj.a).to.equal(a)
		})
	})
})
