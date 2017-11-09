const { expect } = require('chai')
const { connect } = require('app/components/architecture/Filter')
const neo4j = require('app/components/database/neo4j')
const {
    RequestParser,
    QueryBuilder,
    Neo4jAdapter,
    ResponseBuilder
} = require('app/components/request-handling')

let pipeline
let session

describe('Request Handling Pipeline', () => {
    before(() => {
        session = neo4j().session

        pipeline = connect([
            new RequestParser(),
            new QueryBuilder(),
            new Neo4jAdapter(session),
            new ResponseBuilder
        ])
    })

    after(() => {
        session.close()
    })

    it('should process a simple `trend` request correctly', done => {
        const mockRequest = {
            method: 'GET',
            params: {
                module: 'trend'
            },
            query: {
                years: [2011, 2012, 2013]
            }
        }
        pipeline(mockRequest).then(result => {
            expect(result).to.be.an('object').that.has.all.keys('2011', '2012', '2013')
            for (let key in result) {
                expect(result[key]).to.be.a('number')
            }
            done()
        }).catch(done)
    })
})