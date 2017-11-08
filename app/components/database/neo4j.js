const neo4j = require('neo4j-driver').v1
const username = process.env.NEO4J_USERNAME || 'neo4j'
const password = process.env.NEO4J_PASSWORD || 'KoKoNut7R33'
const databaseUri = process.env.NEO4J_URI || 'bolt://localhost:7687'

module.exports = () => {
    const driver = neo4j.driver(databaseUri, neo4j.auth.basic(username, password))
    const session = driver.session()
    return { driver, session }
}
