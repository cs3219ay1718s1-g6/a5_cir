const ResultGraph = require('./ResultGraph')

module.exports = class ResultCenteredGraph extends ResultGraph {
    addNode(id, value) {
        let node = super.addNode(id, value)
        if (id == this._centerId) {
            node.distance = 0
        } else {
            node.distance = Infinity
        }
        return node
    }

    calculateDistance(centerId) {
        if (!this._nodes.hasOwnProperty(centerId)) {
            throw new Error(`Center with ID ${centerId} does not exist`)
        }

        let invertedEdges = {}
        // Invert all the edges
        for (let { source, target } of this.links) {
            if (!invertedEdges.hasOwnProperty(target)) {
                invertedEdges[target] = new Set()
            }
            invertedEdges[target].add(source)
        }
        // Bread-first Search Expansion
        let frontier = [centerId]
        let distance = 0
        let updatedNodeIds = new Set() // Keep track of which nodes have been updated

        while (frontier.length > 0) {
            // Set all the nodes in the frontier to have distance of the current distance
            frontier.forEach(nodeId => {
                this._nodes[nodeId].distance = distance
                updatedNodeIds.add(nodeId)
            })
            // Increment the distance
            distance += 1
            // Create new frontier
            frontier = frontier
                .map(id => invertedEdges[id]) // Select the node IDs from the next frontier
                .filter(set => typeof set !== 'undefined') // Only select the sets that are present
                .map(set => [...set.values()]) // Convert the sets to arrays
                .reduce((a, v) => a.concat(v), []) // Concatenate all the arrays together
        }

        // Set all the unreached nodes to have distance of Infinity
        Object.keys(this._nodes).filter(nodeId => !updatedNodeIds.has(nodeId)).forEach(nodeId => {
            this._nodes[nodeId].distance = Infinity
        })
    }
}