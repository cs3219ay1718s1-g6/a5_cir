module.exports = class ResultGraph {
    constructor() {
        this._nodes = {}
        this._links = {}
    }

    addNode(id, value) {
        if (!this._nodes.hasOwnProperty(id)) {
            this._nodes[id] = value
        }
        return this._nodes[id] = value
    }

    connect(sourceId, targetId) {
        if (!this._nodes.hasOwnProperty(sourceId) ||
            !this._nodes.hasOwnProperty(targetId)) {

            throw new Error('Can only connect existing nodes')
        }
        if (!this._links.hasOwnProperty(sourceId)) {
            this._links[sourceId] = {}
        }
        this._links[sourceId][targetId] = true
    }

    get [Symbol.toStringTag] () {
        return 'resultGraph'
    }

    get nodes () {
        return Object.keys(this._nodes).map(id => Object.assign({}, this._nodes[id], { id }))
    }

    get links () {
        return Object.keys(this._links).map(source => Object.keys(this._links[source]).map(target => ({
            source,
            target
        }))).reduce((a, v) => a.concat(v), [])
    }
}