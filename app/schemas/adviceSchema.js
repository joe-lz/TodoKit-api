let mongoose = require('mongoose');

let AdviceSchema = new mongoose.Schema({
  productId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  content: String,
  level: {
    type: Number,
    default: 1
  },
  adviceImg: String
}, {
  timestamps: true
});

module.exports = AdviceSchema;
