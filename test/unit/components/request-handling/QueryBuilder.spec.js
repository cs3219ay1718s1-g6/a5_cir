const { expect } = require('chai')
const QueryBuilder = require('app/components/request-handling/QueryBuilder')

describe('QueryBuilder', () => {
    it('should build `trend` queries with years correctly', done => {
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
        }).catch(done)
    })

    it('should build `trend` queries with start and end correctly', done => {
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
        }).catch(done)
    })

    it('should build `trend` queries of specific years with venues correctly', done => {
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

    it('should build `trend` queries of year start and end with venues correctly', done => {
        const builder = new QueryBuilder()
        builder.process({
            type: 'TREND',
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

    it('should build `trend` queries with the correct group order', done => {
        const builder = new QueryBuilder()
        builder.process({
            type: 'TREND',
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

    it('should build `trend` queries with authors correctly', done => {
        const builder = new QueryBuilder()
        builder.process({
            type: 'TREND',
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
})