const { expect } = require('chai')
const Neo4jQuery = require('app/models/Neo4jQuery')

describe('Neo4jQuery', () => {
    it('should render a simple query correctly', () => {
        let query = new Neo4jQuery()
        query.addSelector('(p:Paper)')
        query.addReturn('COUNT(p)')
        expect(query.generate()).to.equal('MATCH (p:Paper) RETURN COUNT(p);')
    })

    it('should render a complex query correctly', () => {
        let query = new Neo4jQuery()
        query.addSelector('(c:Paper)-[:CITES]->(p:Paper)-[:WITHIN]->(v:Venue)')
        query.addSelector('(a:Author)-[:CONTRIB_TO]->(p)')
        query.addCondition(`v.venueID IN ['arxiv', 'icse']`)
        query.addCondition(`toLower(a.authorName) IN ['john doe', 'bill gates']`)
        query.addAlias('a.authorName', 'Author')
        query.addAlias('v.venueName', 'Venue')
        query.addAlias('COUNT(c)', 'Count')
        query.addReturn('Author', 'Venue', 'Count')
        expect(query.generate()).to.equal(
            `MATCH (c:Paper)-[:CITES]->(p:Paper)-[:WITHIN]->(v:Venue) ` +
            `MATCH (a:Author)-[:CONTRIB_TO]->(p) ` +
            `WHERE v.venueID IN ['arxiv', 'icse'] AND ` +
            `toLower(a.authorName) IN ['john doe', 'bill gates'] ` +
            `WITH a.authorName AS Author, v.venueName AS Venue, COUNT(c) AS Count ` +
            `RETURN Author, Venue, Count;`
        )
    })
})