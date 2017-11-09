const Filter = require('../architecture/Filter')
const LabeledTreeNode = require('../data-structures/LabeledTreeNode')
const { Integer } = require('neo4j-driver').v1

module.exports = class ResponseBuilder extends Filter {
    process(queryResult) {
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
}
