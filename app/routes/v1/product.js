var express = require('express');
var router = express.Router();

let P2u = require('../../models/p2uModel')
let Product = require('../../models/productModel')
let User = require('../../models/userModel')
let Config = require('./_config.js')
let _md = require('./_md.js')

// 获取我的产品
router.post('/my', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    P2u.find({userId: userId}).populate('productId').exec((err, allData) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      _md.return0({
        allData
      }, res)
    })
  })
})
// 获取产品消息
router.post('/info', (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  Product.findOne({_id: body.productId}).exec((err, curProduct) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({
      curProduct
    }, res)
  })
})
// 更新产品消息
router.post('/setting', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  Product.update({_id: body._id}, {$set: body}).exec((err, result) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({
      result
    }, res)
  })
})
// 添加versions
router.post('/addVersions', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  if (!body.version) {
    _md.return1('参数不正确', {}, res)
    return
  }
  Product.update({_id: body._id}, {'$addToSet': {'versions': body.version}}).exec((err, result) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({
      result
    }, res)
  })
})
// 删除versions
router.post('/delVersions', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  if (!body.version) {
    _md.return1('参数不正确', {}, res)
    return
  }
  Product.update({_id: body._id}, {'$pull': {'versions': body.version}}).exec((err, result) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({
      result
    }, res)
  })
})
// 添加tags
router.post('/addTags', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  if (!body.tag) {
    _md.return1('参数不正确', {}, res)
    return
  }
  Product.update({_id: body._id}, {'$addToSet': {'tags': body.tag}}).exec((err, result) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({
      result
    }, res)
  })
})
// 删除tags
router.post('/delTags', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  if (!body.tag) {
    _md.return1('参数不正确', {}, res)
    return
  }
  Product.update({_id: body._id}, {'$pull': {'tags': body.tag}}).exec((err, result) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({
      result
    }, res)
  })
})
// 创建商品
router.post('/create', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  // 1、创建product
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    // 限制一位用户只能创建一个产品
    Product.count({createrId: userId}).exec((err, count) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      console.log(count)
      if (count > Config.productNo -1) {
        _md.return1(`当前用户只能创建【${Config.productNo}】个产品`, {}, res)
        return
      }
      let newProduct = new Product(body)
      newProduct.createrId = userId
      newProduct.save((err, curProduct) => {
        if (err) {
          _md.return2(err, res)
          return
        }
        // 2、获取userId  productId
        let productId = curProduct._id
        // 3、创建p2u
        let newP2u = new P2u({userId, productId})
        newP2u.save((err, curP2u) => {
          if (err) {
            _md.return2(err, res)
            return
          }
          _md.return0({}, res)
        })
      })
    })

  })
})

// 添加成员
router.post('/addUser', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  // 1、查找产品是否存在 productId
  Product.findOne({_id: body.productId}).exec((err, curProduct) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    if (!curProduct) {
      _md.return1('产品不存在', {}, res)
      return
    }
    // 查看产品能添加的人数是否达到上线
    P2u.count({productId: body.productId}).exec((err, memberCount) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      if (!(memberCount < curProduct.memberNo)) {
        _md.return1(`成员数已经超过容纳${curProduct.memberNo}人上限`, {}, res)
        return
      }
      // 2、查找用户是否存在 userId
      User.findOne({mobile: body.mobile}).exec((err, curUser) => {
        if (err) {
          _md.return2(err, res)
          return
        }
        if (!curUser) {
          _md.return1('用户不存在', {}, res)
          return
        }
        // 3、查找是否已经存在
        let userId = curUser._id
        let productId = curProduct._id
        P2u.findOne({userId, productId}).exec((err, curP2u) => {
          if (err) {
            _md.return2(err, res)
            return
          }
          if (curP2u) {
            _md.return1('用户已经存在，不要重复添加', {}, res)
            return
          }
          // 4、创建p2u
          let newP2u = new P2u({userId, productId})
          newP2u.save((err, curP2u) => {
            if (err) {
              _md.return2(err, res)
              return
            }
            res.io.emit('NewProduct', {
              to: userId,
              content: `你刚刚被加入新产品【${curProduct.name}】，刷新页面查看`
            })
            _md.return0({}, res)
          })
        })
      })
    })
  })
})

// 获取成员
router.post('/allUser', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  let productId = body.productId
  P2u.find({productId}).populate('userId').populate('productId').exec((err, allData) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({allData}, res)
  })
})
// 删除成员
router.post('/delUser', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  let userId = body.userId
  let productId = body.productId
  P2u.remove({userId, productId}).exec((err, result) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    _md.return0({result}, res)
  })
})
module.exports = router;
