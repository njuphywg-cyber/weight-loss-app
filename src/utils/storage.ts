import {
  WeightEntry,
  UserProfile,
  CheckInEntry,
  CoupleBinding,
  Goal,
  CoupleGoal,
  CheerCard,
  ReminderSettings,
  PrivacySettings,
  WeeklyRecap,
  Milestone,
} from '../types'

const STORAGE_KEYS = {
  WEIGHT_ENTRIES: 'weight-loss-entries',
  USER_PROFILES: 'weight-loss-profiles',
  CHECK_IN_ENTRIES: 'weight-loss-checkins',
  COUPLE_BINDINGS: 'weight-loss-couples',
  GOALS: 'weight-loss-goals',
  COUPLE_GOALS: 'weight-loss-couple-goals',
  CHEER_CARDS: 'weight-loss-cheers',
  REMINDER_SETTINGS: 'weight-loss-reminders',
  PRIVACY_SETTINGS: 'weight-loss-privacy',
  WEEKLY_RECAPS: 'weight-loss-recaps',
  MILESTONES: 'weight-loss-milestones',
  CURRENT_USER_ID: 'weight-loss-current-user',
}

// 生成6位随机码
export function generateBindCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const storage = {
  // 当前用户
  getCurrentUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)
  },

  setCurrentUserId(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId)
  },

  // 用户资料
  getUserProfiles(): UserProfile[] {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILES)
    return data ? JSON.parse(data) : []
  },

  getUserProfile(userId: string): UserProfile | undefined {
    const profiles = this.getUserProfiles()
    return profiles.find(p => p.id === userId)
  },

  saveUserProfile(profile: UserProfile): void {
    const profiles = this.getUserProfiles()
    const index = profiles.findIndex(p => p.id === profile.id)
    if (index !== -1) {
      profiles[index] = profile
    } else {
      profiles.push(profile)
    }
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles))
  },

  // 体重记录
  getWeightEntries(userId?: string): WeightEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES)
    const entries: WeightEntry[] = data ? JSON.parse(data) : []
    return userId ? entries.filter(e => e.userId === userId) : entries
  },

  saveWeightEntry(entry: WeightEntry): void {
    const entries = this.getWeightEntries()
    entries.push(entry)
    localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries))
  },

  deleteWeightEntry(id: string): void {
    const entries = this.getWeightEntries()
    const filtered = entries.filter(e => e.id !== id)
    localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(filtered))
  },

  // 打卡记录
  getCheckInEntries(userId?: string): CheckInEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHECK_IN_ENTRIES)
    const entries: CheckInEntry[] = data ? JSON.parse(data) : []
    return userId ? entries.filter(e => e.userId === userId) : entries
  },

  getCheckInByDate(userId: string, date: string): CheckInEntry | undefined {
    const entries = this.getCheckInEntries(userId)
    return entries.find(e => e.date === date)
  },

  saveCheckInEntry(entry: CheckInEntry): void {
    const entries = this.getCheckInEntries()
    // 检查是否已存在同一天的打卡
    const existingIndex = entries.findIndex(
      e => e.userId === entry.userId && e.date === entry.date
    )
    if (existingIndex !== -1) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }
    localStorage.setItem(STORAGE_KEYS.CHECK_IN_ENTRIES, JSON.stringify(entries))
  },

  hasCheckedInToday(userId: string): boolean {
    const today = new Date().toISOString().split('T')[0]
    const entries = this.getCheckInEntries(userId)
    return entries.some(e => e.userId === userId && e.date === today)
  },

  // 情侣绑定
  getCoupleBindings(): CoupleBinding[] {
    const data = localStorage.getItem(STORAGE_KEYS.COUPLE_BINDINGS)
    return data ? JSON.parse(data) : []
  },

  getCoupleBindingByUserId(userId: string): CoupleBinding | undefined {
    const bindings = this.getCoupleBindings()
    return bindings.find(
      b => (b.userId1 === userId || b.userId2 === userId) && b.isActive && b.userId1 && b.userId2
    )
  },

  saveCoupleBinding(binding: CoupleBinding): void {
    const bindings = this.getCoupleBindings()
    bindings.push(binding)
    localStorage.setItem(STORAGE_KEYS.COUPLE_BINDINGS, JSON.stringify(bindings))
  },

  unbindCouple(bindingId: string): void {
    const bindings = this.getCoupleBindings()
    const binding = bindings.find(b => b.id === bindingId)
    if (binding) {
      binding.isActive = false
      localStorage.setItem(STORAGE_KEYS.COUPLE_BINDINGS, JSON.stringify(bindings))
    }
  },

  // 目标
  getGoals(userId?: string): Goal[] {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS)
    const goals: Goal[] = data ? JSON.parse(data) : []
    return userId ? goals.filter(g => g.userId === userId) : goals
  },

  saveGoal(goal: Goal): void {
    const goals = this.getGoals()
    const index = goals.findIndex(g => g.id === goal.id)
    if (index !== -1) {
      goals[index] = goal
    } else {
      goals.push(goal)
    }
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals))
  },

  // 情侣共同目标
  getCoupleGoals(coupleId?: string): CoupleGoal[] {
    const data = localStorage.getItem(STORAGE_KEYS.COUPLE_GOALS)
    const goals: CoupleGoal[] = data ? JSON.parse(data) : []
    return coupleId ? goals.filter(g => g.coupleId === coupleId) : goals
  },

  saveCoupleGoal(goal: CoupleGoal): void {
    const goals = this.getCoupleGoals()
    const index = goals.findIndex(g => g.id === goal.id)
    if (index !== -1) {
      goals[index] = goal
    } else {
      goals.push(goal)
    }
    localStorage.setItem(STORAGE_KEYS.COUPLE_GOALS, JSON.stringify(goals))
  },

  // 鼓励卡
  getCheerCards(userId?: string, direction: 'sent' | 'received' | 'all' = 'all'): CheerCard[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHEER_CARDS)
    const cards: CheerCard[] = data ? JSON.parse(data) : []
    let filtered = cards
    if (userId) {
      if (direction === 'sent') {
        filtered = cards.filter(c => c.fromUserId === userId)
      } else if (direction === 'received') {
        filtered = cards.filter(c => c.toUserId === userId)
      } else {
        filtered = cards.filter(c => c.fromUserId === userId || c.toUserId === userId)
      }
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  saveCheerCard(card: CheerCard): void {
    const cards = this.getCheerCards()
    cards.push(card)
    localStorage.setItem(STORAGE_KEYS.CHEER_CARDS, JSON.stringify(cards))
  },

  markCheerCardAsRead(cardId: string): void {
    const cards = this.getCheerCards()
    const card = cards.find(c => c.id === cardId)
    if (card) {
      card.isRead = true
      localStorage.setItem(STORAGE_KEYS.CHEER_CARDS, JSON.stringify(cards))
    }
  },

  // 提醒设置
  getReminderSettings(userId: string): ReminderSettings | null {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS)
    const settings: ReminderSettings[] = data ? JSON.parse(data) : []
    return settings.find(s => s.userId === userId) || null
  },

  saveReminderSettings(settings: ReminderSettings): void {
    const allSettings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS) || '[]'
    )
    const index = allSettings.findIndex((s: ReminderSettings) => s.userId === settings.userId)
    if (index !== -1) {
      allSettings[index] = settings
    } else {
      allSettings.push(settings)
    }
    localStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(allSettings))
  },

  // 隐私设置
  getPrivacySettings(userId: string): PrivacySettings | null {
    const data = localStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS)
    const settings: PrivacySettings[] = data ? JSON.parse(data) : []
    return settings.find(s => s.userId === userId) || null
  },

  savePrivacySettings(settings: PrivacySettings): void {
    const allSettings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS) || '[]'
    )
    const index = allSettings.findIndex((s: PrivacySettings) => s.userId === settings.userId)
    if (index !== -1) {
      allSettings[index] = settings
    } else {
      allSettings.push(settings)
    }
    localStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(allSettings))
  },

  // 周报
  getWeeklyRecaps(userId?: string): WeeklyRecap[] {
    const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_RECAPS)
    const recaps: WeeklyRecap[] = data ? JSON.parse(data) : []
    return userId ? recaps.filter(r => r.userId === userId) : recaps
  },

  saveWeeklyRecap(recap: WeeklyRecap): void {
    const recaps = this.getWeeklyRecaps()
    recaps.push(recap)
    localStorage.setItem(STORAGE_KEYS.WEEKLY_RECAPS, JSON.stringify(recaps))
  },

  // 里程碑
  getMilestones(userId?: string): Milestone[] {
    const data = localStorage.getItem(STORAGE_KEYS.MILESTONES)
    const milestones: Milestone[] = data ? JSON.parse(data) : []
    return userId ? milestones.filter(m => m.userId === userId) : milestones
  },

  saveMilestone(milestone: Milestone): void {
    const milestones = this.getMilestones()
    // 检查是否已存在相同类型的里程碑
    const existing = milestones.find(
      m => m.userId === milestone.userId && m.type === milestone.type
    )
    if (!existing) {
      milestones.push(milestone)
      localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones))
    }
  },

  // 检查并创建里程碑
  checkAndCreateMilestones(userId: string): Milestone[] {
    const checkIns = this.getCheckInEntries(userId)
    const goals = this.getGoals(userId)
    const milestones: Milestone[] = []

    // 计算连续打卡天数
    if (checkIns.length > 0) {
      // 去重并按日期排序（最新的在前）
      const uniqueDates = [...new Set(checkIns.map(c => c.date))].sort().reverse()
      
      let streak = 0
      const today = new Date().toISOString().split('T')[0]
      let expectedDate = today

      for (const date of uniqueDates) {
        if (date === expectedDate) {
          streak++
          // 计算下一天应该是哪一天
          expectedDate = this.getPreviousDate(date)
        } else {
          // 如果日期不连续，停止计数
          break
        }
      }

      // 检查连续打卡里程碑
      if (streak >= 7) {
        const existing = this.getMilestones(userId).find(m => m.type === 'streak_7')
        if (!existing) {
          milestones.push({
            id: `milestone_${Date.now()}_streak_7`,
            userId,
            type: 'streak_7',
            achievedAt: new Date().toISOString(),
            isShared: true,
          })
        }
      }
      if (streak >= 14) {
        const existing = this.getMilestones(userId).find(m => m.type === 'streak_14')
        if (!existing) {
          milestones.push({
            id: `milestone_${Date.now()}_streak_14`,
            userId,
            type: 'streak_14',
            achievedAt: new Date().toISOString(),
            isShared: true,
          })
        }
      }
      if (streak >= 30) {
        const existing = this.getMilestones(userId).find(m => m.type === 'streak_30')
        if (!existing) {
          milestones.push({
            id: `milestone_${Date.now()}_streak_30`,
            userId,
            type: 'streak_30',
            achievedAt: new Date().toISOString(),
            isShared: true,
          })
        }
      }
    }

    // 检查目标进度里程碑
    const weightGoal = goals.find(g => g.type === 'weight')
    if (weightGoal && weightGoal.targetValue) {
      // 获取起始体重（从用户资料或目标）
      const userProfile = this.getUserProfile(userId)
      const startValue = userProfile?.startWeight || weightGoal.currentValue || 0
      const targetValue = weightGoal.targetValue
      
      // 获取最新的体重记录
      const weightEntries = this.getWeightEntries(userId)
      const latestWeight = weightEntries.length > 0 
        ? weightEntries.sort((a, b) => b.date.localeCompare(a.date))[0].weight
        : startValue
      
      // 计算进度百分比（假设目标是减重）
      // 如果当前体重 < 起始体重，说明在减重
      if (targetValue && startValue && targetValue !== startValue && latestWeight) {
        // 计算已完成的进度
        const totalChange = Math.abs(startValue - targetValue)
        const currentChange = Math.abs(startValue - latestWeight)
        const progressPercent = totalChange > 0 ? (currentChange / totalChange) * 100 : 0

        if (progressPercent >= 10) {
          const existing = this.getMilestones(userId).find(m => m.type === 'goal_10')
          if (!existing) {
            milestones.push({
              id: `milestone_${Date.now()}_goal_10`,
              userId,
              type: 'goal_10',
              achievedAt: new Date().toISOString(),
              isShared: true,
            })
          }
        }
        if (progressPercent >= 50) {
          const existing = this.getMilestones(userId).find(m => m.type === 'goal_50')
          if (!existing) {
            milestones.push({
              id: `milestone_${Date.now()}_goal_50`,
              userId,
              type: 'goal_50',
              achievedAt: new Date().toISOString(),
              isShared: true,
            })
          }
        }
        if (progressPercent >= 100) {
          const existing = this.getMilestones(userId).find(m => m.type === 'goal_100')
          if (!existing) {
            milestones.push({
              id: `milestone_${Date.now()}_goal_100`,
              userId,
              type: 'goal_100',
              achievedAt: new Date().toISOString(),
              isShared: true,
            })
          }
        }
      }
    }

    // 保存新里程碑
    milestones.forEach(m => this.saveMilestone(m))
    return milestones
  },

  getPreviousDate(dateString: string): string {
    const date = new Date(dateString)
    date.setDate(date.getDate() - 1)
    return date.toISOString().split('T')[0]
  },
}
