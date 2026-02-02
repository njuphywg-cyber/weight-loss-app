import { useState } from 'react'
import { User, WeightEntry } from '../types'
import { format } from 'date-fns'
import './WeightForm.css'

interface WeightFormProps {
  currentUser: User
  onAdd: (entry: Omit<WeightEntry, 'id'>) => void
}

export default function WeightForm({ currentUser, onAdd }: WeightFormProps) {
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!weight || !date) return

    onAdd({
      userId: currentUser,
      date,
      weight: parseFloat(weight),
      note: note.trim() || undefined,
    })

    // 重置表单
    setWeight('')
    setNote('')
    setDate(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <div className="weight-form-card">
      <h2>📝 记录体重</h2>
      <form onSubmit={handleSubmit} className="weight-form">
        <div className="form-group">
          <label htmlFor="date">日期</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="weight">体重 (kg)</label>
          <input
            id="weight"
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="请输入体重"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="note">备注 (可选)</label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="记录今天的心情、运动或饮食..."
            rows={3}
          />
        </div>

        <button type="submit" className="submit-button">
          ✨ 保存记录
        </button>
      </form>
    </div>
  )
}
