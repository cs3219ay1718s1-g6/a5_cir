module.exports = {
    capitalize (string) {
        return string.replace(/\b[a-z]/g, c => c.toUpperCase())
    },

    normalize (string) {
        return string.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w]+/g, '')
            .replace(/_{2,}/g, '_')
    },

    strip (string) {
        return string.trim()
            .toLowerCase()
            .replace(/[^a-z\s]/g, '')
    }
}