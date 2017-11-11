const { expect } = require('chai')
const Neo4jAdapter = require('app/components/request-handling/Neo4jAdapter')
const neo4j = require('app/components/database/neo4j')
const ResultTable = require('app/models/ResultTable')

let driver, session, adapter

describe('Neo4jAdapter', () => {

    before(() => {
        const init = neo4j()
        driver = init.driver
        session = init.session
        
        adapter = new Neo4jAdapter(session)
    })

    after(() => {
        session.close()
        driver.close()
    })

    it('should at least work', done => {
        adapter.process(`MATCH (p:Paper) WITH COUNT(p) AS Count RETURN Count;`).then(result => {
            expect(result).to.be.a('resultTable').that.has.lengthOf(1)
            expect(result.row(0)).to.be.an('object').that.has.all.keys('Count')
            done()
        }).catch(done)
    })

    it('should return the correct requested fields', done => {
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

    it('should parse network queries accordingly', done => {
        adapter.process(
            `MATCH r = (:Author)-[:CONTRIB_TO]->(:Paper)-[:CITES*0..2]->(p:Paper) ` +
            `WHERE toLower(p.paperTitle) = 'low-density parity check codes over gf(q)' ` +
            `RETURN r;`
        ).then(result => {
            expect(result).to.be.a('resultGraph')
            expect(result.nodes).to.be.an('array').that.is.not.empty
            for (let node of result.nodes) {
                expect(node).to.be.an('object').that.has.all.keys('id', 'title', 'authors')
                expect(node.authors).to.be.an('array').of('string')
            }
            expect(result.links).to.be.an('array').that.is.not.empty
            for (let link of result.links) {
                expect(link).to.be.an('object').that.has.all.keys('source', 'target')
            }
            done()
        }).catch(done)
    })
})