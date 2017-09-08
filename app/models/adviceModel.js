let mongoose = require('mongoose')
let AdviceSchema = require('../schemas/adviceSchema')

let Advice = mongoose.model('Advice', AdviceSchema)

module.exports = Advice
