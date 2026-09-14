/**
 * 本地缓存封装（带异常兜底，避免存储异常中断业务流程）
 */

export function getStorage<T>(key: string, fallback: T): T {
  try {
    const value = wx.getStorageSync(key)
    if (value === '' || value === undefined || value === null) return fallback
    return value as T
  } catch (error) {
    console.error(`[storage] 读取失败：${key}`, error)
    return fallback
  }
}

export function setStorage(key: string, value: any): void {
  try {
    wx.setStorageSync(key, value)
  } catch (error) {
    console.error(`[storage] 写入失败：${key}`, error)
  }
}

export function removeStorage(key: string): void {
  try {
    wx.removeStorageSync(key)
  } catch (error) {
    console.error(`[storage] 删除失败：${key}`, error)
  }
}

export function clearStorage(): void {
  try {
    wx.clearStorageSync()
  } catch (error) {
    console.error('[storage] 清空失败', error)
  }
}
