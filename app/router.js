const express = require('express')
const router = express.Router()
const neo4j = require('./components/database/neo4j')
const { connect } = require('./components/architecture/Filter')
const {
    RequestParser,
    QueryBuilder,
    Neo4jAdapter,
    ResponseBuilder
} = require('./components/request-handling')

const { session } = neo4j()
const pipeline = connect([
    new RequestParser(),
    new QueryBuilder(),
    new Neo4jAdapter(session),
    new ResponseBuilder
])

router.get('/:module', (req, res) => {
    pipeline(req).then(result => {
        res.status(200).send(result)
    }).catch(error => {
        res.status(422).send(error)
    })
})

module.exports = router
