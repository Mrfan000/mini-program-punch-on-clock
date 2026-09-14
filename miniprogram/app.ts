import { ENV } from './config/index'
import { userStore } from './store/user'
import { call } from './utils/cloud'
import { CLOUD_FUNCTIONS } from './utils/constants'

/** 并发去重：多个页面同时触发登录时只发一次请求 */
let loginPromise: Promise<IUser | null> | null = null

App<IAppOption>({
  globalData: {
    user: null
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('[app] 当前基础库版本过低，无法使用云能力，请升级至 2.2.3 及以上')
      return
    }

    wx.cloud.init({
      env: ENV.envId,
      traceUser: true
    })

    // userStore 已在模块初始化时从本地缓存恢复，先渲染再静默刷新
    if (userStore.user) {
      this.globalData.user = userStore.user
    }

    this.login()
  },

  /**
   * 静默登录：获取用户资料并写入全局状态（同时持久化到本地缓存）
   * @param force 强制重新请求
   */
  async login(force = false): Promise<IUser | null> {
    if (loginPromise && !force) return loginPromise

    loginPromise = (async () => {
      try {
        const user = await call<IUser>(CLOUD_FUNCTIONS.USER, 'login', {}, { silent: true })
        this.globalData.user = user
        userStore.setUser(user)
        return user
      } catch (error) {
        console.error('[app] 登录失败', error)
        return null
      } finally {
        loginPromise = null
      }
    })()

    return loginPromise
  }
})
