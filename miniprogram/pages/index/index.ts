import { ENV } from '../../config/index'
import { buildGreeting, formatDate, getWeekdayLabel } from '../../utils/date'

const app = getApp<IAppOption>()

Page({
  data: {
    today: '',
    weekday: '',
    greeting: '',
    loading: true,
    tasks: [] as ITask[],
    user: null as IUser | null,
    todayPending: 0,
    stats: {
      currentStreak: 0,
      totalCount: 0
    },
    envId: ENV.envId,
    version: ENV.version
  },

  onLoad() {
    this.setData({
      today: formatDate(),
      weekday: getWeekdayLabel(),
      greeting: buildGreeting()
    })
    this.bootstrap()
  },

  onShow() {
    // 从「我的」页返回时同步最新用户信息
    if (app.globalData.user) {
      this.setData({ user: app.globalData.user })
    }
  },

  async onPullDownRefresh() {
    this.setData({ greeting: buildGreeting() })
    await this.bootstrap()
    wx.stopPullDownRefresh()
  },

  /** 拉取登录态，作为 M1 云开发链路的自检入口 */
  async bootstrap() {
    const cached = app.globalData.user
    if (cached) {
      this.setData({ user: cached, loading: false })
      return
    }

    const user = await app.login()
    this.setData({ user, loading: false })
  },

  onCreateTask() {
    wx.showToast({ title: '任务创建将在 M2 阶段开放', icon: 'none' })
  },

  onOpenTask(e: any) {
    const { id } = e.currentTarget.dataset
    wx.showToast({ title: `任务详情待实现：${id}`, icon: 'none' })
  }
})
