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
        let query = 'MATCH (p:Paper)'
        if (command.venues) {
            query += '-[:WITHIN]->(v:Venue)'
        }
        query += ' WHERE'
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
        query += ' WITH '
        if (command.venues) {
            query += 'v.venueName AS Venue, '
        }
        query += 'p.paperYear AS Year, COUNT(p) AS Count RETURN '
        if (command.groups) {
            query += command.groups.map(g => capitalize(g.replace(/s$/, ''))).join(', ')
        } else {
            query += 'Year'
        }
        query += ', Count;'
        return Promise.resolve(query)
    }
}
