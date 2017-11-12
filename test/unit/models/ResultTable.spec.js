const { expect } = require('chai')
const ResultTable = require('app/models/ResultTable')

describe('ResultTable', () => {
    it('should accept a column array and data array', () => {
        expect(() => new ResultTable(['Count'], [[1]])).to.not.throw()
    })

    it('should return rows in the correct format', () => {
        const result = new ResultTable(['Year', 'Count'], [[2011, 2], [2013, 8]])
        expect(result.row(0)).to.deep.equal({ Year: 2011, Count: 2})
        expect(result.row(1)).to.deep.equal({ Year: 2013, Count: 8})
    })
})