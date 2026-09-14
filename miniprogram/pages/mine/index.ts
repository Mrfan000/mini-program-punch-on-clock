import { CLOUD_PATH } from '../../config/index'
import { userStore } from '../../store/user'
import { call, uploadFile } from '../../utils/cloud'
import { CLOUD_FUNCTIONS } from '../../utils/constants'
import { showError, showSuccess } from '../../utils/toast'

const app = getApp<IAppOption>()

Page({
  data: {
    user: null as IUser | null,
    avatarText: '打',
    saving: false,
    stats: {
      totalCount: 0,
      currentStreak: 0,
      maxStreak: 0
    },
    form: {
      nickName: '',
      avatarUrl: ''
    }
  },

  async onShow() {
    const user = app.globalData.user || (await app.login())
    if (user) this.applyUser(user)
  },

  applyUser(user: IUser) {
    this.setData({
      user,
      avatarText: (user.nickName || '打').slice(0, 1),
      form: {
        nickName: user.nickName || '',
        avatarUrl: user.avatarUrl || ''
      }
    })
  },

  /** 微信头像选择（open-type="chooseAvatar"） */
  onChooseAvatar(e: any) {
    const avatarUrl = e && e.detail && e.detail.avatarUrl
    if (!avatarUrl) return
    this.setData({ 'form.avatarUrl': avatarUrl })
  },

  onNickNameInput(e: any) {
    const value = (e && e.detail && e.detail.value) || ''
    this.setData({ 'form.nickName': value })
  },

  async onSave() {
    const nickName = (this.data.form.nickName || '').trim()
    if (!nickName) {
      showError('请先填写昵称')
      return
    }

    this.setData({ saving: true })

    try {
      const payload: Record<string, any> = { nickName }
      const avatarUrl = this.data.form.avatarUrl

      // 本地临时文件需先上传云存储；已是 cloud:// 则直接复用
      if (avatarUrl && !avatarUrl.startsWith('cloud://')) {
        payload.avatarUrl = await uploadFile(avatarUrl, CLOUD_PATH.AVATAR)
      }

      const user = await call<IUser>(CLOUD_FUNCTIONS.USER, 'updateProfile', payload, {
        loading: true,
        loadingText: '保存中'
      })

      app.globalData.user = user
      userStore.setUser(user)
      this.applyUser(user)
      showSuccess('保存成功')
    } catch (error) {
      // call() 已弹出错误提示，此处仅记录日志
      console.error('[mine] 保存资料失败', error)
    } finally {
      this.setData({ saving: false })
    }
  }
})
