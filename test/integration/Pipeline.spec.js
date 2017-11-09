const { expect } = require('chai')
const { connect } = require('app/components/architecture/Filter')
const {
    RequestParser,
    QueryBuilder,
    Neo4jAdapter,
    ResponseBuilder
} = require('app/components/request-handling')
const express = require('express')
const axios = require('axios')

const port = process.env.PORT || 8081
let app, server

describe('Integration: Pipelining Filters', () => {
    before(() => {
        const pipeline = connect([
            new RequestParser(),
            new QueryBuilder(),
            new Neo4jAdapter(),
            new ResponseBuilder()
        ])
        app = express()
        server = app.listen(port, () => {
            console.log('Test server listening on port ' + port)
        })

        app.get('/api/:module', (req, res) => {
            pipeline(req).then(result => {
                res.status(200).send(result)
            }).catch(error => {
                res.status(422).send(error)
            })
        })
    })

    after(() => {
        server.close()
    })
    
    it('should work for simple `trend` request', done => {
        axios.get(`http://localhost:${port}/api/trend`, {
            years: [2011, 2012, 2013]
        }).then(result => {
            console.log(result)
            done()
        }).catch(done)
    })
})