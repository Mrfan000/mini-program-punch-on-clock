/**
 * login：微信一键登录
 * - 首次调用自动建用户（个人任务无需额外注册流程）
 * - 已存在则刷新最后登录时间
 * - openid 由微信注入，不信任前端传参
 */

const {
  getWXContext,
  getDb,
  COLLECTIONS,
  USER_STATUS,
  USER_ROLE,
  ERR,
  BusinessError,
  isString
} = require('../lib')

module.exports = async function login(event = {}) {
  const { openid, unionid } = getWXContext()
  const db = getDb()
  const users = db.collection(COLLECTIONS.USERS)
  const now = Date.now()

  const { data } = await users.where({ _openid: openid }).limit(1).get()

  if (data && data.length > 0) {
    const user = data[0]
    if (user.status === USER_STATUS.BANNED) {
      throw new BusinessError(ERR.USER_BANNED)
    }

    // 同步可能发生变化的昵称/头像（前端传入时才更新）
    const patch = { lastLoginAt: now, updatedAt: now }
    if (event.nickName !== undefined) {
      patch.nickName = isString(event.nickName, '昵称', { max: 20 })
    }
    if (event.avatarUrl !== undefined) {
      patch.avatarUrl = isString(event.avatarUrl, '头像', { max: 512 })
    }

    await users.doc(user._id).update({ data: patch })
    return { ...user, ...patch, isNewUser: false }
  }

  const newUser = {
    // 注意：云函数拥有管理员权限，新增文档不会自动写入 _openid，需显式设置
    _openid: openid,
    unionid: unionid || '',
    nickName: isString(event.nickName, '昵称', { required: false, max: 20 }),
    avatarUrl: isString(event.avatarUrl, '头像', { required: false, max: 512 }),
    role: USER_ROLE.USER,
    status: USER_STATUS.NORMAL,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now
  }

  const res = await users.add({ data: newUser })
  return { _id: res._id, ...newUser, isNewUser: true }
}
