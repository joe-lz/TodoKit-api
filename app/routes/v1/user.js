var express = require('express');
var router = express.Router();

let User = require('../../models/userModel')
let Product = require('../../models/productModel')
let Log = require('../../models/logModel')
let Post = require('../../models/postModel')
let Config = require('./_config.js')
let _md = require('./_md.js')
// ----短信
let SMS = require('./wilddog_lib')
let sms = new SMS({appId: Config.wilddog_appId, smsKey: Config.wilddog_msg_key})
// 邮箱注册
router.post('/signup', (req, res, next) => {
  let body = req.body
  if (!_md.required(body) || !_md.isEmail(body.email)) {
    _md.return1('邮箱格式错误', {}, res)
    return
  }
  body.email = body.email.toLowerCase()
  // 1.查找email
  User.findOne({email: body.email}, (err, userData) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    // 2.已经注册
    if (userData) {
      _md.return1('邮箱已经注册', {}, res)
    } else {
      // 3.未注册
      // a.密码加密
      // 验证密码格式
      if (!_md.isPassword(body.password)) {
        _md.return1('密码格式错误：长度不少于6 个字符', {}, res)
        return
      }
      _md.passwordBcrypt(body.password, (password) => {
        body.password = password
        // b.注册用户
        body.name = body.email.replace(/@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/, '')
        let newUser = new User(body)
        newUser.save((err, curUser) => {
          if (err) {
            _md.return2(err, res)
          } else {
            _md.return0({}, res)
          }
        })
      })
    }
  })
})

// 邮箱登录
router.post('/signin', (req, res, next) => {
  let body = req.body
  if (!_md.required(body) || !_md.isEmail(body.email)) {
    _md.return1('邮箱格式错误', {}, res)
    return
  }
  body.email = body.email.toLowerCase()
  // 1.查找email
  User.findOne({email: body.email}, (err, userData) => {
    if (err) {
      _md.return2(err, res)
      return
    }
    if (userData) {
      // 2.查看用户是否被封杀 level > 0
      if (userData.level > 0) {
        // 3.比较密码
        _md.passwordCompare(body.password, userData.password, (isPassword) => {
          if (isPassword === true) {
            let access_token = _md.getToken(userData)
            let data = {
              access_token: access_token,
              userInfo: userData
            }
            _md.return0(data, res)
          } else {
            _md.return1('密码错误', {}, res)
          }
        })
      } else {
        _md.return1('该账户已经被锁定，您可以联系我们申诉找回', {}, res)
        // 因为违反相关条例
      }
    } else {
      _md.return1('用户不存在', {}, res)
    }
  })
})

// 短信注册
// 1、发送短信
router.post('/signup-send-sms', (req, res, next) => {
  let body = req.body.data
  console.log(body)
  sms.sendCode(body.mobile, '100000', null, function (err, data) {
    if (err) {
      _md.return2(err, res)
      return
    }
    if (data.status == 'ok') {
      _md.return0(data, res)
    } else {
      _md.return1('发送失败', data, res)
    }
  })
})
router.post('/signup-sms', (req, res, next) => {
  let body = req.body.data
  console.log(body)
  sms.checkCode(body.mobile, body.code, function (err, data) {
    if (err) {
      _md.return2(err, res)
      return
    }
    if (data.status == 'ok') {
      // 验证码正确
      // 1、查看是否注册
      User.findOne({mobile: body.mobile}, (err, userData) => {
        if (err) {
          _md.return2(err, res)
          return
        }
        if (userData) {
          // 用户已经存在，直接登录
          let access_token = _md.getToken(userData)
          let data = {
            access_token: access_token,
            userInfo: userData
          }
          _md.return0(data, res)
        } else {
          // 用户不存在，注册
          let new_user_body = {
            mobile: body.mobile
          }
          let newUser = new User(new_user_body)
          newUser.save((err, curUser) => {
            if (err) {
              _md.return2(err, res)
            } else {
              let access_token = _md.getToken(curUser)
              let data = {
                access_token: access_token,
                userInfo: curUser
              }
              _md.return0(data, res)
            }
          })
        }
      })
    } else {
      _md.return1('验证码错误', {}, res)
    }
  })
})
// 账户设置
router.post('/setting', (req, res, next) => {
  // 1.通过access_token 拿到userId
  // 2.更新userInfo
  let access_token = req.body.access_token
  let body = req.body.data
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    console.log(body)
    User.update({_id: userId}, {$set: body}).exec((err, result) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      User.findOne({_id: userId}).exec((err, curUser) => {
        if (err) {
          _md.return2(err, res)
          return
        }
        _md.return0({
          curUser
        }, res)
      })
    })
  })
})
// userInfo
router.post('/info', (req, res, next) => {
  // 1.通过access_token 拿到userId
  // 2.更新userInfo
  let access_token = req.body.access_token
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    User.findOne({_id: userId}).exec((err, curUser) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      _md.return0({
        curUser
      }, res)
    })
  })
})
// getProductStateInfo
router.post('/getProductStateInfo', _md.signinRequired, (req, res, next) => {
  let access_token = req.body.access_token
  let body = req.body.data
  _md.decodeToken(access_token, (data) => {
    let userId = data.data._id
    // 2、创建curLog
    Log.count({to: userId, isRead: false, productId: body.productId}).exec((err, notification_count) => {
      if (err) {
        _md.return2(err, res)
        return
      }
      Product.findOne({_id: body.productId}).exec((err, curProduct) => {
        if (err) {
          _md.return2(err, res)
          return
        }
        _md.return0({
          notification_count,
          curProduct,
          typeArr: [{
            id: 1,
            name: 'Bug'
          }, {
            id: 2,
            name: '需求'
          }],
          levelArr: [{
            id: 1,
            name: '待办'
          }, {
            id: 2,
            name: '待审核'
          }, {
            id: 5,
            name: '归档'
          }]
        }, res)
      })
    })
  })
})
module.exports = router;
