import { useState, useMemo } from 'react'
import { format, subDays, parseISO } from 'date-fns'
import { CheckInEntry, WeightEntry, Milestone } from '../types'
import { storage } from '../utils/storage'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './Progress.css'

interface ProgressProps {
  userId: string
}

export default function Progress({ userId }: ProgressProps) {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30')

  const checkIns = storage.getCheckInEntries(userId)
  const weightEntries = storage.getWeightEntries(userId)
  const milestones = storage.getMilestones(userId)

  // 计算连续打卡天数
  const calculateStreak = (): number => {
    if (checkIns.length === 0) return 0
    
    // 去重并按日期排序（最新的在前）
    const uniqueDates = [...new Set(checkIns.map(c => c.date))].sort().reverse()
    
    let streak = 0
    const today = format(new Date(), 'yyyy-MM-dd')
    let expectedDate = today

    for (const date of uniqueDates) {
      if (date === expectedDate) {
        streak++
        // 计算下一天应该是哪一天
        const dateObj = parseISO(date)
        expectedDate = format(subDays(dateObj, 1), 'yyyy-MM-dd')
      } else {
        // 如果日期不连续，停止计数
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()

  // 生成热力图数据
  const heatmapData = useMemo(() => {
    const days = parseInt(timeRange)
    const data: { date: string; count: number }[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const checkIn = checkIns.find(c => c.date === date)
      const hasCheckIn = !!checkIn
      const exerciseCount = checkIn?.exercises?.length || 0
      const count = hasCheckIn ? (exerciseCount > 0 ? 2 : 1) : 0
      
      data.push({ date, count })
    }
    
    return data
  }, [checkIns, timeRange])

  // 生成体重趋势数据
  const weightData = useMemo(() => {
    const days = parseInt(timeRange)
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    
    return weightEntries
      .filter(w => {
        const entryDate = parseISO(w.date)
        return entryDate >= startDate && entryDate <= endDate
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(w => ({
        date: format(parseISO(w.date), 'MM/dd'),
        weight: w.weight,
      }))
  }, [weightEntries, timeRange])

  // 计算里程碑
  const achievedMilestones = milestones.filter(m => {
    const achievedDate = parseISO(m.achievedAt)
    const daysAgo = Math.floor((new Date().getTime() - achievedDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysAgo <= parseInt(timeRange)
  })

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>📊 进展</h2>
        <div className="time-range-selector">
          <button
            className={timeRange === '7' ? 'active' : ''}
            onClick={() => setTimeRange('7')}
          >
            7天
          </button>
          <button
            className={timeRange === '30' ? 'active' : ''}
            onClick={() => setTimeRange('30')}
          >
            30天
          </button>
          <button
            className={timeRange === '90' ? 'active' : ''}
            onClick={() => setTimeRange('90')}
          >
            90天
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{streak}</div>
          <div className="stat-label">连续打卡</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{checkIns.length}</div>
          <div className="stat-label">总打卡次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏃</div>
          <div className="stat-value">
            {checkIns.filter(c => c.exercises && c.exercises.length > 0).length}
          </div>
          <div className="stat-label">运动天数</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💧</div>
          <div className="stat-value">
            {checkIns.filter(c => c.water === true).length}
          </div>
          <div className="stat-label">喝水达标</div>
        </div>
      </div>

      {/* 体重趋势 */}
      {weightData.length > 0 && (
        <div className="chart-section">
          <h3>体重趋势</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#667eea" 
                  strokeWidth={2}
                  dot={{ fill: '#667eea', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 习惯热力图 */}
      <div className="heatmap-section">
        <h3>习惯热力图</h3>
        <div className="heatmap">
          {heatmapData.map((item, index) => {
            const intensity = item.count === 0 ? 0 : item.count === 1 ? 1 : 2
            return (
              <div
                key={index}
                className={`heatmap-cell intensity-${intensity}`}
                title={`${item.date}: ${item.count > 0 ? '已打卡' : '未打卡'}`}
              />
            )
          })}
        </div>
        <div className="heatmap-legend">
          <div className="legend-item">
            <div className="legend-color intensity-0" />
            <span>未打卡</span>
          </div>
          <div className="legend-item">
            <div className="legend-color intensity-1" />
            <span>已打卡</span>
          </div>
          <div className="legend-item">
            <div className="legend-color intensity-2" />
            <span>有运动</span>
          </div>
        </div>
      </div>

      {/* 里程碑 */}
      {achievedMilestones.length > 0 && (
        <div className="milestones-section">
          <h3>🏆 里程碑</h3>
          <div className="milestones-list">
            {achievedMilestones.map(milestone => {
              const labels = {
                streak_7: '连续打卡7天',
                streak_14: '连续打卡14天',
                streak_30: '连续打卡30天',
                goal_10: '目标进度10%',
                goal_50: '目标进度50%',
                goal_100: '目标进度100%',
              }
              return (
                <div key={milestone.id} className="milestone-item">
                  <div className="milestone-icon">🎉</div>
                  <div className="milestone-info">
                    <div className="milestone-title">{labels[milestone.type]}</div>
                    <div className="milestone-date">
                      {format(parseISO(milestone.achievedAt), 'yyyy年MM月dd日')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
