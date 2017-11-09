const { expect } = require('chai')
const RequestParser = require('app/components/request-handling/RequestParser')

let parser

describe('RequestParser', () => {
    beforeEach(() => parser = new RequestParser())

    it('should parse `count papers` requests correctly', done => {
        const mockRequest = createMockRequest('papers', 'count', {
            years: [2011, 2012, 2013],
            venues: ['arxiv', 'icse'],
            groups: ['venues', 'years']
        })
        const expected = {
            count: 'papers',
            years: [2011, 2012, 2013],
            venues: ['arxiv', 'icse'],
            groups: ['venues', 'years']
        }

        parser.process(mockRequest).then(result => {
            expect(result).to.deep.equal(expected)
            done()
        }).catch(done)
    })

    it('should not include invalid `count papers` request keys', done => {
        const mockRequest = createMockRequest('papers', 'count', {
            years: [2011, 2012, 2013],
            foo: 'bar',
            baz: 'boo',
            groups: ['years', 'foo', 'baz']
        })

        parser.process(mockRequest).then(result => {
            expect(result).to.be.an('object').that.not.includes.all.keys('foo', 'baz')
            expect(result.groups).to.be.an('array').that.not.includes.members(['foo', 'baz'])
            done()
        }).catch(done)
    })

    it('should accept valid `count papers` keys with specific years', done => {
        const mockRequest = createMockRequest('papers', 'count', {
            years: [2011, 2012, 2013],
            venues: ['arxiv', 'icse'],
            groups: ['years', 'venues']
        })
        parser.process(mockRequest).then(result => {
            expect(result).to.be.an('object').that.includes.all.keys('years', 'venues', 'groups')
            done()
        }).catch(done)
    })

    it('should accept valid `count papers` keys with range of years', done => {
        const mockRequest = createMockRequest('papers', 'count', {
            start: 2011,
            end: 2013,
            groups: ['years']
        })
        parser.process(mockRequest).then(result => {
            expect(result).to.be.an('object').that.includes.all.keys('start', 'end', 'groups')
            done()
        }).catch(done)
    })

    it('should accept `authors` key for a `count papers` query', done => {
        const mockRequest = createMockRequest('papers', 'count', {
            years: [2011, 2012, 2013],
            authors: ['Ritsuro Suzuki', 'Kevin Tay']
        })
        parser.process(mockRequest).then(result => {
            expect(result).to.be.an('object').that.includes.all.keys('years', 'authors')
            done()
        }).catch(done)
    })

    it('should normalize `venues`', done => {
        const mockRequest = createMockRequest('papers', 'count', {
            years: [2011, 2012, 2013],
            venues: ['ArXiv', 'ICSE'],
            groups: ['venues', 'years']
        })
        parser.process(mockRequest).then(result => {
            expect(result.venues).to.be.an('array').that.has.all.members(['arxiv', 'icse'])
            done()
        }).catch(done)
    })

    it ('should parse `count citations` requests correctly', done => {
        const mockRequest = createMockRequest('citations', 'count', {
            years: [2011, 2012, 2013],
            venues: ['arxiv', 'icse'],
            groups: ['venues', 'years']
        })
        parser.process(mockRequest).then(result => {
            expect(result).to.be.an('object').that.is.deep.equal({
                count: 'citations',
                years: [2011, 2012, 2013],
                venues: ['arxiv', 'icse'],
                groups: ['venues', 'years']
            })
            done()
        }).catch(done)
    })

})

const createMockRequest = (module, action, query) => ({
    method: 'GET',
    params: { module, action },
    query
})