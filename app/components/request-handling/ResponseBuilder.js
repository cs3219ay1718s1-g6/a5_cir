const Filter = require('../architecture/Filter')
const LabeledTreeNode = require('../data-structures/LabeledTreeNode')
const { Integer } = require('neo4j-driver').v1
const ResultGraph = require('../../models/ResultGraph')

module.exports = class ResponseBuilder extends Filter {
    process(queryResult) {
        switch (queryResult[Symbol.toStringTag]) {
            case 'resultTable':
            return this.handleCountResult(queryResult)

            case 'resultGraph':
            return this.handleNetworkResult(queryResult)

            default:
            return Promise.reject(new Error('Unrecognized query result format'))
        }
    }

    handleCountResult(queryResult) {
        // Build a tree of result
        const root = new LabeledTreeNode(null, 'root')

        const createChildIfNeeded = (node, value, label) => {
            let child = node.child(value)
            if (typeof child === 'undefined') {
                child = new LabeledTreeNode(value, label)
                node.add(child)
            }
            return child
        }

        const populateTree = (parent, rowData, colIndex) => {
            if (colIndex === rowData.length) {
                return
            }
            let node = createChildIfNeeded(parent, rowData[colIndex], queryResult.columns[colIndex])
            populateTree(node, rowData, colIndex + 1)
        }

        for (let rowData of queryResult.data) {
            populateTree(root, rowData, 0)
        }

        return Promise.resolve(root.toObject())
    }

    handleNetworkResult(queryResult) {
        let graph = new ResultGraph()
        let authors = {}
        // Only select valid nodes
        let nodes = queryResult.nodes.filter(node => isFinite(node.distance))

        for (let node of nodes) {
            if (node.label === 'Author') {
                authors[node.id] = node.authorName
            } else if (node.label === 'Paper') {
                graph.addNode(node.id, {
                    title: node.paperTitle,
                    year: node.paperYear,
                    authors: new Set(),
                    distance: node.distance
                })
            }
        }

        for (let link of queryResult.links) {
            // Skip unconnected nodes
            if (!isFinite(queryResult.getNode(link.source).distance) ||
                !isFinite(queryResult.getNode(link.target).distance)) {

                continue
            }

            // Skip unconnected nodes
            if (link.type === 'CONTRIB_TO') {
                graph.getNode(link.target).authors.add(authors[link.source])
            } else if (link.type === 'CITES') {
                graph.connect(link.source, link.target)
            }
        }
        return Promise.resolve({
            nodes: graph.nodes.map(node => Object.assign({}, node, {
                authors: [...node.authors.values()]
            })),
            links: graph.links
        })
    }
}
