const neo4j = require('../database/neo4j')
const Filter = require('../architecture/Filter')
const ResultTable = require('../../models/ResultTable')
const ResultGraph = require('../../models/ResultGraph')

const RESULT_TYPE_TABLE = 'RESULT_TYPE_TABLE'
const RESULT_TYPE_GRAPH = 'RESULT_TYPE_GRAPH'
const RESULT_TYPE_UNKNOWN = 'RESULT_TYPE_UNKNOWN'

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
            const type = this.determineResultType(result)
            switch (type) {
                case RESULT_TYPE_GRAPH:
                return this.processGraphResult(result)

                case RESULT_TYPE_TABLE:
                return this.processTabularResult(result)

                case RESULT_TYPE_UNKNOWN:
                default:
                throw new Error('Unrecognized query result type')
            }
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

    determineResultType(result) {
        if (result.records.length > 0 &&
            result.records[0].get(0).constructor.name === 'Path') {

            return RESULT_TYPE_GRAPH
        }
        return RESULT_TYPE_TABLE
    }

    processTabularResult(result) {
        if (result.records.length === 0) {
            return ResultTable.empty()
        }
        let columns = result.records[0].keys
        let data = []
        for (let record of result.records) {
            data.push(columns.map((_, index) => record.get(index)))
        }
        return new ResultTable(columns, data)
    }

    processGraphResult(result) {
        let graph = new ResultGraph()

        for (let path of result.records.map(r => r.get(0))) {
            for (let { start, relationship, end } of path.segments) {
                [start, end].forEach(node => graph.addNode(
                    node.identity.toNumber(), 
                    ((props) => {
                        let object = { label: node.labels[0] }
                        for (let key in props) {
                            object[key] = props[key]
                            if (object[key].constructor.name === 'Integer') {
                                object[key] = object[key].toNumber()
                            }
                        }
                        return object
                    })(node.properties)
                ))
                graph.connect(
                    start.identity.toNumber(),
                    end.identity.toNumber(),
                    relationship.type
                )
            }
        }
        return graph
    }
}