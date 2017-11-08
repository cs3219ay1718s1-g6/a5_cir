const { expect } = require('chai')
const RequestParser = require('app/components/request-handling/RequestParser')

describe('RequestParser', () => {
    it('should parse `trend` requests correctly', done => {
        const parser = new RequestParser()
        const mockRequest = {
            method: 'GET',
            params: {
                module: 'trend'
            },
            query: {
                years: [2011, 2012, 2013],
                venues: ['arxiv', 'icse'],
                groups: ['venues', 'years']
            }
        }
        const expected = {
            type: 'TREND',
            years: [2011, 2012, 2013],
            venues: ['arxiv', 'icse'],
            groups: ['venues', 'years']
        }

        parser.process(mockRequest).then(result => {
            expect(result).to.deep.equal(expected)
            done()
        })
    })

    it('should not include invalid `trend` request keys', done => {
        const parser = new RequestParser()
        const mockRequest = {
            method: 'GET',
            params: { module: 'trend' },
            query: {
                years: [2011, 2012, 2013],
                foo: 'bar',
                baz: 'boo',
                groups: ['years', 'foo', 'baz']
            }
        }

        parser.process(mockRequest).then(result => {
            expect(result).to.be.an('object').that.not.includes.all.keys('foo', 'baz')
            expect(result.groups).to.be.an('array').that.not.includes.members(['foo', 'baz'])
            done()
        })
    })

    it('should accept valid `trend` keys with specific years', done => {
        const parser = new RequestParser()
        const mockRequest = createTrendRequest({
            years: [2011, 2012, 2013],
            venues: ['arxiv', 'icse'],
            groups: ['years', 'venues']
        })
        parser.process(mockRequest).then(result => {
            expect(result).to.be.an('object').that.includes.all.keys('years', 'venues', 'groups')
            done()
        })
    })

    it('should accept valid `trend` keys with range of years', done => {
        const parser = new RequestParser()
        const mockRequest = createTrendRequest({
            start: 2011,
            end: 2013,
            groups: ['years']
        })
        parser.process(mockRequest).then(result => {
            expect(result).to.be.an('object').that.includes.all.keys('start', 'end', 'groups')
            done()
        })
    })
})

const createTrendRequest = (query) => ({
    method: 'GET',
    params: { module: 'trend' },
    query
})