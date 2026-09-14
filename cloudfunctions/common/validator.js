/**
 * 参数校验工具：校验失败统一抛出 BusinessError(ERR.PARAM)
 */

const { ERR, BusinessError } = require('./errors')

function failParam(message) {
  throw new BusinessError(ERR.PARAM, message)
}

/** 通用断言 */
function assert(condition, message) {
  if (!condition) failParam(message)
}

/** 非空校验，返回原值 */
function required(value, label = '参数') {
  if (value === undefined || value === null || value === '') failParam(`${label}不能为空`)
  return value
}

/** 字符串校验，返回 trim 后的字符串 */
function isString(value, label = '参数', options = {}) {
  const { required: must = true, min = 0, max = Infinity } = options
  if (value === undefined || value === null || value === '') {
    if (must) failParam(`${label}不能为空`)
    return ''
  }
  if (typeof value !== 'string') failParam(`${label}格式不正确`)
  const result = value.trim()
  if (result.length < min) failParam(`${label}长度不能少于 ${min} 个字符`)
  if (result.length > max) failParam(`${label}长度不能超过 ${max} 个字符`)
  return result
}

/** 数字校验 */
function isNumber(value, label = '参数', options = {}) {
  const { required: must = true, min = -Infinity, max = Infinity } = options
  if (value === undefined || value === null || value === '') {
    if (must) failParam(`${label}不能为空`)
    return null
  }
  const num = Number(value)
  if (Number.isNaN(num)) failParam(`${label}必须是数字`)
  if (num < min) failParam(`${label}不能小于 ${min}`)
  if (num > max) failParam(`${label}不能大于 ${max}`)
  return num
}

/** 布尔值校验 */
function isBoolean(value, label = '参数', defaultValue = false) {
  if (value === undefined || value === null) return defaultValue
  return !!value
}

/** 数组校验 */
function isArray(value, label = '参数', options = {}) {
  const { required: must = true, min = 0, max = Infinity } = options
  if (value === undefined || value === null) {
    if (must) failParam(`${label}不能为空`)
    return []
  }
  if (!Array.isArray(value)) failParam(`${label}必须是数组`)
  if (value.length < min) failParam(`${label}至少需要 ${min} 项`)
  if (value.length > max) failParam(`${label}最多 ${max} 项`)
  return value
}

/** 枚举校验 */
function oneOf(value, allowed, label = '参数') {
  required(value, label)
  if (!allowed.includes(value)) failParam(`${label}取值不合法`)
  return value
}

/** 日期字符串校验（YYYY-MM-DD） */
function isDateString(value, label = '日期') {
  const result = isString(value, label, { min: 10, max: 10 })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) failParam(`${label}格式应为 YYYY-MM-DD`)
  return result
}

/** 时间字符串校验（HH:mm） */
function isTimeString(value, label = '时间') {
  const result = isString(value, label, { min: 5, max: 5 })
  if (!/^\d{2}:\d{2}$/.test(result)) failParam(`${label}格式应为 HH:mm`)
  return result
}

/** 取对象中的指定字段，忽略 undefined */
function pick(source = {}, keys = []) {
  const result = {}
  keys.forEach((key) => {
    if (source[key] !== undefined) result[key] = source[key]
  })
  return result
}

/** 分页参数标准化 */
function normalizePaging(event = {}, defaultSize = 20, maxSize = 100) {
  const page = Math.max(1, Number(event.page) || 1)
  const rawSize = Number(event.pageSize) || defaultSize
  const pageSize = Math.min(Math.max(1, rawSize), maxSize)
  return { page, pageSize, skip: (page - 1) * pageSize, limit: pageSize }
}

module.exports = {
  assert,
  required,
  isString,
  isNumber,
  isBoolean,
  isArray,
  oneOf,
  isDateString,
  isTimeString,
  pick,
  normalizePaging
}
