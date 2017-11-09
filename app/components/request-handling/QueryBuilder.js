const Filter = require('../architecture/Filter')
const { capitalize } = require('../../utils/StringUtils')

/**
 * @class QueryBuilder
 * @description A Filter that takes in a Command and outputs a Query String
 */
module.exports = class QueryBuilder extends Filter {
    process(command) {
        switch (command.type) {
            case 'TREND':
            return this.constructTrendQuery(command)
        }
        return Promise.reject(new Error('Unsupported command type'))
    }

    constructTrendQuery(command) {
        // Validate command
        if (typeof command.years === 'undefined' &&
            typeof command.start === 'undefined' &&
            typeof command.end === 'undefined') {

            return Promise.reject(new Error('One of the following params has to be present: year, start, end'))
        }

        // Match statement
        let query = 'MATCH (p:Paper)'
        if (command.venues) {
            query += '-[:WITHIN]->(v:Venue)'
        }
        if (command.authors) {
            query += ' MATCH (a:Author)-[:CONTRIB_TO]->(p)'
        }

        // Conditionals
        if (command.years || command.start || command.end || command.venues) {
            query += ' WHERE'
        }
        if (command.venues) {
            query += ` v.venueID IN [${command.venues.map(v => `'${v}'`).join(', ')}] AND`
        }
        if (command.years) {
            query += ` p.paperYear IN [${command.years.join(', ')}]`
        } else {
            if (command.start) {
                query += ` p.paperYear >= ${command.start}`
            }
            if (command.end) {
                if (command.start) {
                    query += ' AND';
                }
                query += ` p.paperYear <= ${command.end}`
            }
        }
        if (command.authors) {
            query += ` AND toLower(a.authorName) IN [${command.authors.map(a => `'${a.toLowerCase()}'`).join(', ')}]`
        }

        query += ' WITH '
        if (command.venues) {
            query += 'v.venueName AS Venue, '
        }
        if (command.authors) {
            query += 'a.authorName AS Author, '
        }
        query += 'p.paperYear AS Year, COUNT(p) AS Count RETURN '

        let groups = command.groups
        if (typeof groups === 'undefined') {
            // Infer groups
            groups = []
            if (command.hasOwnProperty('authors')) groups.push('authors')
            if (command.hasOwnProperty('venues')) groups.push('venues')
            if (command.hasOwnProperty('years') ||
                command.hasOwnProperty('start') ||
                command.hasOwnProperty('end')) {

                groups.push('years')
            }
        }
        query += groups.map(g => capitalize(g.replace(/s$/, ''))).join(', ')
        query += ', Count;'
        return Promise.resolve(query)
    }
}
