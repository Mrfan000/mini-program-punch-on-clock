/**
 * 用户全局状态（轻量实现，零第三方依赖）
 *
 * 设计说明：
 * - 模块级单例 + 订阅机制，保证 app 启动路径不依赖 npm 构建产物，
 *   首次打开小程序即可验证云开发链路是否打通。
 * - 页面可通过 userStore.subscribe() 订阅变化，或直接读取 userStore.user。
 * - 后续若需要更强的跨页响应式（如 computed 派生状态），可平滑接入
 *   mobx-miniprogram 的 createStoreBindings，仅需替换本文件的实现。
 */

import { getStorage, removeStorage, setStorage } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/constants'

type UserListener = (user: IUser | null) => void

const listeners = new Set<UserListener>()

/** 启动时先用本地缓存恢复，避免首屏空白 */
let currentUser: IUser | null = getStorage<IUser | null>(STORAGE_KEYS.USER, null)

function publish(user: IUser | null): void {
  currentUser = user

  if (user) {
    setStorage(STORAGE_KEYS.USER, user)
  } else {
    removeStorage(STORAGE_KEYS.USER)
  }

  listeners.forEach((listener) => {
    try {
      listener(user)
    } catch (error) {
      console.error('[userStore] 监听器执行异常', error)
    }
  })
}

export const userStore = {
  get user(): IUser | null {
    return currentUser
  },

  get isLogin(): boolean {
    return !!currentUser
  },

  get displayName(): string {
    return (currentUser && currentUser.nickName) || '未设置昵称'
  },

  get avatarUrl(): string {
    return (currentUser && currentUser.avatarUrl) || ''
  },

  setUser(user: IUser | null): void {
    publish(user)
  },

  patchUser(patch: Partial<IUser>): void {
    if (!currentUser) return
    publish({ ...currentUser, ...patch })
  },

  clear(): void {
    publish(null)
  },

  /** 订阅用户变化，返回取消订阅函数 */
  subscribe(listener: UserListener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
}
