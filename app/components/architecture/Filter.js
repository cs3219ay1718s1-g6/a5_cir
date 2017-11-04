const { List } = require('immutable')

module.exports = class Filter {

    constructor() {
        if (this.constructor === Filter) {
            throw new Error('Cannot instantiate abstract class')
        }
        this._pipes = []
    }

    /**
     * Process the data asynchronously.
     * @param {any} data - the data to be processed
     * @return {Promise} - a Promise that resolves to the result of the filter
     */
    process(data) {
        // abstract
        throw new Error('Unimplemented')
    }

    /**
     * Add a pipe which will receive output data from this filter.
     * @param {Pipe} pipe 
     */
    addPipe(pipe) {
        this._pipes.push(pipe)
    }

    /**
     * Get an immutable List of the filter's pipes.
     * @return {List} - an immutable List containing the pipes
     */
    get pipes () {
        return new List(this._pipes)
    }
}