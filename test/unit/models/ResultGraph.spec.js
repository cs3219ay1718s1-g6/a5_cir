const { expect } = require('chai')
const ResultGraph = require('app/models/ResultGraph')

describe('ResultGraph', () => {
    it('should store nodes with their ids', () => {
        let graph = new ResultGraph()
        graph.addNode(0, { hello: 'world' })
        expect(graph.nodes).to.be.an('array').that.is.deep.equal([{
            id: 0,
            hello: 'world'
        }])
    })

    it('should store links as array', () => {
        let graph = new ResultGraph()
        graph.addNode(0, { name: 'a' })
        graph.addNode(1, { name: 'b' })
        graph.connect(0, 1)
        expect(graph.links).to.be.an('array').that.is.deep.equal([{
            source: 0,
            target: 1
        }])
    })

    it('should store link type if any', () => {
        let graph = new ResultGraph()
        graph.addNode(0, { name: 'a' })
        graph.addNode(1, { name: 'b' })
        graph.connect(0, 1, 'before')
        expect(graph.links).to.be.an('array').that.is.deep.equal([
            {
                source: 0,
                target: 1,
                type: 'before'
            }
        ])
    })

    it('should not accept connections between non-existent nodes', () => {
        let graph = new ResultGraph()
        graph.addNode(0, { name: 'a' })
        expect(() => graph.connect(0, 1)).to.throw()
    })

    it('should allow querying of a node by its id', () => {
        let graph = new ResultGraph()
        graph.addNode(1234, { name: 'b' })
        expect(graph.getNode(1234)).to.deep.equal({ name: 'b' })
    })
})