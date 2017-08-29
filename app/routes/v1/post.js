var express = require('express');
var router = express.Router();

let _ = require('lodash')
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
    let searchObj = {
      to: userId,
      productId,
      level: {$lt: 5}
    }
    if (body.type > 0) {
      searchObj.type = body.type
    }
    Post.find(searchObj).sort({ updatedAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).populate('to').exec((err, allData) => {
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
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    let searchObj = {
      to: userId,
      productId: body.productId,
      isImportant: body.isImportant,
      isUrgent:  body.isUrgent,
      level: {$lt: 5}
    }
    if (body.type > 0) {
      searchObj.type = body.type
    }
    Post.find(searchObj).sort({ updatedAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).exec((err, allData) => {
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
  let searchObj = {
    productId
  }
  if (body.level > 0) {
    searchObj.level = body.level
  }
  if (body.type > 0) {
    searchObj.type = body.type
  }
  Post.find(searchObj).sort({ updatedAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).populate('to').exec((err, allData) => {
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
// 获取全部的任务
router.post('/allbyfilter', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  let searchObj = _.pickBy(body.formData, _.identity)
  // searchObj = _.omit(searchObj, ['nextPageNo', 'pageSize'])
  console.log(searchObj)
  Post.find(searchObj).sort({ updatedAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).populate('to').populate('finisherId').exec((err, allData) => {
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
module.exports = router;
