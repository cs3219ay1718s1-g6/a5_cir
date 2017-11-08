module.exports = class TreeNode {
    constructor(value) {
        this._value = value
    }

    get value () { return this._value }
    get childValueMap() {
        if (typeof this._childValueMap === 'undefined') {
            this._childValueMap = {}
        }
        return this._childValueMap
    }
    get children () {
        if (typeof this._children === 'undefined') {
            this._children = []
        }
        return this._children
    }
    set parent (p) {
        this._parent = p
    }
    get parent () {
        return this._parent
    }
    isRoot() {
        return typeof this._parent === 'undefined' || this._parent === null || !(this._parent instanceof TreeNode)
    }

    child(value) {
        return this.childValueMap[value]
    }

    get height () { 
        if (this.children.length === 0) {
            return 0;
        }
        return Math.max(...this.children.map(n => n.height)) + 1
    }

    add(node) {
        if (!(node instanceof TreeNode)) {
            node = new TreeNode(node)
        }
        if (!this.childValueMap.hasOwnProperty(node.value)) {
            this.childValueMap[node.value] = node
            this.children.push(node)
            node.parent = this
            return node
        } else {
            return this.childValueMap[node.value]
        }
    }

    get [Symbol.toStringTag] () {
        return 'treeNode'
    }
}