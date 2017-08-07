let mongoose = require('mongoose')
let ProductSchema = require('../schemas/productSchema')

let Product = mongoose.model('Product', ProductSchema)

module.exports = Product
