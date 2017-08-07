let mongoose = require('mongoose')
let UserSchema = require('../schemas/userSchema')

let User = mongoose.model('User', UserSchema)

module.exports = User
