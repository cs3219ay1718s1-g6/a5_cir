const Filter = require('../architecture/Filter')
const { normalize } = require('../../utils/StringUtils')

// Constants
const TREND_ALLOWED_KEYS = new Set(['years', 'start', 'end', 'venues'])

module.exports = class RequestParser extends Filter {
    /**
     * @param {Request} req - a HTTP request
     * @return {Promise<Object>} - a Promise that resolves to the parsed command
     */
    process(req) {
        if (req.method === 'GET') {
            switch (req.params.module) {
                case 'trend':
                return this.processTrend(req.query)

                default:
                // Do nothing
            }
        }
        return Promise.reject(new Error(`Unrecognized module '${req.params.module}'`))
    }

    // Helper methods
    processTrend(query) {
        let result = { type: 'TREND' }
        for (let key in query) {
            if (TREND_ALLOWED_KEYS.has(key)) {
                result[key] = query[key]

                if (key === 'venues') {
                    result[key] = result[key].map(v => normalize(v))
                }

            } else if (key === 'groups') {
                result[key] = query[key].filter(k => TREND_ALLOWED_KEYS.has(k))
                    .map(v => normalize(v))
            }
        }

        return Promise.resolve(result)
    }
}