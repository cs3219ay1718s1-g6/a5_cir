const { expect } = require('chai')
const ResponseBuilder = require('app/components/request-handling/ResponseBuilder')
const ResultTable = require('app/models/ResultTable')
const ResultGraph = require('app/models/ResultGraph')
const ResultCenteredGraph = require('app/models/ResultCenteredGraph')

describe('ResponseBuilder', () => {
    it('should group result according to columns', done => {
        const builder = new ResponseBuilder()
        builder.process(new ResultTable(
            ['Venue', 'Year', 'Count'],
            [
                ['ArXiV', 2012, 10],
                ['ArXiV', 2013, 15],
                ['ICSE', 2012, 5],
                ['ICSE', 2013, 20]
            ]
        )).then(result => {
            expect(result).to.be.an('object').that.is.deep.equal({
                'ArXiV': {
                    2012: 10,
                    2013: 15,
                },
                'ICSE': {
                    2012: 5,
                    2013: 20
                }
            })
            done()
        }).catch(done)
    })

    it('should rearrange simple papers graph correctly', done => {
        let graph = new ResultGraph()
        graph.addNode(12345, { label: 'Paper', paperID: 'abcdefgh', paperTitle: 'ABC of D', paperYear: 2011, distance: 0 })
        graph.addNode(12346, { label: 'Paper', paperID: 'abcdefgj', paperTitle: 'EFG of H', paperYear: 2012, distance: 1 })
        graph.addNode(98765, { label: 'Author', authorID: 34567, authorName: 'Damien Chablat', distance: 2 })
        graph.addNode(98766, { label: 'Author', authorID: 34568, authorName: 'Cheng-Cheng Guo', distance: 2 })
        graph.connect(98765, 12345, 'CONTRIB_TO')
        graph.connect(98766, 12346, 'CONTRIB_TO')
        graph.connect(12346, 12345, 'CITES')
        const builder = new ResponseBuilder()
        builder.process(graph).then(result => {
            expect(result).to.be.an('object').that.is.deep.equal({
                nodes: [
                    { id: 12345, title: 'ABC of D', year: 2011, authors: ['Damien Chablat'  ], distance: 0 },
                    { id: 12346, title: 'EFG of H', year: 2012, authors: ['Cheng-Cheng Guo' ], distance: 1 }
                ],
                links: [
                    { source: 12346, target: 12345 }
                ]
            })
            done()
        }).catch(done)
    })

    it('should not include Infinity distance nodes in papers graph', done => {
        let graph = new ResultCenteredGraph()
        graph.addNode(12345, { label: 'Paper', paperID: 'abcdefgh', paperTitle: 'ABC of D', paperYear: 2011 })
        graph.addNode(12346, { label: 'Paper', paperID: 'abcdefgj', paperTitle: 'EFG of H', paperYear: 2012 })
        graph.addNode(12347, { label: 'Paper', paperID: 'abcdefgk', paperTitle: 'IJK of L', paperYear: 2013 })
        graph.addNode(98765, { label: 'Author', authorID: 34567, authorName: 'Damien Chablat' })
        graph.addNode(98766, { label: 'Author', authorID: 34568, authorName: 'Cheng-Cheng Guo' })
        graph.connect(98765, 12345, 'CONTRIB_TO')
        graph.connect(98766, 12346, 'CONTRIB_TO')
        graph.connect(12346, 12345, 'CITES')

        graph.connect(12345, 12347, 'CITES')
        graph.calculateDistance(12345)
        
        const builder = new ResponseBuilder()
        builder.process(graph).then(result => {
            expect(result.nodes.find(node => node.id === 12347)).to.be.undefined
            done()
        }).catch(done)
    })
})