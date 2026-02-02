import { User, UserProfile } from '../types'
import './UserSwitcher.css'

interface UserSwitcherProps {
  currentUser: User
  profiles: UserProfile[]
  onUserChange: (user: User) => void
}

export default function UserSwitcher({ currentUser, profiles, onUserChange }: UserSwitcherProps) {
  return (
    <div className="user-switcher">
      {profiles.map(profile => (
        <button
          key={profile.id}
          className={`user-button ${currentUser === profile.id ? 'active' : ''}`}
          onClick={() => onUserChange(profile.id)}
        >
          <span className="user-icon">{profile.id === 'me' ? '👨' : '👩'}</span>
          <span className="user-name">{profile.name}</span>
        </button>
      ))}
    </div>
  )
}
