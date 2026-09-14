/**
 * 统一响应结构
 * 所有云函数返回：{ code, message, data, timestamp }
 * code === 0 表示成功，非 0 为业务/系统错误码（见 errors.js）
 */

const { ERR, ERROR_MESSAGE } = require('./errors')

function success(data = null, message = 'ok') {
  return {
    code: ERR.SUCCESS,
    message,
    data,
    timestamp: Date.now()
  }
}

function fail(code, message, data = null) {
  return {
    code,
    message: message || ERROR_MESSAGE[code] || '操作失败',
    data,
    timestamp: Date.now()
  }
}

/** 将捕获到的异常转换为标准响应，避免向前端泄露堆栈 */
function fromError(error) {
  if (error && error.name === 'BusinessError') {
    return fail(error.code, error.message)
  }
  console.error('[UnhandledError]', error)
  return fail(ERR.SERVER)
}

function isSuccess(res) {
  return !!res && res.code === ERR.SUCCESS
}

module.exports = { success, fail, fromError, isSuccess }
