let mongoose = require('mongoose')
let P2uSchema = require('../schemas/p2uSchema')

let P2u = mongoose.model('P2u', P2uSchema)

module.exports = P2u
