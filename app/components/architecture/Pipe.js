const Filter = require('./Filter')

module.exports = class Pipe {
    /**
     * Constructs a new pipe that outputs data to the specified filter. 
     * @param {Filter} outputFilter - the target filter that receives data from
     *                                this pipe
     */
    constructor(outputFilter) {
        if (typeof outputFilter === 'undefined') {
            throw new Error('Output Filter is required')
        }
        this.outputFilter = outputFilter
    }

    /**
     * Pushes the data through to the target filter and propagates the result
     * to further filters. 
     * @param {any} data - the data to be processed by the filter connected by
     *                     this pipe
     */
    receive(data) {
        this.outputFilter.process(data).then(result => {
            // Propagate the result
            for (let filter of this.outputFilter.pipes) {
                filter.receive(result)
            }
        }).catch(error => {
            console.error(error)
        })
    }
}