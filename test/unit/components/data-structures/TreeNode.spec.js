const { expect } = require('chai')
const TreeNode = require('app/components/data-structures/TreeNode')

describe('TreeNode', () => {
    it('should retain its value', () => {
        const node = new TreeNode(4)
        expect(node.value).to.equal(4)
    })

    it('should allow access its children', () => {
        const root = new TreeNode(4)
        root.add(new TreeNode(1))
        root.add(new TreeNode(2))
        expect(root.children).to.be.an('array').that.has.lengthOf(2)
    })

    it('should allow adding a value that will be converted into a node', () => {
        const root = new TreeNode(1)
        root.add(2)
        expect(root.children).to.be.an('array').that.has.lengthOf(1)
        expect(root.children[0]).to.be.a('treeNode')
        expect(root.children[0].value).to.equal(2)
    })

    it('should allow retrieval of child node using its value', () => {
        const root = new TreeNode(1)
        const child = new TreeNode(42)
        root.add(child)
        expect(root.child(42)).to.equal(child)
    })

    it('should be recognized as root when there is no parent', () => {
        const root = new TreeNode(0)
        expect(root.isRoot()).to.be.ok
    })

    it('should not be recognized as root when being a child of another node', () => {
        const falseRoot = new TreeNode(1)
        new TreeNode(42).add(falseRoot)
        expect(falseRoot.isRoot()).to.not.be.ok
    })

    it('should have height zero when having no children', () => {
        const root = new TreeNode(42)
        expect(root.height).to.equal(0)
    })

    it('should calculate its height from its children', () => {
        const root = new TreeNode(42)
        root.add(0)
        const child2 = new TreeNode(1)
        root.add(child2)
        child2.add(2)
        expect(root.height).to.equal(2)
    })
})