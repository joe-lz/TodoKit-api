let mongoose = require('mongoose')

let P2uSchema = new mongoose.Schema({
  userId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  productId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }
}, {
  timestamps: true
})

module.exports = P2uSchema
