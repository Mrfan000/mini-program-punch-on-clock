/**
 * 交互反馈封装
 */

type ToastIcon = 'none' | 'success' | 'error' | 'loading'

export function showToast(title: string, icon: ToastIcon = 'none', duration = 2000): void {
  wx.showToast({ title, icon, duration })
}

export function showSuccess(title = '操作成功'): void {
  wx.showToast({ title, icon: 'success', duration: 1500 })
}

export function showError(title: string): void {
  wx.showToast({ title, icon: 'none', duration: 2000 })
}

export function showLoading(title = '加载中', mask = true): void {
  wx.showLoading({ title, mask })
}

export function hideLoading(): void {
  wx.hideLoading()
}

/** 确认弹窗，resolve(true) 表示用户点击确定 */
export function confirm(options: {
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
}): Promise<boolean> {
  const { title = '提示', content, confirmText = '确定', cancelText = '取消' } = options

  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText,
      cancelText,
      confirmColor: '#0052d9',
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false)
    })
  })
}
