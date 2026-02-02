import { CheckInEntry, User } from '../types'
import { format, differenceInDays, startOfToday, parseISO, isSameDay } from 'date-fns'
import './CheckInStats.css'

interface CheckInStatsProps {
  entries: CheckInEntry[]
  userId: User
  userName: string
}

export default function CheckInStats({ entries, userId, userName }: CheckInStatsProps) {
  const userEntries = entries.filter(e => e.userId === userId)
  
  // 计算连续打卡天数
  const calculateStreak = () => {
    if (userEntries.length === 0) return 0
    
    const sortedEntries = [...userEntries]
      .map(e => parseISO(e.date))
      .sort((a, b) => b.getTime() - a.getTime())
    
    let streak = 0
    let expectedDate = startOfToday()
    
    for (const entryDate of sortedEntries) {
      if (isSameDay(entryDate, expectedDate) || isSameDay(entryDate, new Date(expectedDate.getTime() - 86400000))) {
        if (isSameDay(entryDate, expectedDate)) {
          streak++
        } else {
          streak++
          expectedDate = new Date(entryDate)
        }
        expectedDate = new Date(expectedDate.getTime() - 86400000)
      } else {
        break
      }
    }
    
    return streak
  }

  const totalDays = userEntries.length
  const streakDays = calculateStreak()
  const thisMonth = userEntries.filter(e => {
    const entryDate = parseISO(e.date)
    const today = new Date()
    return entryDate.getMonth() === today.getMonth() && 
           entryDate.getFullYear() === today.getFullYear()
  }).length

  return (
    <div className="checkin-stats-card">
      <h2>📊 打卡统计</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{streakDays}</div>
          <div className="stat-label">连续打卡</div>
          <div className="stat-unit">天</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalDays}</div>
          <div className="stat-label">总打卡</div>
          <div className="stat-unit">次</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{thisMonth}</div>
          <div className="stat-label">本月打卡</div>
          <div className="stat-unit">次</div>
        </div>
      </div>
      {streakDays > 0 && (
        <div className="streak-encourage">
          {streakDays >= 7 ? '🔥' : streakDays >= 3 ? '💪' : '✨'} 
          已连续打卡 {streakDays} 天，{streakDays >= 7 ? '太棒了！' : '继续加油！'}
        </div>
      )}
    </div>
  )
}
