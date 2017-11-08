const { expect } = require('chai')
const ResponseBuilder = require('app/components/request-handling/ResponseBuilder')
const QueryResult = require('app/models/QueryResult')

describe('ResponseBuilder', () => {
    it('should group result according to columns', done => {
        const builder = new ResponseBuilder()
        builder.process(new QueryResult(
            ['Venue', 'Year', 'Count'],
            [
                ['ArXiV', 2012, 10],
                ['ArXiV', 2013, 15],
                ['ICSE', 2012, 5],
                ['ICSE', 2013, 20]
            ]
        )).then(result => {
            expect(result).to.be.an('object').that.is.deep.equal({
                'ArXiV': {
                    2012: 10,
                    2013: 15,
                },
                'ICSE': {
                    2012: 5,
                    2013: 20
                }
            })
            done()
        }).catch(done)
    })
})