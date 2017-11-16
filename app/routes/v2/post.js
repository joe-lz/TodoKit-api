var express = require('express');
var router = express.Router();
let mongoose = require('mongoose')
let ObjectId = mongoose.Schema.Types.ObjectId
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
// 更新post
router.post('/update', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  let obj = {
    tag: body.tag,
    type: body.type
  }
  console.log(body.level)
  Post.update({_id: body._id}, {$set: obj}).exec((err, result) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({
      result
    }, res)
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
    if (body.type === "my") {
      // -1 是我创建的
      Post.find({productId, createrId: userId, level: {$lt: 5}}).sort({ createdAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).populate('to').exec((err, allData) => {
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
        console.log(allData)
      })
    } else {
      Post.find(searchObj).sort({ createdAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).populate('to').exec((err, allData) => {
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
    }
  })
})
// 获取指派给我创建的任务
router.post('/mycreate', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  let productId = body.productId
  let level = body.level
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    let searchObj = {
      createrId: userId,
      productId
    }
    if (level > 0) {
      searchObj.level = level
    }
    Post.find(searchObj).sort({ createdAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).populate('to').exec((err, allData) => {
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
      console.log(allData)
    })
  })
})
// 获取指派给我的任务Matrix
// router.post('/myMatrix', _md.signinRequired, (req, res, next) => {
//   let access_token = req.body.access_token
//   let body = req.body.data
//   _md.decodeToken(access_token, (data) => {
//     let userId = data.data._id
//     let searchObj = {
//       to: userId,
//       productId: body.productId,
//       isImportant: body.isImportant,
//       isUrgent:  body.isUrgent,
//       level: {$lt: 5}
//     }
//     if (body.type > 0) {
//       searchObj.type = body.type
//     }
//     Post.find(searchObj).sort({ createdAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).exec((err, allData) => {
//       if (err) {
//         _md.return2(err, res)
//         return
//       }
//       let nextPageNo = body.nextPageNo + 1
//       if (allData.length < body.pageSize) {
//         nextPageNo = 0
//       }
//       _md.return0({
//         allData,
//         nextPageNo
//       }, res)
//     })
//   })
// })

// 获取全部的任务
// router.post('/allbylevel', _md.signinRequired, (req, res, next) => {
//   let access_token = req.body.access_token
//   let body = req.body.data
//   let productId = body.productId
//   let searchObj = {
//     productId
//   }
//   if (body.level > 0) {
//     searchObj.level = body.level
//   }
//   if (body.type > 0) {
//     searchObj.type = body.type
//   }
//   Post.find(searchObj).sort({ createdAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).populate('to').populate('finisherId').exec((err, allData) => {
//     if (err) {
//       _md.return2(err, res)
//       return
//     }
//     let nextPageNo = body.nextPageNo + 1
//     if (allData.length < body.pageSize) {
//       nextPageNo = 0
//     }
//     _md.return0({
//       allData,
//       nextPageNo
//     }, res)
//   })
// })
// 获取全部的任务
router.post('/allbyfilter', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  // 删除空key
  let searchObj = _.pickBy(body.formData, _.identity)
  // searchObj = _.omit(searchObj, ['nextPageNo', 'pageSize'])
  Post.find(searchObj).sort({ createdAt: -1 }).skip((body.nextPageNo - 1)*body.pageSize).limit(body.pageSize).populate('to').populate('finisherId').exec((err, allData) => {
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

// 按标签统计
router.post('/statisticsTag', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  let tagArray = {}
  let matchObj = {productId: mongoose.Types.ObjectId(body.productId)}
  if (body && body.type) {
    matchObj.type = body.type
  }
  // 日期筛选
  if (body && body.dayValue) {
    matchObj.createdAt = {
      $gte: new Date(body.dayValue)
    }
  }
  // version
  if (body && body.version) {
    matchObj.version = body.version
  }
  Post.aggregate([{$match: matchObj}, {$group: {_id: '$tag',count: {$sum: 1}}}, {$project: {no_all: '$count'}}]).exec((err, no_all) => {
    tagArray = no_all
    matchObj.level = 1
    Post.aggregate([{$match: matchObj}, {$group: {_id: '$tag',count: {$sum: 1}}}, {$project: {no_1: '$count'}}]).exec((err, no_1) => {
      tagArray = _.chain(tagArray).map((obj) => {
        no_1.map((curobj) => {
          // obj = _.assign(obj, curobj)
          if (curobj && obj && curobj._id == obj._id) {
            obj.no_1 = curobj.no_1
          }
        })
        if (!no_1 || no_1.length == 0) {obj.no_1 = 0}
        return obj
      })
      matchObj.level = 2
      Post.aggregate([{$match: matchObj}, {$group: {_id: '$tag',count: {$sum: 1}}}, {$project: {no_2: '$count'}}]).exec((err, no_2) => {
        tagArray = _.chain(tagArray).map((obj) => {
          no_2.map((curobj) => {
            // obj = _.assign(obj, curobj)
            if (curobj && obj && curobj._id === obj._id) {
              obj.no_2 = curobj.no_2
            }
          })
          if (!no_2 || no_2.length == 0) {obj.no_2 = 0}
          return obj
        })
        matchObj.level = 5
        Post.aggregate([{$match: matchObj}, {$group: {_id: '$tag',count: {$sum: 1}}}, {$project: {no_5: '$count'}}]).exec((err, no_5) => {
          tagArray = _.chain(tagArray).map((obj) => {
            no_5.map((curobj) => {
              // obj = _.assign(obj, curobj)
              if (curobj && obj && curobj._id === obj._id) {
                obj.no_5 = curobj.no_5
              }
            })
            if (!no_5 || no_5.length == 0) {obj.no_5 = 0}
            return obj
          })
          _md.return0({
            tagArray
          }, res)
        })
      })
    })
  })
})
// 按版本统计
router.post('/statisticsVersion', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  let versionArray = {}
  let matchObj = {productId: mongoose.Types.ObjectId(body.productId)}
  if (body && body.type) {
    matchObj.type = body.type
  }
  // 日期筛选
  if (body && body.dayValue) {
    matchObj.createdAt = {
      $gte: new Date(body.dayValue)
    }
  }
  // version
  if (body && body.version) {
    matchObj.version = body.version
  }
  Post.aggregate([{$match: matchObj}, {$group: {_id: '$version',count: {$sum: 1}}}, {$project: {no_all: '$count'}}]).exec((err, no_all) => {
    versionArray = no_all
    matchObj.level = 1
    Post.aggregate([{$match: matchObj}, {$group: {_id: '$version',count: {$sum: 1}}}, {$project: {no_1: '$count'}}]).exec((err, no_1) => {
      versionArray = _.chain(versionArray).map((obj) => {
        no_1.map((curobj) => {
          // obj = _.assign(obj, curobj)
          if (curobj && obj && curobj._id === obj._id) {
            obj.no_1 = curobj.no_1
          }
        })
        if (!no_1 || no_1.length == 0) {obj.no_1 = 0}
        return obj
      })
      matchObj.level = 2
      Post.aggregate([{$match: matchObj}, {$group: {_id: '$version',count: {$sum: 1}}}, {$project: {no_2: '$count'}}]).exec((err, no_2) => {
        versionArray = _.chain(versionArray).map((obj) => {
          no_2.map((curobj) => {
            // obj = _.assign(obj, curobj)
            if (curobj && obj && curobj._id === obj._id) {
              obj.no_2 = curobj.no_2
            }
          })
          if (!no_2 || no_2.length == 0) {obj.no_2 = 0}
          return obj
        })
        matchObj.level = 5
        Post.aggregate([{$match: matchObj}, {$group: {_id: '$version',count: {$sum: 1}}}, {$project: {no_5: '$count'}}]).exec((err, no_5) => {
          versionArray = _.chain(versionArray).map((obj) => {
            no_5.map((curobj) => {
              // obj = _.assign(obj, curobj)
              if (curobj && obj && curobj._id === obj._id) {
                obj.no_5 = curobj.no_5
              }
            })
            if (!no_5 || no_5.length == 0) {obj.no_5 = 0}
            return obj
          })
          _md.return0({
            versionArray
          }, res)
        })
      })
    })
  })
})
module.exports = router;
