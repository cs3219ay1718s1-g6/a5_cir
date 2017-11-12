const { expect } = require('chai')
const ResultCenteredGraph = require('app/models/ResultCenteredGraph')

describe('ResultCenteredGraph', () => {
    it('should correctly calculate the distance from center for linked nodes', () => {
        let graph = new ResultCenteredGraph()
        graph.addNode('first', { name: 'a' })
        graph.addNode('second', { name: 'b' })
        graph.connect('second', 'first')
        graph.calculateDistance('first')
        expect(graph.getNode('first').distance).to.equal(0)
        expect(graph.getNode('second').distance).to.equal(1)
    })

    it('should mark nodes disconnected from center as having Infinity distance', () => {
        let graph = new ResultCenteredGraph()
        graph.addNode('first', { name: 'a' })
        graph.addNode('second', { name: 'b' })
        graph.calculateDistance('first')
        expect(graph.getNode('second').distance).to.equal(Infinity)
    })

    it('should require a center node ID for calculating distances', () => {
        let graph = new ResultCenteredGraph()
        graph.addNode('first', { name: 'a' })
        graph.addNode('second', { name: 'b' })
        graph.connect('second', 'first')
        expect(() => graph.calculateDistance()).to.throw()
    })

    it('should refresh the distances across calculations', () => {
        let graph = new ResultCenteredGraph()
        graph.addNode('first',  { name: 'a' })
        graph.addNode('second', { name: 'b' })
        graph.addNode('third',  { name: 'c' })
        graph.addNode('fourth', { name: 'd' })
        graph.connect('second', 'first')
        graph.connect('fourth', 'third')

        graph.calculateDistance('first')
        graph.calculateDistance('third')
        expect(graph.getNode('first').distance).to.equal(Infinity)
        expect(graph.getNode('second').distance).to.equal(Infinity)
        expect(graph.getNode('third').distance).to.equal(0)
        expect(graph.getNode('fourth').distance).to.equal(1)
    })
})