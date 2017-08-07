let mongoose = require('mongoose')
let LogSchema = require('../schemas/logSchema')

let Log = mongoose.model('Log', LogSchema)

module.exports = Log
