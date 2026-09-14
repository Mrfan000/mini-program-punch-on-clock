/**
 * 全局常量：集合名与枚举
 * 与「方案文档 - 第五章 数据库设计」保持一致
 */

/** 云数据库集合名 */
const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  CHECKIN_RECORDS: 'checkin_records',
  USER_TASK_STATS: 'user_task_stats',
  GROUPS: 'groups',
  GROUP_MEMBERS: 'group_members',
  INTERACTIONS: 'interactions',
  MAKEUP_REQUESTS: 'makeup_requests',
  MESSAGES: 'messages',
  NOTIFY_SUBSCRIPTIONS: 'notify_subscriptions',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
  ADMIN_LOGS: 'admin_logs',
  STAT_DAILY: 'stat_daily'
}

/** 用户状态 */
const USER_STATUS = {
  NORMAL: 'normal',
  BANNED: 'banned'
}

/** 用户角色（role=admin 可进入管理后台） */
const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin'
}

/** 任务状态 */
const TASK_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  PAUSED: 'paused',
  ARCHIVED: 'archived'
}

/** 任务可见性 */
const TASK_VISIBILITY = {
  PUBLIC: 'public',
  GROUP: 'group',
  PRIVATE: 'private'
}

/** 打卡频率类型 */
const FREQUENCY_TYPE = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom'
}

/** 统计/去重粒度 */
const PERIOD_KEY = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
}

/** 打卡记录状态 */
const CHECKIN_STATUS = {
  NORMAL: 'normal',
  LATE: 'late',
  MAKEUP: 'makeup'
}

/** 圈子加入方式 */
const GROUP_JOIN_MODE = {
  PUBLIC: 'public',
  APPROVAL: 'approval',
  INVITE: 'invite'
}

/** 圈子成员角色 */
const GROUP_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
}

/** 分页默认值 */
const PAGE = {
  DEFAULT_SIZE: 20,
  MAX_SIZE: 100
}

module.exports = {
  COLLECTIONS,
  USER_STATUS,
  USER_ROLE,
  TASK_STATUS,
  TASK_VISIBILITY,
  FREQUENCY_TYPE,
  PERIOD_KEY,
  CHECKIN_STATUS,
  GROUP_JOIN_MODE,
  GROUP_ROLE,
  PAGE
}
