module.exports = function(app) {
  const index = require('./index')
  app.use('/v2', index)

  const user = require('./user')
  app.use('/v2/user', user)

  const product = require('./product')
  app.use('/v2/product', product)

  const post = require('./post')
  app.use('/v2/post', post)

  const log = require('./log')
  app.use('/v2/log', log)

  const upload = require('./upload')
  app.use('/v2/upload', upload)

  const advice = require('./advice')
  app.use('/v2/advice', advice)
}
