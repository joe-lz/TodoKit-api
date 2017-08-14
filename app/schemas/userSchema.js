let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  position: String,
  mobile: Number,
  avatar: {
    type: 'String',
    default: 'avatar/598d60ddbd61ba810490ded0/d2551f28-c2de-4ab1-8007-3d6412766f31'
  },
  level: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = UserSchema;
