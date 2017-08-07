let mongoose = require('mongoose')

let P2uSchema = new mongoose.Schema({
  postId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  productId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  from: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  to: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  action: Number,
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

module.exports = P2uSchema
