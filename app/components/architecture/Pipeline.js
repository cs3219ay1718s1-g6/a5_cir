const Filter = require('./Filter')
const Pipe = require('./Pipe')

module.exports = class Pipeline extends Pipe {
    constructor() {
        // Validate arguments
        if (arguments.length === 0) {
            throw new Error('Pipeline must contain at least 1 filter')
        }
        let filters = arguments
        if (filters.length === 1 && filters[0].constructor === Array) {
            filters = filters[0]
        }

        for (let filter of filters) {
            if (!(filter instanceof Filter)) {
                throw new Error('Arguments must be Filters')
            }
        }

        super(filters[0])
        let currentFilter = filters[0]
        for (let i = 1; i < filters.length; ++i) {
            currentFilter.addPipe(new Pipe(filters[i]));
            currentFilter = filters[i];
        }
    }
}