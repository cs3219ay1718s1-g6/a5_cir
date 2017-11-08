const { expect } = require('chai')
const QueryBuilder = require('app/components/request-handling/QueryBuilder')

describe('QueryBuilder', () => {
    it('should parse `trend` queries with years correctly', done => {
        const builder = new QueryBuilder()
        builder.process({
            type: 'TREND',
            years: [2011, 2012, 2013]
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (p:Paper) WHERE p.paperYear IN [2011, 2012, 2013] ` +
                `WITH p.paperYear AS Year, COUNT(p) AS Count RETURN Year, Count;`
            )
            done()
        })
    })

    it('should parse `trend` queries with start and end correctly', done => {
        const builder = new QueryBuilder()
        builder.process({
            type: 'TREND',
            start: 2011,
            end: 2013
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (p:Paper) WHERE p.paperYear >= 2011 AND p.paperYear <= 2013 ` +
                `WITH p.paperYear AS Year, COUNT(p) AS Count RETURN Year, Count;`
            )
            done()
        })
    })

    it('should parse `trend` queries with venues correctly', done => {
        const builder = new QueryBuilder()
        builder.process({
            type: 'TREND',
            years: [2011, 2012, 2013],
            venues: ['arxiv', 'icse'],
            groups: ['venues', 'years']
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (p:Paper)-[:WITHIN]->(v:Venue) ` +
                `WHERE v.venueID IN ['arxiv', 'icse'] AND p.paperYear IN [2011, 2012, 2013] ` +
                `WITH v.venueName AS Venue, p.paperYear AS Year, COUNT(p) AS Count ` +
                `RETURN Venue, Year, Count;`
            )
            done()
        })
    })
})