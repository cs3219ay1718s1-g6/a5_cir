const neo4j = require('../database/neo4j')
const Filter = require('../architecture/Filter')

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
        return this._session.run(query)
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