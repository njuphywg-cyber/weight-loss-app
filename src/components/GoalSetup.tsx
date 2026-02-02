import { useState } from 'react'
import { Goal, UserProfile, CoupleGoal } from '../types'
import { storage } from '../utils/storage'
import './GoalSetup.css'

interface GoalSetupProps {
  userId: string
  userProfile: UserProfile
  onComplete: () => void
}

export default function GoalSetup({ userId, userProfile, onComplete }: GoalSetupProps) {
  const [step, setStep] = useState(1)
  const [weightGoal, setWeightGoal] = useState({
    startWeight: userProfile.startWeight || 0,
    targetWeight: userProfile.targetWeight || 0,
    period: 30,
  })
  const [recordIntensity, setRecordIntensity] = useState<'light' | 'standard' | 'advanced'>('light')
  const [stylePreference, setStylePreference] = useState<'cute' | 'calm' | 'funny' | 'serious'>('cute')

  const handleNext = () => {
    if (step === 1) {
      if (weightGoal.startWeight > 0 && weightGoal.targetWeight > 0) {
        setStep(2)
      } else {
        alert('请填写体重目标')
      }
    } else if (step === 2) {
      setStep(3)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    // 保存用户资料
    const updatedProfile: UserProfile = {
      ...userProfile,
      startWeight: weightGoal.startWeight,
      targetWeight: weightGoal.targetWeight,
      goalPeriod: weightGoal.period,
      recordIntensity,
      stylePreference,
    }
    storage.saveUserProfile(updatedProfile)

    // 创建体重目标
    const goal: Goal = {
      id: `goal_${Date.now()}`,
      userId,
      type: 'weight',
      targetValue: weightGoal.targetWeight,
      currentValue: weightGoal.startWeight,
      period: weightGoal.period,
      startDate: new Date().toISOString().split('T')[0],
      isShared: false,
    }
    storage.saveGoal(goal)

    // 如果已绑定伴侣，创建共同目标
    const binding = storage.getCoupleBindingByUserId(userId)
    if (binding) {
      const coupleGoal: CoupleGoal = {
        id: `couple_goal_${Date.now()}`,
        coupleId: binding.id,
        type: 'weight',
        targetValue: weightGoal.targetWeight,
        currentValue: weightGoal.startWeight,
        progress: 0,
        milestones: [10, 50, 100],
        createdAt: new Date().toISOString(),
      }
      storage.saveCoupleGoal(coupleGoal)
    }

    onComplete()
  }

  return (
    <div className="goal-setup-container">
      <div className="goal-setup-card">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="goal-step">
            <h2>🎯 设置目标</h2>
            <p className="step-description">设置你的体重目标</p>

            <div className="goal-form">
              <div className="form-group">
                <label>起始体重 (kg)</label>
                <input
                  type="number"
                  value={weightGoal.startWeight || ''}
                  onChange={(e) => setWeightGoal({
                    ...weightGoal,
                    startWeight: parseFloat(e.target.value) || 0,
                  })}
                  placeholder="请输入当前体重"
                  step="0.1"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>目标体重 (kg)</label>
                <input
                  type="number"
                  value={weightGoal.targetWeight || ''}
                  onChange={(e) => setWeightGoal({
                    ...weightGoal,
                    targetWeight: parseFloat(e.target.value) || 0,
                  })}
                  placeholder="请输入目标体重"
                  step="0.1"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>目标周期 (天)</label>
                <select
                  value={weightGoal.period}
                  onChange={(e) => setWeightGoal({
                    ...weightGoal,
                    period: parseInt(e.target.value),
                  })}
                >
                  <option value={30}>30天</option>
                  <option value={60}>60天</option>
                  <option value={90}>90天</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="goal-step">
            <h2>📝 记录强度</h2>
            <p className="step-description">选择你希望的记录详细程度</p>

            <div className="intensity-options">
              <div
                className={`intensity-option ${recordIntensity === 'light' ? 'active' : ''}`}
                onClick={() => setRecordIntensity('light')}
              >
                <div className="option-icon">✨</div>
                <div className="option-title">轻量</div>
                <div className="option-desc">最少1项也算完成，30秒内结束</div>
              </div>

              <div
                className={`intensity-option ${recordIntensity === 'standard' ? 'active' : ''}`}
                onClick={() => setRecordIntensity('standard')}
              >
                <div className="option-icon">📊</div>
                <div className="option-title">标准</div>
                <div className="option-desc">记录更多细节，帮助追踪进度</div>
              </div>

              <div
                className={`intensity-option ${recordIntensity === 'advanced' ? 'active' : ''}`}
                onClick={() => setRecordIntensity('advanced')}
              >
                <div className="option-icon">🔥</div>
                <div className="option-title">进阶</div>
                <div className="option-desc">详细记录，包括围度、照片等</div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="goal-step">
            <h2>💬 文案风格</h2>
            <p className="step-description">选择你喜欢的反馈风格</p>

            <div className="style-options">
              <div
                className={`style-option ${stylePreference === 'cute' ? 'active' : ''}`}
                onClick={() => setStylePreference('cute')}
              >
                <div className="style-icon">😊</div>
                <div className="style-title">可爱</div>
                <div className="style-example">"今天超棒的！继续加油💪"</div>
              </div>

              <div
                className={`style-option ${stylePreference === 'calm' ? 'active' : ''}`}
                onClick={() => setStylePreference('calm')}
              >
                <div className="style-icon">😌</div>
                <div className="style-title">克制</div>
                <div className="style-example">"做得很好，继续保持"</div>
              </div>

              <div
                className={`style-option ${stylePreference === 'funny' ? 'active' : ''}`}
                onClick={() => setStylePreference('funny')}
              >
                <div className="style-icon">😄</div>
                <div className="style-title">搞笑</div>
                <div className="style-example">"卷王本卷！"</div>
              </div>

              <div
                className={`style-option ${stylePreference === 'serious' ? 'active' : ''}`}
                onClick={() => setStylePreference('serious')}
              >
                <div className="style-icon">😐</div>
                <div className="style-title">认真</div>
                <div className="style-example">"优秀的表现"</div>
              </div>
            </div>
          </div>
        )}

        <div className="goal-actions">
          {step > 1 && (
            <button className="btn-secondary" onClick={() => setStep(step - 1)}>
              上一步
            </button>
          )}
          <button className="btn-primary" onClick={handleNext}>
            {step === 3 ? '完成' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  )
}
