const { expect } = require('chai')
const LabeledTreeNode = require('app/components/data-structures/LabeledTreeNode')

describe('LabeledTreeNode', () => {
    it('should require the presence of a label', () => {
        expect(() => new LabeledTreeNode(42)).to.throw()
    })

    it('should require a String label', () => {
        expect(() => new LabeledTreeNode(42, 1)).to.throw()
    })

    it('should allow adding child specifying a value and a label', () => {
        const root = new LabeledTreeNode(0, 'root')
        expect(() => root.add(1, 'child')).to.not.throw()
    })

    it('should disallow adding child specifying only a value', () => {
        const root = new LabeledTreeNode(0, 'root')
        expect(() => root.add(1)).to.throw()
    })

    it('should return an empty object on conversion to object if is root', () => {
        const root = new LabeledTreeNode(null, 'root')
        expect(root.toObject()).to.deep.equal({})
    })

    it('should convert to object correctly for simple tree', () => {
        const root = new LabeledTreeNode(null, 'root')
        root.add(5, 'count')
        expect(root.toObject()).to.deep.equal({
            count: 5
        })
    })

    it('should convert to object correctly for complex tree', () => {
        const root = new LabeledTreeNode(null, 'root')
        const arxiv = root.add('ArXiV', 'venue')
        arxiv.add(2012, 'year').add(5, 'count')
        arxiv.add(2013, 'year').add(10, 'count')
        const icse = root.add('ICSE', 'venue')
        icse.add(2012, 'year').add(7, 'count')
        icse.add(2013, 'year').add(13, 'count')
        expect(root.toObject()).to.deep.equal({
            'ArXiV': {
                2012: 5,
                2013: 10
            },
            'ICSE': {
                2012: 7,
                2013: 13
            }
        })
    })
})