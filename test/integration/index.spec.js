const { expect } = require('chai')
const { fail } = require('assert')
const { connect } = require('app/components/architecture/Filter')
const {
    RequestParser,
    QueryBuilder,
    Neo4jAdapter,
    ResponseBuilder
} = require('app/components/request-handling')
const neo4j = require('app/components/database/neo4j')
const express = require('express')
const axios = require('axios')

const port = process.env.PORT || 8081
let app, session, server

describe('Integration: Pipelining Filters', () => {
    before(() => {
        session = neo4j().session

        const pipeline = connect([
            new RequestParser(),
            new QueryBuilder(),
            new Neo4jAdapter(session),
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
        session.close()
        server.close()
    })

    it('should work for simple `trend` request', done => {
        axios.get(`http://localhost:${port}/api/trend`, {
            params: {
                years: [2011, 2012, 2013]
            }
        }).then(({ data }) => {
            expect(data).to.be.an('object').that.has.all.keys('2011', '2012', '2013')
            done()
        }).catch(done)
    })

    it('should return an error for missing query', done => {
        axios.get(`http://localhost:${port}/api/trend`, {
            params: {}
        }).then(result => {
            fail(result.status, 422, 'The request should have failed')
            done()
        }).catch(error => {
            if (error.hasOwnProperty('response')) {
                expect(error.response.status).to.equal(422)
                done()
            } else {
                done(error)
            }
        }).catch(done)
    })

    it('should return correct result hierarchy when `groups` is specified', done => {
        Promise.all([
            // Year comes first
            axios.get(`http://localhost:${port}/api/trend`, {
                params: {
                    years: [2011, 2012, 2013],
                    venues: ['arxiv', 'icse'],
                    groups: ['years', 'venues']
                }
            }).then(result => {
                for (let key in result.data) {
                    expect(key).to.match(/^201\d$/)
                }
            }),

            // Venue comes first
            axios.get(`http://localhost:${port}/api/trend`, {
                params: {
                    years: [2011, 2012, 2013],
                    venues: ['arxiv', 'icse'],
                    groups: ['venues', 'years']
                }
            }).then(result => {
                let groups = new Set(['arxiv', 'icse'])
                for (let key in result.data) {
                    expect(groups.has(key.toLowerCase())).to.be.true
                }
            })

        ]).then(() => done())
        .catch(done)
    })
})