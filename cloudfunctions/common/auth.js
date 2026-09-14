/**
 * 鉴权工具
 * 云函数天然可信：openid 由微信注入，无需前端传递，杜绝伪造
 */

const cloud = require('wx-server-sdk')
const { getDb } = require('./db')
const { COLLECTIONS, USER_STATUS, USER_ROLE } = require('./constants')
const { ERR, BusinessError } = require('./errors')

/** 获取微信调用上下文 */
function getWXContext() {
  const ctx = cloud.getWXContext()
  return {
    openid: ctx.OPENID || '',
    unionid: ctx.UNIONID || '',
    appid: ctx.APPID || '',
    source: ctx.SOURCE || ''
  }
}

/** 必须存在 openid，否则视为未登录 */
function requireOpenId() {
  const { openid } = getWXContext()
  if (!openid) throw new BusinessError(ERR.UNAUTHORIZED)
  return openid
}

async function getUserByOpenId(openid) {
  if (!openid) return null
  const { data } = await getDb().collection(COLLECTIONS.USERS).where({ _openid: openid }).limit(1).get()
  return data && data.length ? data[0] : null
}

/** 必须已登录且未被封禁，返回完整用户文档 */
async function requireUser() {
  const openid = requireOpenId()
  const user = await getUserByOpenId(openid)
  if (!user) throw new BusinessError(ERR.USER_NOT_FOUND)
  if (user.status === USER_STATUS.BANNED) throw new BusinessError(ERR.USER_BANNED)
  return user
}

/** 必须为平台管理员（管理后台 / 高危操作） */
async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== USER_ROLE.ADMIN) throw new BusinessError(ERR.FORBIDDEN)
  return user
}

/** 是否为管理员（不抛错） */
async function isAdmin(user) {
  return !!user && user.role === USER_ROLE.ADMIN
}

module.exports = {
  getWXContext,
  requireOpenId,
  getUserByOpenId,
  requireUser,
  requireAdmin,
  isAdmin
}
