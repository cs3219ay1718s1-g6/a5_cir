module.exports = class Neo4jQuery {
    constructor() {
        this._selectors = []
        this._conditions = []
        this._aliases = []
        this._orderBy = null
        this._orderDescending = true
        this._returns = []
        this._limit = Infinity
    }

    addSelector(raw) {
        this._selectors.push(raw)
    }

    addCondition(raw) {
        this._conditions.push(raw)
    }

    addAlias(property, alias) {
        this._aliases.push({
            property,
            alias
        })
    }

    addReturn() {
        let values = arguments
        if (values.length === 1 && values[0].constructor === Array) {
            values = values[0]
        }
        Array.prototype.push.apply(this._returns, values)
    }

    set limit(l) {
        this._limit = l
    }

    orderBy(property, descending = true) {
        this._orderBy = property
        this._orderDescending = descending
    }

    generate() {
        return [
            this._selectors.map(s => 'MATCH ' + s).join(' '),
            this._conditions.length === 0 ? null : 'WHERE ' + this._conditions.join(' AND '),
            this._aliases.length === 0 ? null: 'WITH ' + this._aliases.map(({ property, alias }) => `${property} AS ${alias}`).join(', '),
            this._orderBy === null ? null : ('ORDER BY ' + this._orderBy + ' ' + (this._orderDescending ? 'DESC' : 'ASC')),
            'RETURN ' + this._returns.join(', '),
            isFinite(this._limit) ? `LIMIT ${this._limit}` : null
        ].filter(c => c !== null).join(' ') + ';'
    }
}