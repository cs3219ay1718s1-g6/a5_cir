const { expect } = require('chai')
const { fail } = require('assert')
const express = require('express')
const router = require('app/router')
const axios = require('axios')

const port = process.env.TEST_PORT || 8081
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

    it('should work for simple `count papers` request', done => {
        axios.get(`http://localhost:${port}/api/papers/count`, {
            params: {
                years: [2011, 2012, 2013]
            }
        }).then(({ data }) => {
            expect(data).to.be.an('object').that.has.all.keys('2011', '2012', '2013')
            done()
        }).catch(done)
    })

    it('should return correct result hierarchy when `groups` is specified', done => {
        Promise.all([
            // Year comes first
            axios.get(`http://localhost:${port}/api/papers/count`, {
                params: {
                    years: [2011, 2012, 2013],
                    venues: ['ArXiv', 'ICSE'],
                    groups: ['years', 'venues']
                }
            }).then(result => {
                for (let key in result.data) {
                    expect(key).to.match(/^201\d$/)
                }
            }),

            // Venue comes first
            axios.get(`http://localhost:${port}/api/papers/count`, {
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

    it('should work for simple `top papers` requests', done => {
        axios.get(`http://localhost:${port}/api/papers/top`, {
            params: {
                venue: 'ArXiv',
                limit: 10
            }
        }).then(({ data }) => {
            expect(data).to.be.an('object')
            expect(Object.keys(data)).to.have.lengthOf(1)
            let venue = Object.keys(data)[0]
            expect(venue.toLowerCase()).to.equal('arxiv')
            for (let key in data[venue]) {
                expect(data[venue][key]).to.be.a('number')
            }
            done()
        }).catch(done)
    })
})