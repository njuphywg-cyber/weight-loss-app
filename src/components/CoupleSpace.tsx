import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { CoupleBinding, CheckInEntry, CheerCard, UserProfile, CoupleGoal, PrivacySettings } from '../types'
import { storage } from '../utils/storage'
import './CoupleSpace.css'

interface CoupleSpaceProps {
  userId: string
}

export default function CoupleSpace({ userId }: CoupleSpaceProps) {
  const [binding, setBinding] = useState<CoupleBinding | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null)
  const [myCheckIn, setMyCheckIn] = useState<CheckInEntry | null>(null)
  const [partnerCheckIn, setPartnerCheckIn] = useState<CheckInEntry | null>(null)
  const [cheerCards, setCheerCards] = useState<CheerCard[]>([])
  const [coupleGoals, setCoupleGoals] = useState<CoupleGoal[]>([])
  const [partnerPrivacy, setPartnerPrivacy] = useState<PrivacySettings | null>(null)

  useEffect(() => {
    loadCoupleData()
  }, [userId])

  const loadCoupleData = () => {
    const coupleBinding = storage.getCoupleBindingByUserId(userId)
    if (!coupleBinding || !coupleBinding.isActive) return

    setBinding(coupleBinding)
    
    const partnerId = coupleBinding.userId1 === userId 
      ? coupleBinding.userId2 
      : coupleBinding.userId1
    
    if (!partnerId) return
    
    const partner = storage.getUserProfile(partnerId)
    setPartnerProfile(partner || null)

    // 加载伴侣隐私设置
    const privacy = storage.getPrivacySettings(partnerId)
    setPartnerPrivacy(privacy)

    const today = format(new Date(), 'yyyy-MM-dd')
    const myTodayCheckIn = storage.getCheckInByDate(userId, today)
    const partnerTodayCheckIn = storage.getCheckInByDate(partnerId, today)
    
    setMyCheckIn(myTodayCheckIn || null)
    setPartnerCheckIn(partnerTodayCheckIn || null)

    // 加载鼓励墙
    const cards = storage.getCheerCards(userId, 'all')
    setCheerCards(cards.slice(0, 10)) // 最近10条

    // 加载共同目标
    const goals = storage.getCoupleGoals(coupleBinding.id)
    setCoupleGoals(goals)
  }

  const calculateEnergyLevel = (checkIn: CheckInEntry | null): number => {
    if (!checkIn) return 0
    
    let score = 0
    if (checkIn.exercises && checkIn.exercises.length > 0) score += 25
    if (checkIn.diet === 'controlled' || checkIn.diet === 'normal') score += 25
    if (checkIn.water === true) score += 25
    if (checkIn.sleep === 'good') score += 25
    
    return score
  }

  const myEnergy = calculateEnergyLevel(myCheckIn)
  const partnerEnergy = calculateEnergyLevel(partnerCheckIn)

  if (!binding || !partnerProfile) {
    return (
      <div className="couple-space-container">
        <div className="no-couple-message">
          <div className="icon">💑</div>
          <h3>还没有绑定伴侣</h3>
          <p>快去绑定你的另一半，一起开始减肥之旅吧！</p>
        </div>
      </div>
    )
  }

  const myProfile = storage.getUserProfile(userId)

  return (
    <div className="couple-space-container">
      <div className="couple-space-header">
        <h2>💕 情侣空间</h2>
        <p className="subtitle">只属于我们俩的私域空间</p>
      </div>

      {/* 今日状态 */}
      <div className="today-status">
        <div className="status-card">
          <div className="status-avatar">{myProfile?.name?.[0] || '我'}</div>
          <div className="status-info">
            <div className="status-name">{myProfile?.name || '我'}</div>
            <div className="status-checkin">
              {myCheckIn ? '✅ 已打卡' : '⏰ 未打卡'}
            </div>
            {myCheckIn?.mood && (
              <div className="status-mood">
                {myCheckIn.mood === 'happy' && '🙂'}
                {myCheckIn.mood === 'neutral' && '😐'}
                {myCheckIn.mood === 'sad' && '🙁'}
                {myCheckIn.mood === 'anxious' && '😣'}
                {myCheckIn.mood === 'excited' && '🤩'}
              </div>
            )}
            {myCheckIn?.weight && (
              <div className="status-weight">
                体重: {myCheckIn.weight}kg
              </div>
            )}
          </div>
        </div>

        <div className="status-card">
          <div className="status-avatar">{partnerProfile.name[0]}</div>
          <div className="status-info">
            <div className="status-name">{partnerProfile.name}</div>
            <div className="status-checkin">
              {partnerCheckIn ? '✅ 已打卡' : '⏰ 未打卡'}
            </div>
            {partnerCheckIn?.mood && partnerPrivacy?.shareMood !== false && (
              <div className="status-mood">
                {partnerCheckIn.mood === 'happy' && '🙂'}
                {partnerCheckIn.mood === 'neutral' && '😐'}
                {partnerCheckIn.mood === 'sad' && '🙁'}
                {partnerCheckIn.mood === 'anxious' && '😣'}
                {partnerCheckIn.mood === 'excited' && '🤩'}
              </div>
            )}
            {partnerCheckIn?.weight && partnerPrivacy?.shareWeight === true && (
              <div className="status-weight">
                体重: {partnerCheckIn.weight}kg
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 能量条 */}
      <div className="energy-bar-section">
        <h3>情侣能量条</h3>
        <div className="energy-bars">
          <div className="energy-item">
            <div className="energy-label">{myProfile?.name || '我'}</div>
            <div className="energy-bar">
              <div 
                className="energy-fill" 
                style={{ width: `${myEnergy}%` }}
              />
            </div>
            <div className="energy-value">{myEnergy}%</div>
          </div>
          <div className="energy-item">
            <div className="energy-label">{partnerProfile.name}</div>
            <div className="energy-bar">
              <div 
                className="energy-fill partner" 
                style={{ width: `${partnerEnergy}%` }}
              />
            </div>
            <div className="energy-value">{partnerEnergy}%</div>
          </div>
        </div>
        <p className="energy-hint">今日综合完成度（不排名）</p>
      </div>

      {/* 共同目标 */}
      {coupleGoals.length > 0 && (
        <div className="couple-goals-section">
          <h3>🎯 共同目标</h3>
          {coupleGoals.map(goal => {
            const milestoneLabels: Record<number, string> = {
              10: '10%',
              50: '50%',
              100: '100%',
            }
            const achievedMilestones = goal.milestones.filter(m => goal.progress >= m)
            
            return (
              <div key={goal.id} className="couple-goal-card">
                <div className="goal-header">
                  <span className="goal-type">
                    {goal.type === 'weight' && '💪 体重'}
                    {goal.type === 'exercise' && '🏃 运动'}
                    {goal.type === 'checkin' && '✅ 打卡'}
                  </span>
                  <span className="goal-progress-text">{goal.progress}%</span>
                </div>
                <div className="goal-progress-bar">
                  <div 
                    className="goal-progress-fill" 
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="goal-milestones">
                  {goal.milestones.map(milestone => (
                    <div
                      key={milestone}
                      className={`milestone-marker ${achievedMilestones.includes(milestone) ? 'achieved' : ''}`}
                      style={{ left: `${milestone}%` }}
                    >
                      {achievedMilestones.includes(milestone) && '🎉'}
                      <span className="milestone-label">{milestoneLabels[milestone]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 鼓励墙 */}
      <div className="cheer-wall">
        <h3>💬 鼓励墙</h3>
        {cheerCards.length === 0 ? (
          <div className="empty-cheer">
            <p>还没有鼓励记录</p>
            <p className="hint">打卡后可以给伴侣发送鼓励哦～</p>
          </div>
        ) : (
          <div className="cheer-list">
            {cheerCards.map(card => {
              const fromUser = storage.getUserProfile(card.fromUserId)
              const toUser = storage.getUserProfile(card.toUserId)
              const isFromMe = card.fromUserId === userId
              
              return (
                <div key={card.id} className={`cheer-item ${isFromMe ? 'sent' : 'received'}`}>
                  <div className="cheer-header">
                    <span className="cheer-from">
                      {isFromMe ? '我' : fromUser?.name || '对方'}
                    </span>
                    <span className="cheer-type">
                      {card.type === 'praise' && '💬 夸夸'}
                      {card.type === 'hug' && '🤗 抱抱'}
                      {card.type === 'micro_task' && '📋 小任务'}
                    </span>
                    <span className="cheer-time">
                      {format(new Date(card.createdAt), 'MM/dd HH:mm')}
                    </span>
                  </div>
                  <div className="cheer-content">{card.content}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
