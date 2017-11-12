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

    it('should build simple `top authors` queries correctly', done => {
        builder.process({
            top: 'authors',
            venue: 'arxiv',
            limit: 5
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (p:Paper)-[:WITHIN]->(v:Venue) ` +
                `MATCH (a:Author)-[:CONTRIB_TO]->(p) ` +
                `WHERE v.venueID = 'arxiv' WITH v.venueName AS Venue, a.authorName AS Author, COUNT(p) AS Count ` +
                `ORDER BY Count DESC RETURN Venue, Author, Count LIMIT 5;`
            )
            done()
        }).catch(done)
    })

    it('should build `top authors` queries with `citations` context correctly', done => {
        builder.process({
            top: 'authors',
            venue: 'arxiv',
            limit: 5,
            context: 'citations'
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (c:Paper)-[:CITES]->(p:Paper)-[:WITHIN]->(v:Venue) ` +
                `MATCH (a:Author)-[:CONTRIB_TO]->(p) ` +
                `WHERE v.venueID = 'arxiv' WITH v.venueName AS Venue, a.authorName AS Author, COUNT(c) AS Count ` +
                `ORDER BY Count DESC RETURN Venue, Author, Count LIMIT 5;`
            )
            done()
        }).catch(done)
    })

    it('should build `top papers` queries with `venue` and `year` combined correctly', done => {
        builder.process({
            top: 'papers',
            venue: 'arxiv',
            year: 2015,
            limit: 5
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (c:Paper)-[:CITES]->(p:Paper)-[:WITHIN]->(v:Venue) ` +
                `WHERE v.venueID = 'arxiv' AND p.paperYear = 2015 ` + 
                `WITH v.venueName AS Venue, p.paperYear AS Year, p.paperTitle AS Paper, COUNT(c) AS Count ` +
                `ORDER BY Count DESC RETURN Venue, Year, Paper, Count LIMIT 5;`
            )
            done()
        }).catch(done)

    })

    it('should build `top papers` queries by `author` correctly', done => {
        builder.process({
            top: 'papers',
            author: 'Howard J. Karloff',
            limit: 3
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH (c:Paper)-[:CITES]->(p:Paper) ` +
                `MATCH (a:Author)-[:CONTRIB_TO]->(p) ` +
                `WHERE toLower(a.authorName) = 'howard j. karloff' ` +
                `WITH a.authorName AS Author, p.paperTitle AS Paper, COUNT(c) AS Count ` +
                `ORDER BY Count DESC RETURN Author, Paper, Count LIMIT 3;`
            )
            done()
        }).catch(done)
    })

    it('should build a simple `papers network` query correctly', done => {
        builder.process({
            network: 'papers',
            length: 2,
            center: 'low-density parity check codes over gf(q)'
        }).then(result => {
            expect(result).to.be.a('string').that.is.equal(
                `MATCH r = (:Author)-[:CONTRIB_TO]->(:Paper)-[:CITES*0..2]->(p:Paper) ` +
                `WHERE toLower(p.paperTitle) = 'low-density parity check codes over gf(q)' ` +
                `RETURN r;`
            )
            done()
        }).catch(done)
    })
})