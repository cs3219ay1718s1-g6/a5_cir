const { expect } = require('chai')
const QueryBuilder = require('app/components/request-handling/QueryBuilder')

let builder

describe('QueryBuilder', () => {
    beforeEach(() => builder = new QueryBuilder())

    it('should build `count papers` queries with years correctly', done => {
        builder.process({
            count: 'papers',
            years: [2011, 2012, 2013]
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (p:Paper) WHERE p.paperYear IN [2011, 2012, 2013] ` +
                `WITH p.paperYear AS Year, COUNT(p) AS Count RETURN Year, Count;`
            )
            done()
        }).catch(done)
    })

    it('should build `count papers` queries with start and end correctly', done => {
        builder.process({
            count: 'papers',
            start: 2011,
            end: 2013
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (p:Paper) WHERE p.paperYear >= 2011 AND p.paperYear <= 2013 ` +
                `WITH p.paperYear AS Year, COUNT(p) AS Count RETURN Year, Count;`
            )
            done()
        }).catch(done)
    })

    it('should build `count papers` queries of specific years with venues correctly', done => {
        builder.process({
            count: 'papers',
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
        }).catch(done)
    })

    it('should build `count papers` queries of year start and end with venues correctly', done => {
        builder.process({
            count: 'papers',
            start: 2011,
            end: 2013,
            venues: ['arxiv', 'icse'],
            groups: ['venues', 'years']
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (p:Paper)-[:WITHIN]->(v:Venue) ` +
                `WHERE v.venueID IN ['arxiv', 'icse'] AND ` +
                `p.paperYear >= 2011 AND p.paperYear <= 2013 ` +
                `WITH v.venueName AS Venue, p.paperYear AS Year, COUNT(p) AS Count ` +
                `RETURN Venue, Year, Count;`
            )
            done()
        }).catch(done)
    })

    it('should build `count papers` queries with the correct group order', done => {
        builder.process({
            count: 'papers',
            years: [2004, 2005, 2006],
            venues: ['arxiv', 'icse'],
            groups: ['years', 'venues']
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (p:Paper)-[:WITHIN]->(v:Venue) ` +
                `WHERE v.venueID IN ['arxiv', 'icse'] AND ` +
                `p.paperYear IN [2004, 2005, 2006] ` +
                `WITH v.venueName AS Venue, p.paperYear AS Year, COUNT(p) AS Count ` +
                `RETURN Year, Venue, Count;`
            )
            done()
        }).catch(done)
    })

    it('should build `count papers` queries with authors correctly', done => {
        builder.process({
            count: 'papers',
            years: [2012, 2013, 2014],
            authors: ['Ritsuro Suzuki', 'Cheng-Cheng Guo'],
            groups: ['authors', 'years']
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (p:Paper) ` +
                `MATCH (a:Author)-[:CONTRIB_TO]->(p) ` +
                `WHERE p.paperYear IN [2012, 2013, 2014] ` + 
                `AND toLower(a.authorName) IN ['ritsuro suzuki', 'cheng-cheng guo'] ` +
                `WITH a.authorName AS Author, p.paperYear AS Year, COUNT(p) AS Count ` +
                `RETURN Author, Year, Count;`
            )
            done()
        }).catch(done)
    })

    it('should build simple `count citations` queries correctly', done => {
        builder.process({
            count: 'citations',
            venues: ['arxiv', 'icse']
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (c:Paper)-[:CITES]->(p:Paper)-[:WITHIN]->(v:Venue) ` +
                `WHERE v.venueID IN ['arxiv', 'icse'] ` +
                `WITH v.venueName AS Venue, COUNT(c) AS Count ` +
                `RETURN Venue, Count;`
            )
            done()
        }).catch(done)
    })

    it('should include years if the `groups` parameter demands it', done => {
        builder.process({
            count: 'citations',
            venues: ['arxiv', 'icse'],
            groups: ['venues', 'years']
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (c:Paper)-[:CITES]->(p:Paper)-[:WITHIN]->(v:Venue) ` +
                `WHERE v.venueID IN ['arxiv', 'icse'] ` +
                `WITH v.venueName AS Venue, p.paperYear AS Year, COUNT(c) AS Count ` +
                `RETURN Venue, Year, Count;`
            )
            done()
        }).catch(done)
    })

    it('should build simple `top` queries correctly', done => {
        builder.process({
            top: 'papers',
            venue: 'arxiv',
            limit: 10
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (c:Paper)-[:CITES]->(p:Paper)-[:WITHIN]->(v:Venue) ` +
                `WHERE v.venueID = 'arxiv' WITH v.venueName AS Venue, p.paperTitle AS Paper, COUNT(c) AS Count ` +
                `ORDER BY Count DESC RETURN Venue, Paper, Count LIMIT 10;`
            )
            done()
        }).catch(done)
    })
})