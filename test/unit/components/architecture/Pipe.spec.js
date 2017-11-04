const chai = require('chai')
const { expect } = chai
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const Pipe = require('app/components/architecture/Pipe')
const Filter = require('app/components/architecture/Filter')

describe('Pipe', () => {
    it('should require a filter upon instantiation', () => {
        expect(() => new Pipe()).to.throw()
    })

    it('should push data to outgoing pipes', done => {
        let outgoingPipe = new Pipe(new IdentityFilter())
        let spy = sinon.spy(outgoingPipe, 'receive')
        let filter = new IdentityFilter()
        filter.addPipe(outgoingPipe)
        let pipe = new Pipe(filter)
        pipe.receive('hello')
        setTimeout(() => {
            expect(spy).to.have.been.calledWith('hello')
            done()
        }, 100)
    })
})

class IdentityFilter extends Filter {
    process(data) {
        return Promise.resolve(data)
    }
}
