const Filter = require('../architecture/Filter')
const { normalize } = require('../../utils/StringUtils')

// Constants
const COUNT_ALLOWED_KEYS = new Set(['years', 'start', 'end', 'venues', 'authors'])
const TOP_ALLOWED_KEYS = new Set(['year', 'venue', 'author', 'limit', 'context', 'years', 'venues'])
const NETWORK_ALLOWED_MODULES = new Set(['papers'])

module.exports = class RequestParser extends Filter {
    /**
     * @param {Request} req - a HTTP request
     * @return {Promise<Object>} - a Promise that resolves to the parsed command
     */
    process(req) {
        if (req.method === 'GET') {
            switch (req.params.action) {
                case 'count':
                return this.processCountRequest(req)

                case 'top':
                return this.processTopRequest(req)

                case 'network':
                return this.processNetworkRequest(req)

                default:
                // Do nothing
            }
        }
        return Promise.reject(new Error(`Unrecognized action '${req.params.action}'`))
    }

    // Helper methods
    processCountRequest({ params, query }) {
        let result = { count: params.module }
        for (let key in query) {
            if (COUNT_ALLOWED_KEYS.has(key)) {
                result[key] = query[key]

                if (key === 'venues') {
                    result[key] = result[key].map(v => normalize(v))
                }

            } else if (key === 'groups') {
                result[key] = query[key].filter(k => COUNT_ALLOWED_KEYS.has(k))
                    .map(v => normalize(v))
            }
        }

        return Promise.resolve(result)
    }

    processTopRequest({ params, query }) {
        if (!query.hasOwnProperty('limit')) {
            return Promise.reject(new Error('Limit has to be specified'))
        }
        
        let result = { top: params.module }
        for (let key in query) {
            if (TOP_ALLOWED_KEYS.has(key)) {
                result[key] = query[key]

                if (key === 'venue') {
                    result[key] = result[key].toLowerCase()
                }
            }
        }
        return Promise.resolve(result)
    }

    processNetworkRequest({ params, query }) {
        // Verify module
        if (!NETWORK_ALLOWED_MODULES.has(params.module)) {
            return Promise.reject(new Error('No known recipe to construct a network of ' + params.module))
        }

        // Default length to 2
        let length = query.length || 2
        let center = query.center

        if (params.module === 'papers') {
            center = center.toLowerCase()
        }

        return Promise.resolve({
            network: params.module,
            length,
            center
        })
    }
}