import { CheckInEntry, User } from '../types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO, isSameDay } from 'date-fns'
import './CheckInCalendar.css'

interface CheckInCalendarProps {
  entries: CheckInEntry[]
  userId: User
}

export default function CheckInCalendar({ entries, userId }: CheckInCalendarProps) {
  const userEntries = entries.filter(e => e.userId === userId)
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 获取第一天是星期几（0=周日）
  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array(firstDayOfWeek).fill(null)

  const hasCheckedIn = (date: Date) => {
    return userEntries.some(e => isSameDay(parseISO(e.date), date))
  }

  return (
    <div className="checkin-calendar-card">
      <h2>📅 打卡日历</h2>
      <div className="calendar-header">
        <div className="month-year">{format(today, 'yyyy年MM月')}</div>
      </div>
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty"></div>
          ))}
          {daysInMonth.map(day => {
            const checked = hasCheckedIn(day)
            const isTodayDate = isToday(day)
            return (
              <div
                key={day.toISOString()}
                className={`calendar-day ${checked ? 'checked' : ''} ${isTodayDate ? 'today' : ''}`}
                title={checked ? format(day, 'yyyy-MM-dd') : ''}
              >
                <span className="day-number">{format(day, 'd')}</span>
                {checked && <span className="check-mark">✓</span>}
              </div>
            )
          })}
        </div>
      </div>
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color checked"></div>
          <span>已打卡</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>今天</span>
        </div>
      </div>
    </div>
  )
}
