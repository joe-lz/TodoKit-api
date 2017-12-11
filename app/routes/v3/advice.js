var express = require('express');
var router = express.Router();
let mongoose = require('mongoose')
let ObjectId = mongoose.Schema.Types.ObjectId
let _ = require('lodash')
let Advice = require('../../models/adviceModel')
let Config = require('./_config.js')
let _md = require('./_md.js')

// 创建任务
router.post('/create', (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  // 1、创建curAdvice
  let newAdvice = new Advice(body)
  newAdvice.save((err, curAdvice) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    res.io.emit('NewAdvice', {
      to: body.productId,
      content: '当前产品有新的意见收集，赶紧处理吧'
    })
    _md.return0({curAdvice}, res)
  })
})

router.post('/allbyfilter', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  // 删除空key
  Advice.find({productId: body.productId}).sort({ createdAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).exec((err, allData) => {
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

router.post('/changeLevel', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  Advice.update({_id: body._id}, {$set: {level: body.level}}).exec((err, result) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({
      result
    }, res)
  })
})
// 删除
router.post('/del', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  Advice.remove({_id: body._id}).exec((err, result) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({result}, res)
  })
})
module.exports = router;
