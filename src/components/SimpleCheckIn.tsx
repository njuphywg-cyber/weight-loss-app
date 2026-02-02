/*  */import { useState, useEffect } from 'react'
import { format, subDays, parseISO } from 'date-fns'
import { CheckInEntry, ExerciseType, DietType, SleepQuality, MoodType, EmpathyFeedback } from '../types'
import { storage } from '../utils/storage'
import { classifyCheckInState, generateEmpathyFeedback, recommendCheerType, generateCheerContent } from '../utils/aiService'
import './SimpleCheckIn.css'

interface SimpleCheckInProps {
  userId: string
  userName: string
  onCheckInComplete: () => void
}

export default function SimpleCheckIn({ userId, userName, onCheckInComplete }: SimpleCheckInProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(today)
  const [existingCheckIn, setExistingCheckIn] = useState<CheckInEntry | undefined>(
    storage.getCheckInByDate(userId, selectedDate)
  )
  const hasCheckedIn = !!existingCheckIn
  
  // 生成可选择的日期（今天和过去2天）
  const selectableDates = [
    { date: today, label: '今天' },
    { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), label: '昨天' },
    { date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), label: '前天' },
  ]

  const [exercises, setExercises] = useState<ExerciseType[]>(existingCheckIn?.exercises || [])
  const [diet, setDiet] = useState<DietType | undefined>(existingCheckIn?.diet)
  const [water, setWater] = useState<boolean | undefined>(existingCheckIn?.water)
  const [sleep, setSleep] = useState<SleepQuality | undefined>(existingCheckIn?.sleep)
  const [mood, setMood] = useState<MoodType | undefined>(existingCheckIn?.mood)
  const [note, setNote] = useState(existingCheckIn?.note || '')
  const [weight, setWeight] = useState(existingCheckIn?.weight || undefined)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCard, setFeedbackCard] = useState<EmpathyFeedback | null>(null)
  const [showCheer, setShowCheer] = useState(false)

  // 当选择的日期改变时，更新表单数据
  useEffect(() => {
    const checkIn = storage.getCheckInByDate(userId, selectedDate)
    setExistingCheckIn(checkIn)
    if (checkIn) {
      setExercises(checkIn.exercises || [])
      setDiet(checkIn.diet)
      setWater(checkIn.water)
      setSleep(checkIn.sleep)
      setMood(checkIn.mood)
      setNote(checkIn.note || '')
      setWeight(checkIn.weight)
    } else {
      setExercises([])
      setDiet(undefined)
      setWater(undefined)
      setSleep(undefined)
      setMood(undefined)
      setNote('')
      setWeight(undefined)
    }
    setShowFeedback(false)
    setFeedbackCard(null)
  }, [selectedDate, userId])

  const toggleExercise = (type: ExerciseType) => {
    setExercises(prev => 
      prev.includes(type) 
        ? prev.filter(e => e !== type)
        : [...prev, type]
    )
  }

  const handleSubmit = () => {
    // 极简打卡：至少1项也算完成
    const hasAnyData = exercises.length > 0 || diet || water !== undefined || sleep || mood

    if (!hasAnyData) {
      alert('请至少选择一项完成打卡')
      return
    }

    // 检查是否超过2天
    const selectedDateObj = parseISO(selectedDate)
    const todayObj = new Date()
    const daysDiff = Math.floor((todayObj.getTime() - selectedDateObj.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff > 2) {
      alert('只能补卡过去2天内的记录')
      return
    }

    const checkIn: CheckInEntry = {
      id: existingCheckIn?.id || `checkin_${Date.now()}`,
      userId,
      date: selectedDate,
      exercises: exercises.length > 0 ? exercises : undefined,
      diet,
      water,
      sleep,
      mood,
      note: note.trim() || undefined,
      weight: weight || undefined,
    }

    // AI分析
    const history = storage.getCheckInEntries(userId).slice(-7) // 最近7天
    const aiState = classifyCheckInState(checkIn, history)
    checkIn.aiState = aiState

    // 生成情绪反馈
    const feedback = generateEmpathyFeedback(checkIn, aiState)
    checkIn.feedbackCard = feedback
    setFeedbackCard(feedback)

    // 保存打卡
    storage.saveCheckInEntry(checkIn)
    
    // 检查并创建里程碑
    const newMilestones = storage.checkAndCreateMilestones(userId)
    if (newMilestones.length > 0) {
      // 延迟显示里程碑庆祝（在反馈卡之后）
      setTimeout(() => {
        const milestoneLabels: Record<string, string> = {
          streak_7: '连续打卡7天',
          streak_14: '连续打卡14天',
          streak_30: '连续打卡30天',
          goal_10: '目标进度10%',
          goal_50: '目标进度50%',
          goal_100: '目标进度100%',
        }
        const message = newMilestones.map(m => milestoneLabels[m.type] || '里程碑').join('、')
        alert(`🎉 恭喜达成里程碑：${message}！`)
      }, 500)
    }
    
    // 显示反馈卡
    setShowFeedback(true)
  }

  const handleSendCheer = () => {
    if (!feedbackCard) return

    // 获取伴侣信息
    const binding = storage.getCoupleBindingByUserId(userId)
    if (!binding) {
      alert('请先完成情侣绑定')
      return
    }

    const partnerId = binding.userId1 === userId ? binding.userId2 : binding.userId1
    const partnerProfile = storage.getUserProfile(partnerId)
    const partnerCheckIn = storage.getCheckInByDate(partnerId, selectedDate)

    // 推荐互动类型
    const aiState = storage.getCheckInByDate(userId, selectedDate)?.aiState
    if (!aiState) return

    const cheerType = recommendCheerType(aiState, !!partnerCheckIn, partnerCheckIn?.mood)
    const style = storage.getUserProfile(userId)?.stylePreference || 'cute'
    const content = generateCheerContent(cheerType, style)

    // 创建鼓励卡
    const cheerCard = {
      id: `cheer_${Date.now()}`,
      fromUserId: userId,
      toUserId: partnerId,
      type: cheerType,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
    }

    storage.saveCheerCard(cheerCard)
    alert(`已发送${cheerType === 'praise' ? '夸夸' : cheerType === 'hug' ? '抱抱' : '小任务'}给${partnerProfile?.name || '伴侣'}`)
    setShowCheer(false)
    onCheckInComplete()
  }

  if (hasCheckedIn && !showFeedback) {
    return (
      <div className="simple-checkin-container">
        <div className="checkin-card">
          <h2>✅ 已打卡</h2>
          <p className="checkin-date">{format(parseISO(selectedDate), 'yyyy年MM月dd日')}</p>
          {existingCheckIn?.feedbackCard && (
            <div className="feedback-preview">
              <div className="feedback-title">{existingCheckIn.feedbackCard.title}</div>
              <div className="feedback-line">{existingCheckIn.feedbackCard.empathyLine}</div>
            </div>
          )}
          <button className="edit-btn" onClick={() => setShowFeedback(false)}>
            修改打卡
          </button>
        </div>
      </div>
    )
  }

  if (showFeedback && feedbackCard) {
    return (
      <div className="simple-checkin-container">
        <div className="feedback-card">
          <div className="feedback-header">
            <div className="feedback-title">{feedbackCard.title}</div>
          </div>
          <div className="feedback-content">
            <p className="empathy-line">{feedbackCard.empathyLine}</p>
            <p className="achievement-line">{feedbackCard.achievementLine}</p>
            {feedbackCard.microAction && (
              <p className="micro-action">💡 {feedbackCard.microAction}</p>
            )}
          </div>
          <div className="feedback-actions">
            <button className="btn-primary" onClick={handleSendCheer}>
              💕 发给伴侣
            </button>
            <button className="btn-secondary" onClick={() => {
              setShowFeedback(false)
              onCheckInComplete()
            }}>
              完成
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="simple-checkin-container">
      <div className="checkin-card">
        <h2>✨ 极简打卡</h2>
        
        {/* 日期选择器 */}
        <div className="date-selector">
          <label className="section-label">选择日期</label>
          <div className="date-options">
            {selectableDates.map(({ date, label }) => (
              <button
                key={date}
                className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDate(date)
                }}
              >
                {label}
                {date === today && ' 📅'}
              </button>
            ))}
          </div>
        </div>
        
        <p className="checkin-date">{format(parseISO(selectedDate), 'yyyy年MM月dd日')}</p>
        <p className="checkin-hint">至少选择1项即可完成打卡（可补卡过去2天）</p>

        <div className="checkin-form">
          {/* 运动 */}
          <div className="checkin-section">
            <label className="section-label">运动</label>
            <div className="exercise-options">
              {(['walk', 'cardio', 'strength', 'stretch'] as ExerciseType[]).map(type => {
                const labels = {
                  walk: '🚶 走路',
                  cardio: '🏃 有氧',
                  strength: '💪 力量',
                  stretch: '🧘 拉伸',
                }
                return (
                  <button
                    key={type}
                    className={`option-btn ${exercises.includes(type) ? 'active' : ''}`}
                    onClick={() => toggleExercise(type)}
                  >
                    {labels[type]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 饮食 */}
          <div className="checkin-section">
            <label className="section-label">饮食</label>
            <div className="diet-options">
              {([
                { value: 'normal', label: '正常' },
                { value: 'controlled', label: '控制不错' },
                { value: 'indulgent', label: '稍放纵' },
                { value: 'binge', label: '暴食' },
              ] as { value: DietType; label: string }[]).map(option => (
                <button
                  key={option.value}
                  className={`option-btn ${diet === option.value ? 'active' : ''}`}
                  onClick={() => setDiet(diet === option.value ? undefined : option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 喝水 */}
          <div className="checkin-section">
            <label className="section-label">喝水</label>
            <div className="water-options">
              <button
                className={`option-btn ${water === true ? 'active' : ''}`}
                onClick={() => setWater(water === true ? undefined : true)}
              >
                ✅ 达标
              </button>
              <button
                className={`option-btn ${water === false ? 'active' : ''}`}
                onClick={() => setWater(water === false ? undefined : false)}
              >
                ❌ 未达标
              </button>
            </div>
          </div>

          {/* 睡眠 */}
          <div className="checkin-section">
            <label className="section-label">睡眠</label>
            <div className="sleep-options">
              {([
                { value: 'good', label: '😴 好' },
                { value: 'fair', label: '😑 一般' },
                { value: 'poor', label: '😫 差' },
              ] as { value: SleepQuality; label: string }[]).map(option => (
                <button
                  key={option.value}
                  className={`option-btn ${sleep === option.value ? 'active' : ''}`}
                  onClick={() => setSleep(sleep === option.value ? undefined : option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 心情 */}
          <div className="checkin-section">
            <label className="section-label">心情</label>
            <div className="mood-options">
              {([
                { value: 'happy', emoji: '🙂' },
                { value: 'neutral', emoji: '😐' },
                { value: 'sad', emoji: '🙁' },
                { value: 'anxious', emoji: '😣' },
                { value: 'excited', emoji: '🤩' },
              ] as { value: MoodType; emoji: string }[]).map(option => (
                <button
                  key={option.value}
                  className={`mood-btn ${mood === option.value ? 'active' : ''}`}
                  onClick={() => setMood(mood === option.value ? undefined : option.value)}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div className="checkin-section">
            <label className="section-label">备注（可选）</label>
            <textarea
              className="note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录今天的心情、运动或饮食..."
              rows={2}
            />
          </div>

          {/* 体重（可选） */}
          <div className="checkin-section">
            <label className="section-label">体重（可选，kg）</label>
            <input
              type="number"
              className="weight-input"
              value={weight || ''}
              onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="今日体重"
              step="0.1"
            />
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          完成打卡
        </button>
      </div>
    </div>
  )
}
