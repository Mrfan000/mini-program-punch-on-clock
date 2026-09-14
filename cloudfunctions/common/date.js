/**
 * 日期与周期工具
 * periodKey 是打卡幂等去重的核心：同一 (taskId, userId, periodKey) 只允许一条记录
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`
}

function toDate(input) {
  if (input instanceof Date) return new Date(input.getTime())
  if (input === undefined || input === null) return new Date()
  if (typeof input === 'number') return new Date(input)
  return new Date(String(input).replace(/-/g, '/'))
}

/** YYYY-MM-DD */
function formatDate(input) {
  const d = toDate(input)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** YYYY-MM-DD HH:mm[:ss] */
function formatDateTime(input, withSeconds = false) {
  const d = toDate(input)
  const base = `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  return withSeconds ? `${base}:${pad(d.getSeconds())}` : base
}

/** HH:mm */
function formatTime(input) {
  const d = toDate(input)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function startOfDay(input) {
  const d = toDate(input)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(input) {
  const d = toDate(input)
  d.setHours(23, 59, 59, 999)
  return d
}

function addDays(input, days) {
  const d = toDate(input)
  d.setDate(d.getDate() + days)
  return d
}

/** 相差天数（按自然日计算，a - b） */
function diffDays(a, b) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_PER_DAY)
}

function isSameDay(a, b) {
  return formatDate(a) === formatDate(b)
}

/** ISO 周序号（周一为一周第一天） */
function getISOWeek(input) {
  const d = new Date(Date.UTC(toDate(input).getFullYear(), toDate(input).getMonth(), toDate(input).getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7)
  return { year: d.getUTCFullYear(), week: weekNo }
}

/** 根据任务频率推导统计粒度 */
function resolveGranularity(frequency = {}) {
  if (frequency && frequency.periodKey) return frequency.periodKey
  switch (frequency && frequency.type) {
    case 'weekly':
      return 'week'
    case 'monthly':
      return 'month'
    default:
      return 'day'
  }
}

/**
 * 生成周期键
 * day   -> 2026-09-14
 * week  -> 2026-W37
 * month -> 2026-09
 */
function getPeriodKey(granularity = 'day', input = new Date()) {
  const d = toDate(input)
  if (granularity === 'month') return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
  if (granularity === 'week') {
    const { year, week } = getISOWeek(d)
    return `${year}-W${pad(week)}`
  }
  return formatDate(d)
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm || '').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/**
 * 是否落在任一允许打卡的时间窗内
 * windows: [{ start: '05:00', end: '09:00' }]，支持跨天（end < start）
 */
function isWithinTimeWindows(windows, input = new Date()) {
  if (!Array.isArray(windows) || windows.length === 0) return true
  const d = toDate(input)
  const current = d.getHours() * 60 + d.getMinutes()

  return windows.some((win) => {
    const start = toMinutes(win.start)
    const end = toMinutes(win.end)
    return end >= start ? current >= start && current <= end : current >= start || current <= end
  })
}

/** 是否在 [startDate, endDate] 有效期内（含首尾，日期字符串 YYYY-MM-DD） */
function isWithinDateRange(startDate, endDate, input = new Date()) {
  const current = formatDate(input)
  if (startDate && current < startDate) return false
  if (endDate && current > endDate) return false
  return true
}

/**
 * 球面距离（米），用于定位打卡范围校验
 */
function getDistance(lat1, lng1, lat2, lng2) {
  const EARTH_RADIUS = 6371000
  const rad = (deg) => (deg * Math.PI) / 180

  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return Math.round(2 * EARTH_RADIUS * Math.asin(Math.sqrt(a)))
}

module.exports = {
  MS_PER_DAY,
  pad,
  toDate,
  formatDate,
  formatDateTime,
  formatTime,
  startOfDay,
  endOfDay,
  addDays,
  diffDays,
  isSameDay,
  getISOWeek,
  resolveGranularity,
  getPeriodKey,
  toMinutes,
  isWithinTimeWindows,
  isWithinDateRange,
  getDistance
}
