const { expect } = require('chai')
const Neo4jAdapter = require('app/components/request-handling/Neo4jAdapter')
const neo4j = require('app/components/database/neo4j')
const ResultTable = require('app/models/ResultTable')

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
            expect(result).to.be.a('resultTable').that.has.lengthOf(1)
            expect(result.row(0)).to.be.an('object').that.has.all.keys('Count')
            done()
        }).catch(done)
    })

    it('should return the correct requested fields', done => {
        const adapter = new Neo4jAdapter(session)
        adapter.process(
            `MATCH (p:Paper)-[:WITHIN]->(v:Venue) ` +
            `WHERE v.venueID IN ['arxiv', 'icse'] ` +
            `WITH v.venueName AS Venue, p.paperYear AS Year, Count(p) AS Count ` +
            `RETURN Venue, Year, Count;`
        ).then(result => {
            expect(result).to.be.a('resultTable')
            expect(result.row(0)).to.be.an('object').that.has.all.keys('Venue', 'Year', 'Count');
            done()
        }).catch(done)
    })
})