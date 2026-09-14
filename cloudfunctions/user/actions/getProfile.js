/**
 * getProfile：获取当前登录用户资料
 */

const { requireUser } = require('../lib')

module.exports = async function getProfile() {
  return requireUser()
}
