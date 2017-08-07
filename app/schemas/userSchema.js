let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  position: String,
  avatar: {
    type: 'String',
    default: 'https://ws2.sinaimg.cn/large/006tKfTcgy1fi4khmu1erj305k05k3yl.jpg'
  },
  level: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = UserSchema;
