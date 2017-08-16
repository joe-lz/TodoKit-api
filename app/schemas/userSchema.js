let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  position: String,
  mobile: Number,
  avatar: {
    type: 'String',
    default: 'default/avatar.png'
  },
  level: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = UserSchema;
