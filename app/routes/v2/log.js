var express = require('express');
var router = express.Router();

let Log = require('../../models/logModel')
let Post = require('../../models/postModel')
let Config = require('./_config.js')
let _md = require('./_md.js')

// 创建日志
router.post('/create', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  if (body.action == 1) {
    // body.action === 1 指派
    // 1、将post.to 改为body.to,      将post.level 改为 1
    Post.update({_id: body.postId}, {$set: {to: body.to, level: 1}}).exec((err, result) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      res.io.emit('NewPost', {
        to: body.to,
        content: '一个新转派任务等待你完成'
      })
      _md.decodeToken(access_token, (data) => {
        let userId = data.data._id
        // 2、创建curLog
        body.from = userId
        let newLog = new Log(body)
        newLog.save((err, curLog) => {
          if (err) {
            _md.return2(err, res)
            return
          }
          _md.return0({curLog}, res)
        })
      })
    })
  } else if (body.action == 2) {
    // body.action === 2 完成
    // 1、将post.to 改为body.to   将post.level 改为 2, finisherId: userId
    _md.decodeToken(access_token, (data) => {
      let userId = data.data._id
      Post.update({_id: body.postId}, {$set: {to: body.to, level: 2, finisherId: userId}}).exec((err, result) => {
        if (err) {
          _md.return2(err, res)
          return
        }
        res.io.emit('NewPost', {
          to: body.to,
          content: '一个新任务等待你审核'
        })
        // 2、创建curLog
        body.from = userId
        let newLog = new Log(body)
        newLog.save((err, curLog) => {
          if (err) {
            _md.return2(err, res)
            return
          }
          _md.return0({curLog}, res)
        })
      })
    })
  } else if (body.action == 3) {
    // body.action === 3 拒绝
  } else if (body.action == 4) {
    // body.action === 4 评论
    // 1、拿到from
    _md.decodeToken(access_token, (data) => {
      let userId = data.data._id
      // 2、创建curLog
      body.from = userId
      let newLog = new Log(body)
      newLog.save((err, curLog) => {
        if (err) {
          _md.return2(err, res)
          return
        }
        res.io.emit('NewLog', {
          to: body.to,
          content: '一个新消息等待你查看',
          curLog: curLog
        })
        _md.return0({curLog}, res)
      })
    })
  } else if (body.action == 5) {
    // body.action === 5 归档
    // 1、将post.level 改为 5
    Post.update({_id: body.postId}, {$set: {level: 5}}).exec((err, result) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      _md.decodeToken(access_token, (data) => {
        let userId = data.data._id
        // 2、创建curLog
        body.from = userId
        body.to = userId
        let newLog = new Log(body)
        newLog.save((err, curLog) => {
          if (err) {
            _md.return2(err, res)
            return
          }
          _md.return0({curLog}, res)
        })
      })
    })
  }
})

// alllog  by postId
router.post('/all', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  // 1 查找出该post的所有日志
  Log.find({postId: body.postId}).sort({ createdAt: -1 }).limit(50).populate('from').populate('to').exec((err, allData) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    // 2 把该post的日志中to是我的设置为已读
    _md.decodeToken(access_token, (data) => {
      let userId = data.data._id
      Log.update({postId: body.postId, to: userId}, {$set: {isRead: true}},{multi: true}).exec((err2, result) => {
        if (err2) {
          _md.return2(err2, res)
          return
        }
        res.io.emit('ChangeIsRead', {
          postId: body.postId
        })
        _md.return0({
          allData
        }, res)
      })
    })
  })
})
// alllog my 我的消息
router.post('/my', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    // 2、创建curLog
    Log.find({productId: body.productId, to: userId, isRead: body.isRead}).sort({ createdAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).populate('from').populate('to').populate('postId').exec((err, allData) => {
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
router.post('/myall', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    // 2、创建curLog
    Log.find({productId: body.productId, to: userId}).sort({ createdAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).populate('from').populate('to').populate('postId').exec((err, allData) => {
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

module.exports = router;
