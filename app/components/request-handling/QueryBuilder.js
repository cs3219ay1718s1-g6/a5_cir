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
        }
        if (command.venues) {
            primarySelector += '-[:WITHIN]->(v:Venue)'
        }
        query.addSelector(primarySelector)
        if (command.authors) {
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

        const shouldIncludeYears = (
            ['years', 'start', 'end'].map(k => command.hasOwnProperty(k)).reduce((a, v) => a || v, false) ||
            (command.hasOwnProperty('groups') && command.groups.indexOf('years') >= 0)
        )
        if (shouldIncludeYears) {
            query.addAlias('p.paperYear', 'Year')
        }
        if (command.count === 'citations') {
            query.addAlias('COUNT(c)', 'Count')
        } else {
            query.addAlias('COUNT(p)', 'Count')
        }

        let groups = command.groups
        if (typeof groups === 'undefined') {
            // Infer groups
            groups = []
            if (command.hasOwnProperty('authors')) groups.push('authors')
            if (command.hasOwnProperty('venues')) groups.push('venues')
            if (shouldIncludeYears) {
                groups.push('years')
            }
        }
        query.addReturn(groups.map(g => capitalize(g.replace(/s$/, ''))))
        query.addReturn('Count')
        return Promise.resolve(query.generate())
    }
}
