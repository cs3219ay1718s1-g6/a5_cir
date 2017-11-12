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

    it('should process a simple `count papers` request correctly', done => {
        const mockRequest = {
            method: 'GET',
            params: {
                module: 'papers',
                action: 'count'
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

    it('should process a simple `papers network` request correctly', done => {
        const mockRequest = {
            method: 'GET',
            params: {
                module: 'papers',
                action: 'network'
            },
            query: {
                center: 'Low-density parity check codes over GF(q)',
                length: 2
            }
        }
        pipeline(mockRequest).then(result => {
            expect(result).to.be.an('object').that.has.all.keys('nodes', 'links')
            expect(result.nodes).to.be.an('array').that.is.not.empty
            expect(result.links).to.be.an('array').that.is.not.empty
            for (let node of result.nodes) {
                expect(node).to.be.an('object').that.includes.all.keys('id', 'title', 'year', 'authors')
                expect(node.id).to.be.a('number')
                expect(node.title).to.be.a('string')
                expect(node.year).to.be.a('number')
                expect(node.authors).to.be.an('array')
            }
            for (let link of result.links) {
                expect(link.source).to.be.a('number')
                expect(link.target).to.be.a('number')
            }

            done()
        }).catch(done)
    })
})