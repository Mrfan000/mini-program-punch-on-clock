/**
 * 日期工具（客户端展示用）
 * 与云函数公共层 date.js 保持一致的算法，避免前后端口径不一
 */

const WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

export function toDate(input?: Date | number | string): Date {
  if (input instanceof Date) return new Date(input.getTime())
  if (input === undefined || input === null) return new Date()
  if (typeof input === 'number') return new Date(input)
  return new Date(String(input).replace(/-/g, '/'))
}

/** YYYY-MM-DD */
export function formatDate(input?: Date | number | string): string {
  const d = toDate(input)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** YYYY-MM-DD HH:mm */
export function formatDateTime(input?: Date | number | string): string {
  const d = toDate(input)
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** HH:mm */
export function formatTime(input?: Date | number | string): string {
  const d = toDate(input)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function getWeekdayLabel(input?: Date | number | string): string {
  return WEEK_LABELS[toDate(input).getDay()]
}

/** 相对今天的中文描述：今天 / 昨天 / 明天 / MM月DD日 */
export function formatDayLabel(input?: Date | number | string): string {
  const target = toDate(input)
  const today = new Date()
  const diff = Math.round(
    (new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      86400000
  )

  if (diff === 0) return '今天'
  if (diff === -1) return '昨天'
  if (diff === 1) return '明天'
  return `${target.getMonth() + 1}月${target.getDate()}日`
}

/** 首屏问候语 */
export function buildGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 6) return '夜深了，早点休息'
  if (hour < 11) return '早上好，新的一天开始啦'
  if (hour < 14) return '中午好，别忘了今天的打卡'
  if (hour < 18) return '下午好，坚持就是胜利'
  if (hour < 23) return '晚上好，今天的目标完成了吗'
  return '夜深了，记得打卡后早点休息'
}

/** 连续天数文案 */
export function formatStreak(streak: number): string {
  return streak > 0 ? `已连续打卡 ${streak} 天` : '今天开始第一次打卡吧'
}
