let mongoose = require('mongoose');

let ProductSchema = new mongoose.Schema({
  name: String,
  logo: {
    type: 'String'
    // default: 'https://ws2.sinaimg.cn/large/006tNc79gy1fhmcbjfpnuj30780783yb.jpg'
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
    default: ['网页', 'IOS', 'Android', '服务端']
  },
  versions: {
    type: Array,
    default: ['1.0']
  }
}, {
  timestamps: true
});

module.exports = ProductSchema;
