import { useState, useEffect } from 'react'
import { ReminderSettings, PrivacySettings, UserProfile, CoupleBinding } from '../types'
import { storage } from '../utils/storage'
import './Settings.css'

interface SettingsProps {
  userId: string
  userProfile: UserProfile
}

export default function Settings({ userId, userProfile }: SettingsProps) {
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    userId,
    checkInReminder: {
      enabled: true,
      times: ['20:00'],
    },
    partnerCheckInNotification: true,
    weeklyRecap: true,
  })

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    userId,
    shareWeight: false,
    shareMeasurements: false,
    sharePhoto: false,
    shareMood: true,
    shareNote: false,
  })

  const [showUnbindConfirm, setShowUnbindConfirm] = useState(false)

  useEffect(() => {
    const savedReminder = storage.getReminderSettings(userId)
    if (savedReminder) {
      setReminderSettings(savedReminder)
    }

    const savedPrivacy = storage.getPrivacySettings(userId)
    if (savedPrivacy) {
      setPrivacySettings(savedPrivacy)
    }
  }, [userId])

  const handleSaveReminder = () => {
    storage.saveReminderSettings(reminderSettings)
    alert('提醒设置已保存')
  }

  const handleSavePrivacy = () => {
    storage.savePrivacySettings(privacySettings)
    alert('隐私设置已保存')
  }

  const handleUnbind = () => {
    const binding = storage.getCoupleBindingByUserId(userId)
    if (binding) {
      storage.unbindCouple(binding.id)
      alert('已解绑，需要重新绑定才能使用情侣功能')
      window.location.reload()
    }
  }

  const binding = storage.getCoupleBindingByUserId(userId)
  const partnerId = binding
    ? binding.userId1 === userId
      ? binding.userId2
      : binding.userId1
    : null
  const partnerProfile = partnerId ? storage.getUserProfile(partnerId) : null

  return (
    <div className="settings-container">
      <div className="settings-page">
        <h2>⚙️ 设置</h2>

        {/* 账号信息 */}
        <div className="settings-section">
          <h3>账号信息</h3>
          <div className="info-item">
            <span className="info-label">昵称</span>
            <span className="info-value">{userProfile.name}</span>
          </div>
          {userProfile.phone && (
            <div className="info-item">
              <span className="info-label">手机号</span>
              <span className="info-value">{userProfile.phone}</span>
            </div>
          )}
        </div>

        {/* 目标信息 */}
        <div className="settings-section">
          <h3>目标</h3>
          {userProfile.startWeight && (
            <div className="info-item">
              <span className="info-label">起始体重</span>
              <span className="info-value">{userProfile.startWeight} kg</span>
            </div>
          )}
          {userProfile.targetWeight && (
            <div className="info-item">
              <span className="info-label">目标体重</span>
              <span className="info-value">{userProfile.targetWeight} kg</span>
            </div>
          )}
          {userProfile.goalPeriod && (
            <div className="info-item">
              <span className="info-label">目标周期</span>
              <span className="info-value">{userProfile.goalPeriod} 天</span>
            </div>
          )}
        </div>

        {/* 提醒设置 */}
        <div className="settings-section">
          <h3>提醒设置</h3>
          <div className="setting-item">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={reminderSettings.checkInReminder.enabled}
                onChange={(e) =>
                  setReminderSettings({
                    ...reminderSettings,
                    checkInReminder: {
                      ...reminderSettings.checkInReminder,
                      enabled: e.target.checked,
                    },
                  })
                }
              />
              <span>每日打卡提醒</span>
            </label>
          </div>
          {reminderSettings.checkInReminder.enabled && (
            <div className="setting-item">
              <label className="setting-label">提醒时间</label>
              <input
                type="time"
                value={reminderSettings.checkInReminder.times[0] || '20:00'}
                onChange={(e) =>
                  setReminderSettings({
                    ...reminderSettings,
                    checkInReminder: {
                      ...reminderSettings.checkInReminder,
                      times: [e.target.value],
                    },
                  })
                }
                className="time-input"
              />
            </div>
          )}
          <div className="setting-item">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={reminderSettings.partnerCheckInNotification}
                onChange={(e) =>
                  setReminderSettings({
                    ...reminderSettings,
                    partnerCheckInNotification: e.target.checked,
                  })
                }
              />
              <span>伴侣打卡提醒</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={reminderSettings.weeklyRecap}
                onChange={(e) =>
                  setReminderSettings({
                    ...reminderSettings,
                    weeklyRecap: e.target.checked,
                  })
                }
              />
              <span>周报提醒</span>
            </label>
          </div>
          <button className="save-btn" onClick={handleSaveReminder}>
            保存提醒设置
          </button>
        </div>

        {/* 隐私设置 */}
        <div className="settings-section">
          <h3>隐私设置</h3>
          <p className="privacy-hint">控制哪些信息与伴侣共享</p>
          <div className="setting-item">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={privacySettings.shareWeight}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    shareWeight: e.target.checked,
                  })
                }
              />
              <span>共享体重</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={privacySettings.shareMeasurements}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    shareMeasurements: e.target.checked,
                  })
                }
              />
              <span>共享围度</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={privacySettings.sharePhoto}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    sharePhoto: e.target.checked,
                  })
                }
              />
              <span>共享照片</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={privacySettings.shareMood}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    shareMood: e.target.checked,
                  })
                }
              />
              <span>共享心情</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={privacySettings.shareNote}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    shareNote: e.target.checked,
                  })
                }
              />
              <span>共享备注</span>
            </label>
          </div>
          <button className="save-btn" onClick={handleSavePrivacy}>
            保存隐私设置
          </button>
        </div>

        {/* 情侣绑定 */}
        {binding && partnerProfile && (
          <div className="settings-section">
            <h3>情侣绑定</h3>
            <div className="info-item">
              <span className="info-label">绑定对象</span>
              <span className="info-value">{partnerProfile.name}</span>
            </div>
            {!showUnbindConfirm ? (
              <button
                className="unbind-btn"
                onClick={() => setShowUnbindConfirm(true)}
              >
                解绑
              </button>
            ) : (
              <div className="unbind-confirm">
                <p>确定要解绑吗？解绑后需要重新绑定才能使用情侣功能。</p>
                <div className="confirm-actions">
                  <button
                    className="confirm-btn"
                    onClick={handleUnbind}
                  >
                    确认解绑
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowUnbindConfirm(false)}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 退出登录 */}
        <div className="settings-section">
          <button
            className="logout-btn"
            onClick={() => {
              if (confirm('确定要退出登录吗？')) {
                storage.setCurrentUserId('')
                window.location.reload()
              }
            }}
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}
