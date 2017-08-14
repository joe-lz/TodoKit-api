module.exports = function(app) {
  const index = require('./index')
  app.use('/', index)

  const user = require('./user')
  app.use('/v1/user', user)

  const product = require('./product')
  app.use('/v1/product', product)

  const post = require('./post')
  app.use('/v1/post', post)

  const log = require('./log')
  app.use('/v1/log', log)

  const upload = require('./upload')
  app.use('/v1/upload', upload)
}
