let mongoose = require('mongoose');

let ProductSchema = new mongoose.Schema({
  name: String,
  logo: {
    type: 'String',
    default: 'productlogo/09023417-ef12-491d-a0d9-6e73e80d3c3d1504771532791'
  },
  createrId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  memberNo: {
    type: Number,
    default: 10
  },
  tags: {
    type: Array,
    default: ['网页', 'iOS', 'Android', '服务端']
  },
  versions: {
    type: Array,
    default: ['1.0']
  }
}, {
  timestamps: true
});

module.exports = ProductSchema;
