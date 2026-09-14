/**
 * 统一错误码与业务异常
 */

const ERR = {
  SUCCESS: 0,

  // 通用
  PARAM: 40000,
  UNAUTHORIZED: 40100,
  FORBIDDEN: 40300,
  NOT_FOUND: 40400,
  CONFLICT: 40900,
  RATE_LIMIT: 42900,
  SERVER: 50000,

  // 用户
  USER_NOT_FOUND: 41001,
  USER_BANNED: 41002,

  // 任务
  TASK_NOT_FOUND: 42001,
  TASK_NOT_PUBLISHED: 42002,
  TASK_EXPIRED: 42003,
  TASK_NO_PERMISSION: 42004,

  // 打卡
  CHECKIN_DUPLICATE: 43001,
  CHECKIN_OUT_OF_WINDOW: 43002,
  CHECKIN_OUT_OF_RANGE: 43003,
  CHECKIN_QUOTA_EXCEEDED: 43004,
  CHECKIN_CONTENT_REJECTED: 43005,

  // 圈子
  GROUP_NOT_FOUND: 44001,
  GROUP_NO_PERMISSION: 44002,
  GROUP_ALREADY_JOINED: 44003,
  GROUP_MEMBER_LIMIT: 44004
}

const ERROR_MESSAGE = {
  [ERR.SUCCESS]: 'ok',
  [ERR.PARAM]: '参数错误',
  [ERR.UNAUTHORIZED]: '登录状态失效，请重新进入小程序',
  [ERR.FORBIDDEN]: '没有操作权限',
  [ERR.NOT_FOUND]: '数据不存在',
  [ERR.CONFLICT]: '数据冲突',
  [ERR.RATE_LIMIT]: '操作过于频繁，请稍后再试',
  [ERR.SERVER]: '服务异常，请稍后重试',

  [ERR.USER_NOT_FOUND]: '用户不存在，请先登录',
  [ERR.USER_BANNED]: '账号已被封禁，如有疑问请联系管理员',

  [ERR.TASK_NOT_FOUND]: '打卡任务不存在',
  [ERR.TASK_NOT_PUBLISHED]: '任务未发布或已下架',
  [ERR.TASK_EXPIRED]: '任务不在有效期内',
  [ERR.TASK_NO_PERMISSION]: '无权操作该任务',

  [ERR.CHECKIN_DUPLICATE]: '本周期已打卡，无需重复打卡',
  [ERR.CHECKIN_OUT_OF_WINDOW]: '不在允许打卡的时间段内',
  [ERR.CHECKIN_OUT_OF_RANGE]: '不在规定的打卡地点范围内',
  [ERR.CHECKIN_QUOTA_EXCEEDED]: '已达到本周期打卡次数上限',
  [ERR.CHECKIN_CONTENT_REJECTED]: '打卡内容包含违规信息，请修改后重试',

  [ERR.GROUP_NOT_FOUND]: '圈子不存在',
  [ERR.GROUP_NO_PERMISSION]: '无权操作该圈子',
  [ERR.GROUP_ALREADY_JOINED]: '你已加入该圈子',
  [ERR.GROUP_MEMBER_LIMIT]: '圈子人数已满'
}

/**
 * 业务异常：由业务代码主动抛出，会被统一响应层转换为标准错误返回
 */
class BusinessError extends Error {
  constructor(code, message) {
    super(message || ERROR_MESSAGE[code] || '操作失败')
    this.name = 'BusinessError'
    this.code = code
  }
}

module.exports = { ERR, ERROR_MESSAGE, BusinessError }
