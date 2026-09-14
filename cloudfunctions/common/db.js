/**
 * 云数据库访问入口
 * 惰性初始化，确保 cloud.init() 已执行后再获取实例
 */

const cloud = require('wx-server-sdk')

let _db = null

function getDb() {
  if (!_db) {
    _db = cloud.database({ throwOnNotFound: false })
  }
  return _db
}

/** 数据库查询指令：db.command（gt/lt/in/inc/...） */
function command() {
  return getDb().command
}

/** 服务端时间：写入 createdAt/updatedAt 时优先使用，避免客户端时间不可信 */
function serverDate() {
  return getDb().serverDate()
}

/** 集合快捷入口 */
function collection(name) {
  return getDb().collection(name)
}

module.exports = { getDb, command, serverDate, collection }
