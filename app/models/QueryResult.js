module.exports = class QueryResult {
    constructor(columns, data) {
        this._columns = columns
        this._data = data
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
        return 'queryResult'
    }

    static empty () {
        return new QueryResult([], [])
    }
}