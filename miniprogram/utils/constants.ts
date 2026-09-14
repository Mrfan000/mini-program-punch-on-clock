/**
 * 前端常量：云函数名、本地存储 key、路由
 */

/** 云函数名，与 cloudfunctions/ 目录一致 */
export const CLOUD_FUNCTIONS = {
  USER: 'user',
  TASK: 'task',
  CHECKIN: 'checkin',
  GROUP: 'group',
  INTERACTION: 'interaction',
  MAKEUP: 'makeup',
  RANKING: 'ranking',
  NOTIFY: 'notify',
  ADMIN: 'admin'
} as const

/** 本地缓存 key */
export const STORAGE_KEYS = {
  USER: 'punch:user',
  USER_STATS_CACHE: 'punch:user_stats',
  CHECKIN_DRAFT: 'punch:checkin_draft',
  PRIVACY_AGREED: 'punch:privacy_agreed'
} as const

/** 页面路由 */
export const ROUTES = {
  INDEX: '/pages/index/index',
  MINE: '/pages/mine/index'
} as const

/** 日期格式化模板 */
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm',
  TIME: 'HH:mm'
} as const
