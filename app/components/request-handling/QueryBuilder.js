const Filter = require('../architecture/Filter')
const Neo4jQuery = require('../../models/Neo4jQuery')
const { capitalize } = require('../../utils/StringUtils')

/**
 * @class QueryBuilder
 * @description A Filter that takes in a Command and outputs a Query String
 */
module.exports = class QueryBuilder extends Filter {
    process(command) {
        if (command.hasOwnProperty('count')) {
            return this.constructCountQuery(command)
        } else if (command.hasOwnProperty('top')) {
            return this.constructTopQuery(command)
        } else if (command.hasOwnProperty('network')) {
            return this.constructNetworkQuery(command)
        }
        return Promise.reject(new Error('Unsupported command type'))
    }

    constructCountQuery(command) {
        // Validate command
        // if (typeof command.years === 'undefined' &&
        //     typeof command.start === 'undefined' &&
        //     typeof command.end === 'undefined') {

        //     return Promise.reject(new Error('One of the following params has to be present: year, start, end'))
        // }
        let query = new Neo4jQuery()

        // Match statement
        let primarySelector = '(p:Paper)'
        if (command.count === 'citations') {
            primarySelector = '(c:Paper)-[:CITES]->' + primarySelector
        } else if (command.count === 'phrases') {
            primarySelector = '(w:Phrase)<-[:CONTAINS]-' + primarySelector
        }
        if (command.venues) {
            primarySelector += '-[:WITHIN]->(v:Venue)'
        }
        query.addSelector(primarySelector)
        if (command.authors || command.count === 'authors') {
            query.addSelector('(a:Author)-[:CONTRIB_TO]->(p)')
        }

        // Conditionals
        if (command.venues) {
            query.addCondition(`v.venueID IN [${command.venues.map(v => `'${v}'`).join(', ')}]`)
        }
        if (command.years) {
            query.addCondition(`p.paperYear IN [${command.years.join(', ')}]`)
        } else {
            if (command.start) {
                query.addCondition(`p.paperYear >= ${command.start}`)
            }
            if (command.end) {
                query.addCondition(`p.paperYear <= ${command.end}`)
            }
        }
        if (command.authors) {
            query.addCondition(`toLower(a.authorName) IN [${command.authors.map(a => `'${a.toLowerCase()}'`).join(', ')}]`)
        }

        if (command.venues) {
            query.addAlias('v.venueName', 'Venue')
        }
        if (command.authors) {
            query.addAlias('a.authorName', 'Author')
        }
        if (command.count === 'phrases') {
            query.addAlias('w.phraseValue', 'Phrase')
        }

        const shouldIncludeYears = (
            ['years', 'start', 'end'].map(k => command.hasOwnProperty(k)).reduce((a, v) => a || v, false) ||
            (command.hasOwnProperty('groups') && command.groups.indexOf('years') >= 0)
        )
        if (shouldIncludeYears) {
            query.addAlias('p.paperYear', 'Year')
        }

        // Find out what variable is being counted
        let countedVariable
        switch (command.count) {
            case 'citations': countedVariable = 'c'; break
            case 'authors':   countedVariable = 'a'; break
            default:          countedVariable = 'p'
        }
        query.addAlias(`COUNT(${countedVariable})`, 'Count')

        let groups = command.groups
        if (typeof groups === 'undefined') {
            // Infer groups
            groups = []
            if (command.hasOwnProperty('authors')) groups.push('authors')
            if (command.hasOwnProperty('venues')) groups.push('venues')
            if (command.count === 'phrases') groups.push('phrases')
            if (shouldIncludeYears) {
                groups.push('years')
            }
        }
        query.addReturn(groups.map(g => capitalize(g.replace(/s$/, ''))))
        query.addReturn('Count')
        return Promise.resolve(query.generate())
    }

    constructTopQuery(command) {
        let query = new Neo4jQuery()
        let primarySelector = '(p:Paper)'

        if (command.top === 'papers' || command.context === 'citations') {
            primarySelector = '(c:Paper)-[:CITES]->' + primarySelector
        } else if (command.top === 'phrases') {
            primarySelector = '(w:Phrase)<-[:CONTAINS]-' + primarySelector
        }
        if (command.venue || command.venues) {
            primarySelector += '-[:WITHIN]->(v:Venue)'
        }
        query.addSelector(primarySelector)
        if (command.author || command.top === 'authors') {
            query.addSelector('(a:Author)-[:CONTRIB_TO]->(p)')
        }

        if (command.venue || command.venues) {
            if (command.venues) {
                query.addCondition(`v.venueID IN ['${command.venues.map(v => `'${v}'`).join(', ')}']`)
            } else {
                query.addCondition(`v.venueID = '${command.venue}'`)
            }
            query.addAlias('v.venueName', 'Venue')
            query.addReturn('Venue')
        }
        if (command.year || command.years) {
            if (command.years) {
                query.addCondition(`p.paperYear IN [${command.years.join(', ')}]`)
            } else {
                query.addCondition(`p.paperYear = ${command.year}`)
            }
            query.addAlias('p.paperYear', 'Year')
            query.addReturn('Year')
        }

        if (command.author) {
            query.addCondition(`toLower(a.authorName) = '${command.author.toLowerCase()}'`)
        }

        if (command.author || command.top === 'authors') {
            query.addAlias('a.authorName', 'Author')
            query.addReturn('Author')
        }

        if (command.top === 'papers') {
            query.addAlias('p.paperTitle', 'Paper')
            query.addReturn('Paper')
        }

        if (command.top === 'phrases') {
            query.addAlias('w.phraseValue', 'Phrase')
            query.addReturn('Phrase')
        }

        if (command.top === 'papers' || command.context === 'citations') {
            query.addAlias('COUNT(c)', 'Count')
        } else {
            query.addAlias('COUNT(p)', 'Count')
        }

        query.addReturn('Count')
        query.orderBy('Count')
        query.limit = command.limit
        return Promise.resolve(query.generate())
    }

    constructNetworkQuery(command) {
        let query = new Neo4jQuery()
        query.addSelector(`r = (:Author)-[:CONTRIB_TO]->(:Paper)-[:CITES*0..${command.length}]->(p:Paper)`)
        query.addCondition(`toLower(p.paperTitle) = '${command.center.toLowerCase()}'`)
        query.addReturn('r')
        return Promise.resolve(query.generate())
    }
}
