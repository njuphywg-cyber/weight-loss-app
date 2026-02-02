// 用户相关
export type User = string

export interface UserProfile {
  id: string
  name: string
  phone?: string
  avatar?: string
  startWeight?: number
  targetWeight?: number
  goalPeriod?: number // 天数
  recordIntensity?: 'light' | 'standard' | 'advanced' // 轻量/标准/进阶
  stylePreference?: 'cute' | 'calm' | 'funny' | 'serious' // 文案风格偏好
}

// 情侣绑定
export interface CoupleBinding {
  id: string
  userId1: string
  userId2: string
  bindCode: string // 6位口令
  createdAt: string
  isActive: boolean
}

// 目标系统
export interface Goal {
  id: string
  userId: string
  type: 'weight' | 'exercise' | 'water' | 'sleep' | 'checkin' // 体重/运动/喝水/睡眠/打卡
  targetValue?: number // 目标值（体重kg、次数等）
  currentValue?: number
  period?: number // 周期（天数）
  startDate: string
  endDate?: string
  isShared: boolean // 是否与伴侣共享
}

export interface CoupleGoal {
  id: string
  coupleId: string
  type: 'weight' | 'exercise' | 'checkin'
  targetValue: number
  currentValue: number
  progress: number // 0-100
  milestones: number[] // [10, 50, 100]
  createdAt: string
}

// 打卡相关
export type ExerciseType = 'walk' | 'cardio' | 'strength' | 'stretch'
export type DietType = 'normal' | 'controlled' | 'indulgent' | 'binge'
export type SleepQuality = 'good' | 'fair' | 'poor'
export type MoodType = 'happy' | 'neutral' | 'sad' | 'anxious' | 'excited'

export interface CheckInEntry {
  id: string
  userId: string
  date: string
  // 极简打卡字段
  exercises?: ExerciseType[] // 可多选
  diet?: DietType
  water?: boolean // 达标/未达标
  sleep?: SleepQuality
  mood?: MoodType
  note?: string // 备注一句话
  weight?: number // 可选
  measurements?: { // 围度（可选）
    waist?: number
    hip?: number
    chest?: number
  }
  photo?: string // 照片URL（可选）
  // AI分析结果
  aiState?: {
    effortLevel: 'high' | 'mid' | 'low'
    moodState: 'positive' | 'neutral' | 'low' | 'anxious' | 'irritable'
    riskFlag?: 'binge' | 'self_blame' | 'overtraining_suspect'
    contextHint?: 'busy' | 'period' | 'social_event' | 'travel' | 'sick'
    recommendedTone: 'cute' | 'calm' | 'funny' | 'serious'
  }
  // 情绪反馈
  feedbackCard?: {
    title: string
    empathyLine: string
    achievementLine: string
    microAction?: string
    styleTag: string
  }
}

// 体重记录
export interface WeightEntry {
  id: string
  userId: string
  date: string
  weight: number
  note?: string
}

// 伴侣互动
export type CheerType = 'praise' | 'hug' | 'micro_task'

export interface CheerCard {
  id: string
  fromUserId: string
  toUserId: string
  type: CheerType
  content: string
  sticker?: string // 贴纸
  createdAt: string
  isRead: boolean
}

// 提醒设置
export interface ReminderSettings {
  userId: string
  checkInReminder: {
    enabled: boolean
    times: string[] // ["20:00", "21:00"]
  }
  partnerCheckInNotification: boolean
  weeklyRecap: boolean
}

// 隐私设置
export interface PrivacySettings {
  userId: string
  shareWeight: boolean
  shareMeasurements: boolean
  sharePhoto: boolean
  shareMood: boolean
  shareNote: boolean
}

// AI节点分析结果
export interface AIStateClassification {
  effortLevel: 'high' | 'mid' | 'low'
  moodState: 'positive' | 'neutral' | 'low' | 'anxious' | 'irritable'
  riskFlag?: 'binge' | 'self_blame' | 'overtraining_suspect'
  contextHint?: 'busy' | 'period' | 'social_event' | 'travel' | 'sick'
  recommendedTone: 'cute' | 'calm' | 'funny' | 'serious'
  confidence?: number
}

export interface EmpathyFeedback {
  title: string
  empathyLine: string
  achievementLine: string
  microAction?: string
  styleTag: 'cute' | 'calm' | 'funny' | 'serious'
  safeLevel: 'normal' | 'downgrade'
}

// 周报
export interface WeeklyRecap {
  id: string
  userId: string
  weekStart: string
  weekEnd: string
  highlight: string
  progress: string[]
  nextWeekMicroGoal: string
  coupleMoment?: string
  createdAt: string
}

// 里程碑
export interface Milestone {
  id: string
  userId: string
  type: 'streak_7' | 'streak_14' | 'streak_30' | 'goal_10' | 'goal_50' | 'goal_100'
  achievedAt: string
  isShared: boolean
}
