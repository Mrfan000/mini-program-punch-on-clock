/**
 * 全局业务模型声明（无需 import 即可使用）
 */

type UserRole = 'user' | 'admin'
type UserStatus = 'normal' | 'banned'

interface IUser {
  _id: string
  _openid: string
  unionid?: string
  nickName: string
  avatarUrl: string
  role: UserRole
  status: UserStatus
  createdAt: number
  updatedAt: number
  lastLoginAt?: number
  /** 仅登录接口返回：是否为本次新建的用户 */
  isNewUser?: boolean
}

type TaskStatus = 'draft' | 'published' | 'paused' | 'archived'
type TaskVisibility = 'public' | 'group' | 'private'
type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'custom'

interface ITaskFrequency {
  type: FrequencyType
  /** 指定星期，1 = 周一 */
  weekDays?: number[]
  /** 每周 / 每月需要打卡的次数 */
  timesPerPeriod?: number
  /** 去重与统计粒度 */
  periodKey?: 'day' | 'week' | 'month'
}

interface ITask {
  _id: string
  groupId: string | null
  creatorId: string
  title: string
  desc: string
  cover?: string
  icon?: string
  categoryId?: string
  frequency: ITaskFrequency
  timeWindows?: Array<{ start: string; end: string }>
  requireLocation?: boolean
  location?: { latitude: number; longitude: number; radius: number; address?: string }
  contentRule?: Record<string, any>
  remindEnabled?: boolean
  remindTime?: string
  startDate?: string
  endDate?: string
  visibility: TaskVisibility
  isTemplate?: boolean
  status: TaskStatus
  participantCount?: number
  checkinCount?: number
  createdAt: number
  updatedAt: number
}

interface IUserTaskStats {
  _id?: string
  taskId: string
  userId: string
  totalCount: number
  currentStreak: number
  maxStreak: number
  lastPeriodKey: string
  monthCount: number
}

interface IAppOption {
  globalData: {
    user: IUser | null
  }
  /** 静默登录（首次进入 / 需要刷新用户信息时调用） */
  login(force?: boolean): Promise<IUser | null>
}
