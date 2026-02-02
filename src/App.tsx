import { useState, useEffect } from 'react'
import { UserProfile } from './types'
import { storage } from './utils/storage'
import Login from './components/Login'
import CoupleBinding from './components/CoupleBinding'
import GoalSetup from './components/GoalSetup'
import SimpleCheckIn from './components/SimpleCheckIn'
import CoupleSpace from './components/CoupleSpace'
import Progress from './components/Progress'
import Settings from './components/Settings'
import WeeklyRecap from './components/WeeklyRecap'
import './App.css'

type Page = 'checkin' | 'couple' | 'progress' | 'settings' | 'recap'
type AppState = 'login' | 'binding' | 'goal-setup' | 'main'

function App() {
  const [appState, setAppState] = useState<AppState>('login')
  const [currentPage, setCurrentPage] = useState<Page>('checkin')
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    // 检查是否已登录
    const savedUserId = storage.getCurrentUserId()
    if (savedUserId) {
      const profile = storage.getUserProfile(savedUserId)
      if (profile) {
        setUserId(savedUserId)
        setUserProfile(profile)
        
        // 检查是否需要绑定或设置目标
        const binding = storage.getCoupleBindingByUserId(savedUserId)
        if (!binding) {
          setAppState('binding')
        } else if (!profile.startWeight || !profile.targetWeight) {
          setAppState('goal-setup')
        } else {
          setAppState('main')
        }
      }
    }
  }, [])

  const handleLogin = (loggedInUserId: string) => {
    setUserId(loggedInUserId)
    const profile = storage.getUserProfile(loggedInUserId)
    setUserProfile(profile || null)
    
    // 检查是否需要绑定
    const binding = storage.getCoupleBindingByUserId(loggedInUserId)
    if (!binding) {
      setAppState('binding')
    } else if (!profile?.startWeight || !profile?.targetWeight) {
      setAppState('goal-setup')
    } else {
      setAppState('main')
    }
  }

  const handleBound = () => {
    if (!userId) return
    const profile = storage.getUserProfile(userId)
    if (!profile?.startWeight || !profile?.targetWeight) {
      setAppState('goal-setup')
    } else {
      setAppState('main')
    }
  }

  const handleGoalComplete = () => {
    setAppState('main')
  }

  const handleCheckInComplete = () => {
    // 刷新数据
    if (userId) {
      const profile = storage.getUserProfile(userId)
      setUserProfile(profile || null)
    }
  }

  // 登录页面
  if (appState === 'login') {
    return <Login onLogin={handleLogin} />
  }

  // 绑定页面
  if (appState === 'binding' && userId) {
    return <CoupleBinding userId={userId} onBound={handleBound} />
  }

  // 目标设置页面
  if (appState === 'goal-setup' && userId && userProfile) {
    return <GoalSetup userId={userId} userProfile={userProfile} onComplete={handleGoalComplete} />
  }

  // 主应用
  if (appState === 'main' && userId && userProfile) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>💕 一起变轻</h1>
          <p className="subtitle">情侣专属的减肥打卡与互相鼓励 App</p>
        </header>

        <main className="app-main">
          {currentPage === 'checkin' && (
            <SimpleCheckIn
              userId={userId}
              onCheckInComplete={handleCheckInComplete}
            />
          )}
          {currentPage === 'couple' && <CoupleSpace userId={userId} />}
          {currentPage === 'progress' && <Progress userId={userId} />}
          {currentPage === 'settings' && (
            <Settings userId={userId} userProfile={userProfile} />
          )}
          {currentPage === 'recap' && (
            <WeeklyRecap userId={userId} />
          )}
        </main>

        <nav className="app-nav">
          <button
            className={`nav-item ${currentPage === 'checkin' ? 'active' : ''}`}
            onClick={() => setCurrentPage('checkin')}
          >
            <span className="nav-icon">✨</span>
            <span className="nav-label">今日</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'couple' ? 'active' : ''}`}
            onClick={() => setCurrentPage('couple')}
          >
            <span className="nav-icon">💕</span>
            <span className="nav-label">情侣空间</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'progress' ? 'active' : ''}`}
            onClick={() => setCurrentPage('progress')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">进展</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'recap' ? 'active' : ''}`}
            onClick={() => setCurrentPage('recap')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-label">周报</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">我的</span>
          </button>
        </nav>
      </div>
    )
  }

  return null
}

export default App
