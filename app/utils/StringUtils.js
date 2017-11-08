module.exports = {
    capitalize (string) {
        return string.replace(/\b[a-z]/g, c => c.toUpperCase())
    }
}