var express = require('express');
var router = express.Router();

let Post = require('../../models/postModel')
let Log = require('../../models/logModel')
let Config = require('./_config.js')
let _md = require('./_md.js')

// 创建任务
router.post('/create', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  // 1、创建curPost
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    body.createrId = userId
    body.level = 1
    let newPost = new Post(body)
    newPost.save((err, curPost) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      res.io.emit('NewPost', {
        to: body.to,
        content: curPost.title
      })
      // 2、创建第一个日志
      let logForm = {
        postId: curPost._id,
        productId: curPost.productId,
        from: userId,
        to: curPost.to,
        action: 1,
        content: '',
        isRead: false
      }
      let newLog = new Log(logForm)
      newLog.save((err, curLog) => {
        if (err) {
          _md.return2(err, res)
          return
        }
        _md.return0({curLog, curPost}, res)
      })
    })
  })
})

// 获取指派给我的任务
router.post('/my', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  let productId = body.productId
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    Post.find({to: userId, productId}).sort({ updatedAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).exec((err, allData) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      let nextPageNo = body.nextPageNo + 1
      if (allData.length < body.pageSize) {
        nextPageNo = 0
      }
      _md.return0({
        allData,
        nextPageNo
      }, res)
    })
  })
})

// 获取指派给我的任务Matrix
router.post('/myMatrix', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  let productId = body.productId
  let isImportant = body.isImportant
  let isUrgent = body.isUrgent
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    Post.find({to: userId, productId, isImportant, isUrgent}).sort({ updatedAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).exec((err, allData) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      let nextPageNo = body.nextPageNo + 1
      if (allData.length < body.pageSize) {
        nextPageNo = 0
      }
      _md.return0({
        allData,
        nextPageNo
      }, res)
    })
  })
})

// 获取全部的任务
router.post('/allbylevel', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  let productId = body.productId
  let searchbody = {
    productId
  }
  if (body.level > 0) {
    searchbody.level = body.level
  }
  Post.find(searchbody).sort({ updatedAt: -1 }).populate('to').exec((err, allData) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({
      allData
    }, res)
  })
})
module.exports = router;
