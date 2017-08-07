let mongoose = require('mongoose')
let PostSchema = require('../schemas/postSchema')

let Post = mongoose.model('Post', PostSchema)

module.exports = Post
