let required = function (data) {
  if (data) {
    return true
  } else {
    return false
  }
}
let isEmail = function (email) {
  let EmailReg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
  if (EmailReg.test(email) && email && email.length > 0) {
    return true
  } else {
    return false
  }
}
let isPassword = function (password) {
  let PasswordReg = /(?=^.{8,}$)((?=.*\d+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
  // 长度不少于8 个字符，同时包含大写和小写字符，至少有一位数字
  // (?=^.{8,}$)((?=.*\d+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$
  // /((?=.*\d)(?=.*\D)|(?=.*[a-zA-Z])(?=.*[^a-zA-Z]))^.{8,16}$/
  // if (PasswordReg.test(password) && password && password.length > 0) {
  if (password && password.length >= 6) {
    return true
  } else {
    return false
  }
}
let isWeb = function (website) {
  let WebReg = /[a-zA-z]+:\/\/[^\s]*/
  // let WebReg = /^https/
  if (WebReg.test(website) && website && website.length > 0) {
    return true
  } else {
    return false
  }
}

// 成功
let return0 = (data, res) => {
  res.json({
    code: 0,
    msg: '处理成功',
    data: data
  })
}
let return1 = (msg, data, res) => {
  res.json({
    code: 1,
    msg: msg,
    data: data
  })
}
let return2 = (data, res) => {
  res.json({
    code: 2,
    // msg: '数据库访异常',
    msg: '数据不存在',
    data: data
  })
}
let return3 = (data, res) => {
  res.json({
    code: 3,
    msg: '系统处理失败',
    data: data
  })
}
// 过期
let return5 = (msg, data, res) => {
  res.json({
    code: 5,
    msg: msg,
    data: data
  })
}
// 加密
let bcrypt = require('bcrypt')
let passwordBcrypt = (password, callback) => {
  const saltRounds = 10
  return bcrypt.genSalt(saltRounds, (err, salt) => {
    return bcrypt.hash(password, salt, (err, hash) => {
      callback(hash)
    })
  })
}
// 密码对比
let passwordCompare = (password, hash, callback) => {
  bcrypt.compare(password, hash, function(err, res) {
    callback(res)
  })
}

// 生成access_token
let Config = require('./_config.js')
let jwt = require('jsonwebtoken')
let getToken = (data) => {
  return jwt.sign({
    data: data
  }, Config.jwt.secret, { expiresIn: Config.jwt.expires })
}
// decode
let decodeToken = (token, callback) => {
  jwt.verify(token, Config.jwt.secret, function(err, decoded) {
    if (err) {
      callback({
        isValide: false,
        data: err.expiredAt
      })
      return
    }
    let isValide = false
    if (decoded.exp > (Date.now() / 1000)) {
      isValide = true
    }
    callback({
      data: decoded.data,
      isValide: isValide
    })
  })
}

//  需要登录
let signinRequired = (req, res, next) => {
  let access_token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token']
  if (access_token) {
    jwt.verify(access_token, Config.jwt.secret, function(err, decoded) {
      if (err) {
        let data = {
          isValide: false,
          data: err.expiredAt
        }
        return5('登录状态已过期，请重新登录', data, res)
      } else {
        if (decoded.exp > (Date.now() / 1000)) {
          // 没过期
          User.findOne({_id: decoded.data._id}).exec((err, curUser) => {
            if (err) {
              return2(err, res)
              return
            }
            if (!curUser) {
              return5('登录状态已过期，请重新登录', {}, res)
            } else {
              next()
            }
          })
        } else {
          return5('登录状态已过期，请重新登录', {}, res)
        }
      }
    })
  } else {
    return5('access_token need', {}, res)
  }
}

let User = require('../../models/userModel')
let mdAdminRequired = (req, res, next) => {
  let access_token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token']
  if (access_token) {
    jwt.verify(access_token, Config.jwt.secret, function(err, decoded) {
      if (err) {
        let data = {
          isValide: false,
          data: err.expiredAt
        }
        return5('登录状态已过期，请重新登录', data, res)
      } else {
        if (decoded.exp > (Date.now() / 1000)) {
          User.findOne({_id: decoded.data._id}).exec((err, curUser) => {
            if (err) {
              return2(err, res)
              return
            }
            if (curUser && curUser.level === Config.AdminLevel) {
              next()
            } else {
              return5('需要管理员权限', {}, res)
            }
          })
        } else {
          return5('登录状态已过期，请重新登录', {}, res)
        }
      }
    })
  } else {
    return5('access_token needed', {}, res)
  }
}

module.exports = {
  required,
  isEmail,
  isPassword,
  isWeb,
  return0,
  return1,
  return2,
  return3,
  return5,
  passwordBcrypt,
  passwordCompare,
  getToken,
  decodeToken,
  signinRequired,
  mdAdminRequired
}
