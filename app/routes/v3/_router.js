module.exports = function(app) {
  const index = require('./index')
  app.use('/v3', index)

  const user = require('./user')
  app.use('/v3/user', user)

  const product = require('./product')
  app.use('/v3/product', product)

  const post = require('./post')
  app.use('/v3/post', post)

  const log = require('./log')
  app.use('/v3/log', log)

  const upload = require('./upload')
  app.use('/v3/upload', upload)

  const advice = require('./advice')
  app.use('/v3/advice', advice)
}
