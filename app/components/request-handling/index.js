const neo4j = require('../database/neo4j')

const Pipeline = require('../architecture/Pipeline')
const Filter   = require('../architecture/Filter')

const RequestParser   = require('./RequestParser')
const QueryBuilder    = require('./QueryBuilder')
const Neo4jAdapter    = require('./Neo4jAdapter')
const ResponseBuilder = require('./ResponseBuilder')

module.exports = class RequestHandler extends Pipeline {

    constructor(session) {
        if (!session) {
            const { driver, session } = neo4j()
            this._driver = driver
        }
        this._session = session

        super(
            new RequestParser(),
            new QueryBuilder(),
            new Neo4jAdapter(this._session),
            new ResponseBuilder(),
            new PipelineSink(response => {
                let [ data, statusCode ] = response
                this._res.status(statusCode).send(data)
            })
        )
    }

    receive(data) {
        const { req, res } = data
        this._res = res
        super.receive(req)
    }
}

class PipelineSink extends Filter {
    constructor(cb) {
        super()
        this._cb = cb
    }

    process(data) {
        this._cb(data)
    }
}