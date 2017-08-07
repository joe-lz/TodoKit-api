var express = require('express');
var router = express.Router();

let User = require('../../models/userModel')
let Log = require('../../models/logModel')
let Post = require('../../models/postModel')
let Config = require('./_config.js')
let _md = require('./_md.js')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 注册
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

// 登录
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
      _md.return0({
        notification_count
      }, res)
    })
  })
})
module.exports = router;
