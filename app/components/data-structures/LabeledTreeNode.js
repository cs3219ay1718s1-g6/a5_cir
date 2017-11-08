const TreeNode = require('./TreeNode')

module.exports = class LabeledTreeNode extends TreeNode {
    constructor(value, label) {
        super(value)
        if (typeof label === 'undefined') {
            throw new Error('Label is required')
        }
        if (label.constructor !== String) {
            throw new Error('Label has to be a String')
        }
        this._label = label
    }

    get label() { return this._label }

    add(node, label) {
        if (!(node instanceof LabeledTreeNode)) {
            node = new LabeledTreeNode(node, label)
        }
        return super.add(node)
    }

    toObject() {
        if (this.height === 0 && !this.isRoot()) {
            return this.value
        }
        let object = {}
        for (let child of this.children) {
            if (child.height === 1 && child.children.length === 1) {
                object[child.value] = child.children[0].value
            } else {
                let key = child.value
                if (child.height === 0 && child.parent.isRoot()) {
                    key = child.label
                }
                object[key] = child.toObject()
            }
        }
        return object
    }
}