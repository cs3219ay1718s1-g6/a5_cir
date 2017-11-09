module.exports = class Filter {

    constructor() {
        if (this.constructor === Filter) {
            throw new Error('Cannot instantiate abstract class')
        }
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

    static connect (filters) {
        return (input) => {
            if (typeof filters === 'undefined') {
                throw new Error('Filters are required')
            }
            if (filters.constructor !== Array) {
                throw new Error('Filters have to be an array')
            }
            let currentPromise = filters[0].process(input)
            for (let index = 1; index < filters.length; ++index) {
                currentPromise = currentPromise.then(output => filters[index].process(output))
            }
            return currentPromise
        }
    }
}