/**
 * 用户域云函数入口
 * 约定：前端调用 wx.cloud.callFunction({ name: 'user', data: { action, ...payload } })
 */

const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { success, fail, fromError, ERR } = require('./lib')

const handlers = {
  login: require('./actions/login'),
  getProfile: require('./actions/getProfile'),
  updateProfile: require('./actions/updateProfile')
}

exports.main = async (event = {}) => {
  const { action } = event

  if (!action) {
    return fail(ERR.PARAM, '缺少 action 参数')
  }

  const handler = handlers[action]
  if (!handler) {
    return fail(ERR.PARAM, `不支持的操作：${action}`)
  }

  try {
    const data = await handler(event)
    return success(data)
  } catch (error) {
    return fromError(error)
  }
}
