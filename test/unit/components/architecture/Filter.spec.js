const { expect } = require('chai')
const Filter = require('app/components/architecture/Filter')
const Pipe = require('app/components/architecture/Pipe')

describe('Filter', () => {
    it('should not be instantiable', () => {
        expect(() => new Filter()).to.throw()
    })

    it('should allow concrete subclasses to instantiate', () => {
        expect(() => new TestFilter()).to.not.throw()
    })

    it('should be able to add pipes', () => {
        let filter = new TestFilter()
        expect(() => filter.addPipe(new Pipe(filter)))
            .to.increase(() => filter.pipes.size).by(1)
    })
})

class TestFilter extends Filter {}