const Filter = require('../architecture/Filter')
const LabeledTreeNode = require('../data-structures/LabeledTreeNode')
const { Integer } = require('neo4j-driver').v1

const lastElement = (array) => (array.length > 0 ? array[array.length - 1] : null)

module.exports = class ResponseBuilder extends Filter {
    process(queryResult) {
        switch (lastElement(queryResult.columns)) {
            case 'Count':
            return this.handleCountResult(queryResult)

            case 'PaperID':
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
        let nodes = {}
        let links = []

        const createNodeIfNeeded = (id, title) => {
            if (!nodes.hasOwnProperty(id)) {
                nodes[id] = { title, authors: new Set() }
            }
            return nodes[id]
        }

        const addAuthor = (paperId, paperTitle, author) => {
            const paper = createNodeIfNeeded(paperId, paperTitle)
            paper.authors.add(author)
        }

        for (let rowIndex in queryResult.data) {
            let {
                Author,
                CitingPaper,
                CitingID,
                Paper,
                PaperID
            } = queryResult.row(rowIndex)
            addAuthor(CitingID, CitingPaper, Author)
            if (CitingID !== PaperID) {
                links.push({
                    source: CitingID,
                    target: PaperID
                })
            }
        }

        return Promise.resolve({
            nodes: Object.keys(nodes).map(id => Object.assign({}, nodes[id], {
                id,
                authors: [...nodes[id].authors.values()]
            })),
            links
        })
    }
}
