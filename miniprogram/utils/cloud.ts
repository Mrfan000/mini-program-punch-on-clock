/**
 * 云函数调用统一封装
 * - 统一解包 { code, message, data } 响应结构
 * - 统一 loading 与错误提示
 * - 业务错误统一抛出 ApiError，便于调用方按 code 分支处理
 */

export interface ApiResult<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export class ApiError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export interface CallOptions {
  /** 是否展示全屏 loading */
  loading?: boolean
  loadingText?: string
  /** 静默模式：不自动弹出错误提示，由调用方处理 */
  silent?: boolean
}

/**
 * 调用云函数
 * @param name 云函数名，如 'user'
 * @param action 业务动作，如 'login'
 * @param data 业务参数
 */
export async function call<T = any>(
  name: string,
  action: string,
  data: Record<string, any> = {},
  options: CallOptions = {}
): Promise<T> {
  const { loading = false, loadingText = '加载中', silent = false } = options

  if (loading) {
    wx.showLoading({ title: loadingText, mask: true })
  }

  try {
    const res: any = await wx.cloud.callFunction({
      name,
      data: { action, ...data }
    })

    const result: ApiResult<T> | undefined = res && res.result

    if (!result) {
      throw new ApiError(-1, '服务无响应，请稍后重试')
    }
    if (result.code !== 0) {
      throw new ApiError(result.code, result.message || '操作失败')
    }

    return result.data
  } catch (error) {
    const apiError =
      error instanceof ApiError ? error : new ApiError(-1, '网络异常，请检查网络后重试')

    if (!silent) {
      wx.showToast({ title: apiError.message, icon: 'none', duration: 2000 })
    }
    throw apiError
  } finally {
    if (loading) {
      wx.hideLoading()
    }
  }
}

/**
 * 上传文件到云存储，返回 fileID
 * @param filePath 本地临时文件路径
 * @param dir 云存储目录，如 'avatar' / 'checkin'
 */
export async function uploadFile(filePath: string, dir: string): Promise<string> {
  const ext = (filePath.split('.').pop() || 'png').split('?')[0]
  const cloudPath = `${dir}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`

  const res: any = await wx.cloud.uploadFile({ cloudPath, filePath })
  return res.fileID
}
