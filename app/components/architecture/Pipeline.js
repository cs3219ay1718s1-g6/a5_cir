const Filter = require('./Filter')
const Pipe = require('/Pipe')

module.exports = class Pipeline extends Pipe {
    constructor() {
        // Validate arguments
        if (arguments.length === 0) {
            throw new Error('Pipeline must contain at least 1 filter')
        }
        for (let filter of arguments) {
            if (!(filter instanceof Filter)) {
                throw new Error('Arguments must be Filters')
            }
        }

        super(arguments[0])
        let currentFilter = arguments[0]
        for (let i = 1; i < arguments.length; ++i) {
            currentFilter.addPipe(new Pipe(arguments[i]));
            currentFilter = arguments[i];
        }
    }
}