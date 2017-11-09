const { expect } = require('chai')
const Filter = require('app/components/architecture/Filter')

describe('Filter', () => {
    it('should not be instantiable', () => {
        expect(() => new Filter()).to.throw()
    })

    it('should allow concrete subclasses to instantiate', () => {
        expect(() => new TestFilter()).to.not.throw()
    })
})

class TestFilter extends Filter {}