const chai = require('chai')
const { expect } = chai
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const Pipeline = require('app/components/architecture/Pipeline')
const Filter = require('app/components/architecture/Filter')

const TIME_EPSILON = 50

describe('Pipeline', () => {
    it('should require at least one Filter', () => {
        expect(() => new Pipeline()).to.throw()
    })

    it('should successfully instantiates with at least one filter', () => {
        expect(() => new Pipeline(new TestFilter())).to.not.throw()
    })

    it('should accept Filters in varargs form as arguments', () => {
        let filters = repeat(() => new TestFilter(), 5)
        expect(() => new Pipeline(...filters)).to.not.throw()
    })

    it('should accept an array of Filters as arguments', () => {
        let filters = repeat(() => new TestFilter(), 5)
        expect(() => new Pipeline(filters)).to.not.throw()
    })
    
    it('should propagate data along the pipeline', done => {
        let times = 5
        let filters = repeat(() => new PlusOneFilter(), times)
        let spy = sinon.spy(filters[filters.length - 1], 'process')
        let pipeline = new Pipeline(filters)
        pipeline.receive(0)
        setTimeout(() => {
            expect(spy).to.have.been.calledWith(4)
            done()
        }, TIME_EPSILON)
    })
})

class TestFilter extends Filter {}
class PlusOneFilter extends Filter {
    process(data) {
        return Promise.resolve(data + 1)
    }
}

const repeat = (element, times) => new Array(times).fill().map(_ => element.constructor === Function ? element() : element)
