import { useState, useEffect } from 'react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { WeeklyRecap as WeeklyRecapType } from '../types'
import { storage } from '../utils/storage'
import { generateWeeklyRecap } from '../utils/aiService'
import './WeeklyRecap.css'

interface WeeklyRecapProps {
  userId: string
}

export default function WeeklyRecap({ userId }: WeeklyRecapProps) {
  const [currentRecap, setCurrentRecap] = useState<WeeklyRecapType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadCurrentWeekRecap()
  }, [userId])

  const loadCurrentWeekRecap = () => {
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

    const recaps = storage.getWeeklyRecaps(userId)
    const recap = recaps.find(
      r => r.weekStart === weekStart && r.weekEnd === weekEnd
    )

    if (recap) {
      setCurrentRecap(recap)
    } else {
      // 自动生成周报
      generateRecap()
    }
  }

  const generateRecap = () => {
    setIsGenerating(true)
    
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

    const allCheckIns = storage.getCheckInEntries(userId)
    const weekCheckIns = allCheckIns.filter(c => {
      return c.date >= weekStart && c.date <= weekEnd
    })

    const recapData = generateWeeklyRecap(userId, weekCheckIns, weekStart, weekEnd)

    // 获取伴侣信息（如果有）
    const binding = storage.getCoupleBindingByUserId(userId)
    let coupleMoment: string | undefined
    if (binding && binding.userId1 && binding.userId2) {
      const partnerId = binding.userId1 === userId ? binding.userId2 : binding.userId1
      if (partnerId) {
        const partnerCheckIns = storage.getCheckInEntries(partnerId).filter(
          c => c.date >= weekStart && c.date <= weekEnd
        )
        const bothCheckedIn = weekCheckIns.length > 0 && partnerCheckIns.length > 0
        if (bothCheckedIn) {
          coupleMoment = `本周你们一起坚持打卡，互相鼓励，很棒！`
        }
      }
    }

    const recap: WeeklyRecapType = {
      id: `recap_${Date.now()}`,
      userId,
      weekStart,
      weekEnd,
      highlight: recapData.highlight,
      progress: recapData.progress,
      nextWeekMicroGoal: recapData.nextWeekMicroGoal,
      coupleMoment,
      createdAt: new Date().toISOString(),
    }

    storage.saveWeeklyRecap(recap)
    setCurrentRecap(recap)
    setIsGenerating(false)
  }

  if (isGenerating) {
    return (
      <div className="weekly-recap-container">
        <div className="recap-loading">
          <div className="loading-spinner">⏳</div>
          <p>正在生成周报...</p>
        </div>
      </div>
    )
  }

  if (!currentRecap) {
    return (
      <div className="weekly-recap-container">
        <div className="recap-empty">
          <p>本周还没有数据</p>
          <button className="generate-btn" onClick={generateRecap}>
            生成周报
          </button>
        </div>
      </div>
    )
  }

  const weekStartDate = format(new Date(currentRecap.weekStart), 'MM月dd日')
  const weekEndDate = format(new Date(currentRecap.weekEnd), 'MM月dd日')

  return (
    <div className="weekly-recap-container">
      <div className="recap-card">
        <div className="recap-header">
          <h2>📊 本周周报</h2>
          <p className="recap-date-range">
            {weekStartDate} - {weekEndDate}
          </p>
        </div>

        <div className="recap-content">
          <div className="recap-highlight">
            <div className="highlight-icon">✨</div>
            <div className="highlight-text">{currentRecap.highlight}</div>
          </div>

          <div className="recap-progress">
            <h3>本周进步</h3>
            <ul className="progress-list">
              {currentRecap.progress.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {currentRecap.coupleMoment && (
            <div className="recap-couple">
              <div className="couple-icon">💕</div>
              <div className="couple-text">{currentRecap.coupleMoment}</div>
            </div>
          )}

          <div className="recap-goal">
            <h3>下周小目标</h3>
            <p className="goal-text">{currentRecap.nextWeekMicroGoal}</p>
          </div>
        </div>

        <div className="recap-actions">
          <button className="regenerate-btn" onClick={generateRecap}>
            重新生成
          </button>
        </div>
      </div>
    </div>
  )
}
