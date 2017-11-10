// Import packages
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')

// Import submodules
const router = require('./app/router')

// Initialize server
const app = express()

// Allow Cross-Origin queries to be made
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})

// Declare middlewares
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Activate the API endpoint
app.use('/api', router)

// Listen to HTTP requests
const port = process.env.PORT || 8080
app.listen(port, () => console.log('CIR server listening on port ' + port))