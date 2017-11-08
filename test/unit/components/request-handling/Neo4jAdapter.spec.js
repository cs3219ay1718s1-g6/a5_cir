const { expect } = require('chai')
const Neo4jAdapter = require('app/components/request-handling/Neo4jAdapter')
const neo4j = require('app/components/database/neo4j')
const QueryResult = require('app/models/QueryResult')

let driver, session

describe('Neo4jAdapter', () => {

    before(() => {
        const init = neo4j()
        driver = init.driver
        session = init.session
    })

    after(() => {
        session.close()
        driver.close()
    })

    it('should at least work', done => {
        const adapter = new Neo4jAdapter(session)
        adapter.process(`MATCH (p:Paper) WITH COUNT(p) AS Count RETURN Count;`).then(result => {
            expect(result).to.be.a('queryResult').that.has.lengthOf(1)
            expect(result.row(0)).to.be.an('object').that.has.all.keys('Count')
            done()
        }).catch(done)
    })
})