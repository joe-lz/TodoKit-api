let mongoose = require('mongoose');

let PostSchema = new mongoose.Schema({
  productId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  title: String,
  content: String,
  type: {
    type: Number,
    default: 1
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  createrId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  finisherId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  to: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  level: {
    type: Number,
    default: 1
  },
  noteImg: String,
  version: String,
  tag: String
}, {
  timestamps: true
});

module.exports = PostSchema;
