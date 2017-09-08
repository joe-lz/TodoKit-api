var express = require('express');
var router = express.Router();

let Config = require('./_config.js')
let _md = require('./_md.js')
// ----七牛
let qiniu = require('qiniu')
let mac = new qiniu.auth.digest.Mac(Config.qiniu.AccessKey, Config.qiniu.SecretKey)

// 生成token
router.post('/qiniutoken', (req, res, next) => {
  let body = req.body
  let options = {
    scope: Config.qiniu.bucket
  }
  let putPolicy = new qiniu.rs.PutPolicy(options)
  let uploadToken = putPolicy.uploadToken(mac)
  _md.return0({
    uploadToken
  }, res)
})

module.exports = router

// router.post('/qiniutoken', _md.signinRequired, (req, res, next) => {
//   let body = req.body
//   let keyToOverwrite = body.data.fileName
//   let options = {
//     scope: Config.qiniu.bucket + ":" + keyToOverwrite,
//     returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
//   }
//   let putPolicy = new qiniu.rs.PutPolicy(options)
//   let uploadToken = putPolicy.uploadToken(mac)
//   console.log(uploadToken)
//   _md.return0({
//     uploadToken
//   }, res)
// })
