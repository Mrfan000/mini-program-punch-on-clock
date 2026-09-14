/**
 * 公共层统一出口
 * 云函数中通过 const { ... } = require('./lib') 使用
 */

const errors = require('./errors')
const response = require('./response')
const constants = require('./constants')
const validator = require('./validator')
const date = require('./date')
const auth = require('./auth')

module.exports = {
  ...errors,
  ...response,
  ...constants,
  ...validator,
  ...date,
  ...auth,
  db: require('./db')
}
