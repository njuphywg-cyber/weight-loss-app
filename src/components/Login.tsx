import { useState } from 'react'
import { UserProfile } from '../types'
import { storage } from '../utils/storage'
import './Login.css'

interface LoginProps {
  onLogin: (userId: string) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLogin = () => {
    if (!phone.trim()) {
      alert('请输入手机号')
      return
    }

    // 查找现有用户
    const profiles = storage.getUserProfiles()
    let user = profiles.find(p => p.phone === phone)

    if (!user) {
      // 新用户注册
      if (!name.trim()) {
        alert('请输入昵称')
        return
      }
      user = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
      }
      storage.saveUserProfile(user)
    }

    storage.setCurrentUserId(user.id)
    onLogin(user.id)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="app-title">💕 一起变轻</h1>
        <p className="app-subtitle">情侣专属的减肥打卡与互相鼓励 App</p>

        <div className="login-form">
          <div className="form-group">
            <label>手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              maxLength={11}
            />
          </div>

          {!isRegistering && (
            <div className="form-group">
              <label>昵称（首次登录）</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入昵称"
                maxLength={20}
              />
            </div>
          )}

          <button className="login-btn" onClick={handleLogin}>
            {isRegistering ? '登录' : '开始使用'}
          </button>

          <p className="login-hint">
            {isRegistering ? (
              <span onClick={() => setIsRegistering(false)} className="link">
                已有账号？直接登录
              </span>
            ) : (
              <span>首次使用将自动注册</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
