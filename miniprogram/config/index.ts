/**
 * 项目环境配置
 * 云环境 ID 与 AppID 固定于此，便于多环境扩展（dev / prod）
 */

export const ENV = {
  /** 云开发环境 ID */
  envId: '864ca59f80df166ae7dabf8141d11c92',
  /** 小程序 AppID */
  appId: 'wx96eee2c33776978c',
  /** 客户端版本号，便于埋点与用户反馈排查 */
  version: '1.0.0'
} as const

/** 云存储目录约定 */
export const CLOUD_PATH = {
  AVATAR: 'avatar',
  CHECKIN: 'checkin',
  TASK_COVER: 'task'
} as const
