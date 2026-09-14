/**
 * updateProfile：更新昵称 / 头像
 * 前端需先通过「头像昵称填写能力」拿到 avatarUrl（临时路径）并上传云存储，再传 fileID
 */

const { requireUser, getDb, COLLECTIONS, ERR, BusinessError, isString } = require('../lib')

const ALLOWED_FIELDS = ['nickName', 'avatarUrl']

module.exports = async function updateProfile(event = {}) {
  const user = await requireUser()

  const data = {}
  if (event.nickName !== undefined) {
    data.nickName = isString(event.nickName, '昵称', { min: 1, max: 20 })
  }
  if (event.avatarUrl !== undefined) {
    data.avatarUrl = isString(event.avatarUrl, '头像', { min: 1, max: 512 })
  }

  if (Object.keys(data).length === 0) {
    throw new BusinessError(ERR.PARAM, `没有需要更新的字段，可选：${ALLOWED_FIELDS.join('、')}`)
  }

  data.updatedAt = Date.now()
  await getDb().collection(COLLECTIONS.USERS).doc(user._id).update({ data })

  return { ...user, ...data }
}
