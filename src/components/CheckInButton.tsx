import { useState } from 'react'
import { User, CheckInEntry } from '../types'
import { format } from 'date-fns'
import './CheckInButton.css'

interface CheckInButtonProps {
  currentUser: User
  userName: string
  hasCheckedIn: boolean
  onCheckIn: (entry: Omit<CheckInEntry, 'id'>) => void
}

export default function CheckInButton({ 
  currentUser, 
  userName, 
  hasCheckedIn, 
  onCheckIn 
}: CheckInButtonProps) {
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')

  const handleCheckIn = () => {
    if (hasCheckedIn) return
    
    onCheckIn({
      userId: currentUser,
      date: format(new Date(), 'yyyy-MM-dd'),
      note: note.trim() || undefined,
    })
    
    setNote('')
    setShowNote(false)
  }

  const today = format(new Date(), 'yyyy年MM月dd日')

  return (
    <div className="checkin-button-card">
      <h2>✅ 每日打卡</h2>
      <div className="checkin-content">
        <div className="checkin-info">
          <p className="checkin-date">{today}</p>
          <p className="checkin-user">{userName}的打卡</p>
        </div>
        
        {hasCheckedIn ? (
          <div className="checked-in-state">
            <div className="check-icon">✓</div>
            <p className="checked-text">今日已打卡</p>
            <p className="checked-encourage">继续保持，加油！💪</p>
          </div>
        ) : (
          <div className="checkin-actions">
            {!showNote ? (
              <>
                <button 
                  className="checkin-btn primary"
                  onClick={() => setShowNote(true)}
                >
                  ✨ 立即打卡
                </button>
                <button 
                  className="checkin-btn secondary"
                  onClick={handleCheckIn}
                >
                  快速打卡
                </button>
              </>
            ) : (
              <div className="note-input-section">
                <textarea
                  className="checkin-note-input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="记录今天的心情、运动或饮食..."
                  rows={3}
                />
                <div className="note-actions">
                  <button 
                    className="checkin-btn primary"
                    onClick={handleCheckIn}
                  >
                    完成打卡
                  </button>
                  <button 
                    className="checkin-btn cancel"
                    onClick={() => {
                      setShowNote(false)
                      setNote('')
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
