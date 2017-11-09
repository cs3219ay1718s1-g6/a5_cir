const { expect } = require('chai')
const { fail } = require('assert')
const express = require('express')
const router = require('app/router')
const axios = require('axios')

const port = process.env.PORT || 8081
let app, server

describe('Integration: Pipelining Filters', () => {
    before(() => {
        app = express()
        app.use('/api', router)
        server = app.listen(port, () => {
            console.log('Test server listening on port ' + port)
        })
    })

    after(() => {
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