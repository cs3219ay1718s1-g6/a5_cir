module.exports = class ResultGraph {
    constructor() {
        this._nodes = {}
        this._links = {}
    }

    addNode(id, value) {
        if (!this._nodes.hasOwnProperty(id)) {
            this._nodes[id] = value
            this._cachedNodes = undefined
        }
        return this._nodes[id] = value
    }

    connect(sourceId, targetId, type = true) {
        if (!this._nodes.hasOwnProperty(sourceId) ||
            !this._nodes.hasOwnProperty(targetId)) {

            throw new Error('Can only connect existing nodes')
        }
        if (!this._links.hasOwnProperty(sourceId)) {
            this._links[sourceId] = {}
            this._cachedLinks = undefined
        }
        if (this._links[sourceId][targetId] !== type) {
            this._links[sourceId][targetId] = type
            this._cachedLinks = undefined
        }
    }

    get [Symbol.toStringTag] () {
        return 'resultGraph'
    }

    get nodes () {
        if (typeof this._cachedNodes === 'undefined') {
            this._cachedNodes = Object.keys(this._nodes).map(id => Object.assign({}, this._nodes[id], { 
                id: parseNodeId(id)
            }))
        }
        return this._cachedNodes
    }

    get links () {
        if (typeof this._cachedLinks === 'undefined') {
            this._cachedLinks = Object.keys(this._links).map(sourceId => Object.keys(this._links[sourceId]).map(targetId => {
                let linkObject = {
                    source: parseNodeId(sourceId),
                    target: parseNodeId(targetId)
                }
                let linkType = this._links[sourceId][targetId]
                if (linkType !== true) {
                    linkObject.type = linkType
                }
                return linkObject
            })).reduce((a, v) => a.concat(v), [])
        }
        return this._cachedLinks
    }

    getNode (nodeId) {
        return this._nodes[nodeId]
    }

    getTargetIds(sourceId) {
        return Object.keys(this._links[sourceId] || {}).map(parseNodeId)
    }

    getTargetNodes(sourceId) {
        return this.getTargetIds(sourceId).map(target => this._nodes[target])
            .filter(n => typeof n !== 'undefined')
    }
}

const parseNodeId = (nodeId) => /^\d+$/.test(nodeId) ? parseInt(nodeId) : nodeId