const neo4j = require('../database/neo4j')
const Filter = require('../architecture/Filter')
const QueryResult = require('../../models/QueryResult')

module.exports = class Neo4jAdapter extends Filter {

    constructor(session) {
        super()
        // Construct the session if it doesn't exist
        if (!session) {
            const { driver, session } = neo4j()
            this._driver = driver
        }
        this._session = session
    }

    process(query) {
        return this._session.run(query).then(result => {
            if (result.records.length === 0) {
                return QueryResult.empty()
            }
            let columns = result.records[0].keys
            let data = []
            for (let record of result.records) {
                data.push(columns.map((_, index) => record.get(index)))
            }
            return new QueryResult(columns, data)
        })
    }

    close() {
        if (this._session && 
            this._session.close &&
            this._session.close.constructor === Function) {

            this._session.close()
        }
        if (this._driver) {
            this._driver.close()
        }
    }
}