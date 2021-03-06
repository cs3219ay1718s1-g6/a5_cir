module.exports = class ResultTable {
    constructor(columns, data) {
        this._columns = columns
        this._data = data.map(row => row.map(value => {
            if (value instanceof Object && value.toNumber) {
                value = value.toNumber()
            }
            return value
        }))
    }

    get columns () { return this._columns }
    get data () { return this._data }
    get length () { return this._data.length }
    isEmpty() { return this.data.length === 0 }

    row (index) {
        let row = {}
        for (let columnIndex in this.columns) {
            row[this.columns[columnIndex]] = this.data[index][columnIndex] 
        }
        return row
    }

    get [Symbol.toStringTag] () {
        return 'resultTable'
    }

    static empty () {
        return new ResultTable([], [])
    }
}