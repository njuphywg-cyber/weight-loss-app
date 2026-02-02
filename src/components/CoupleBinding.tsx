import { useState, useEffect } from 'react'
import { CoupleBinding as CoupleBindingType, UserProfile } from '../types'
import { storage, generateBindCode } from '../utils/storage'
import './CoupleBinding.css'

interface CoupleBindingProps {
  userId: string
  onBound: () => void
}

export default function CoupleBinding({ userId, onBound }: CoupleBindingProps) {
  const [step, setStep] = useState<'create' | 'join'>('create')
  const [bindCode, setBindCode] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    // 检查是否已有绑定
    const existingBinding = storage.getCoupleBindingByUserId(userId)
    if (existingBinding) {
      const partnerId = existingBinding.userId1 === userId 
        ? existingBinding.userId2 
        : existingBinding.userId1
      const partner = storage.getUserProfile(partnerId)
      if (partner) {
        setPartnerProfile(partner)
        onBound()
      }
    }
  }, [userId, onBound])

  const handleCreateBinding = () => {
    const code = generateBindCode()
    setCreatedCode(code)
    
    // 创建绑定记录（等待对方加入）
    const binding: CoupleBindingType = {
      id: `binding_${Date.now()}`,
      userId1: userId,
      userId2: '', // 待对方加入
      bindCode: code,
      createdAt: new Date().toISOString(),
      isActive: false, // 未完成绑定前不激活
    }
    
    // 临时存储（实际应用中应该存储在服务器）
    const tempBindings = JSON.parse(localStorage.getItem('temp_bindings') || '[]')
    tempBindings.push(binding)
    localStorage.setItem('temp_bindings', JSON.stringify(tempBindings))
  }

  const handleJoinBinding = () => {
    if (!bindCode.trim()) {
      alert('请输入6位绑定码')
      return
    }

    // 查找绑定记录
    const tempBindings = JSON.parse(localStorage.getItem('temp_bindings') || '[]')
    const binding = tempBindings.find((b: CoupleBindingType) => 
      b.bindCode.toUpperCase() === bindCode.trim().toUpperCase() && !b.isActive
    )

    if (!binding) {
      alert('绑定码无效或已被使用')
      return
    }

    // 完成绑定
    const completedBinding: CoupleBindingType = {
      ...binding,
      userId2: userId,
      isActive: true,
    }

    storage.saveCoupleBinding(completedBinding)
    
    // 移除临时记录
    const updatedTemp = tempBindings.filter((b: CoupleBindingType) => b.id !== binding.id)
    localStorage.setItem('temp_bindings', JSON.stringify(updatedTemp))

    // 获取对方信息
    const partnerId = binding.userId1
    const partner = storage.getUserProfile(partnerId)
    if (partner) {
      setPartnerProfile(partner)
      onBound()
    }
  }

  if (partnerProfile) {
    return (
      <div className="couple-binding-container">
        <div className="binding-success">
          <div className="success-icon">💕</div>
          <h2>绑定成功！</h2>
          <p>已与 <strong>{partnerProfile.name}</strong> 绑定</p>
          <button className="continue-btn" onClick={onBound}>
            进入应用
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="couple-binding-container">
      <div className="binding-card">
        <h2>💑 情侣绑定</h2>
        <p className="binding-subtitle">与你的另一半一起开始减肥之旅</p>

        <div className="binding-tabs">
          <button
            className={`tab-btn ${step === 'create' ? 'active' : ''}`}
            onClick={() => setStep('create')}
          >
            创建绑定
          </button>
          <button
            className={`tab-btn ${step === 'join' ? 'active' : ''}`}
            onClick={() => setStep('join')}
          >
            加入绑定
          </button>
        </div>

        {step === 'create' && (
          <div className="binding-content">
            {!createdCode ? (
              <>
                <p className="binding-instruction">
                  创建绑定后，将生成一个6位绑定码，分享给你的另一半即可完成绑定
                </p>
                <button className="create-btn" onClick={handleCreateBinding}>
                  创建绑定码
                </button>
              </>
            ) : (
              <>
                <div className="code-display">
                  <p className="code-label">绑定码</p>
                  <div className="code-value">{createdCode}</div>
                  <p className="code-hint">请将绑定码分享给你的另一半</p>
                </div>
                <div className="waiting-message">
                  <p>等待对方加入...</p>
                  <p className="small-text">（刷新页面查看绑定状态）</p>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'join' && (
          <div className="binding-content">
            <p className="binding-instruction">
              输入你的另一半提供的6位绑定码
            </p>
            <div className="code-input-group">
              <input
                type="text"
                value={bindCode}
                onChange={(e) => setBindCode(e.target.value.toUpperCase())}
                placeholder="输入6位绑定码"
                maxLength={6}
                className="code-input"
              />
            </div>
            <button className="join-btn" onClick={handleJoinBinding}>
              完成绑定
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
