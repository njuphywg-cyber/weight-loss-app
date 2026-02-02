import { WeightEntry } from '../types'
import { format } from 'date-fns'
import './WeightHistory.css'

interface WeightHistoryProps {
  entries: WeightEntry[]
  onDelete: (id: string) => void
}

export default function WeightHistory({ entries, onDelete }: WeightHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="weight-history-card">
        <h2>📊 历史记录</h2>
        <div className="empty-state">
          <p>还没有记录，开始记录你的第一笔体重吧！</p>
        </div>
      </div>
    )
  }

  const getWeightChange = (index: number) => {
    if (index === entries.length - 1) return null
    const current = entries[index].weight
    const previous = entries[index + 1].weight
    const change = current - previous
    return change
  }

  return (
    <div className="weight-history-card">
      <h2>📊 历史记录</h2>
      <div className="history-list">
        {entries.map((entry, index) => {
          const change = getWeightChange(index)
          return (
            <div key={entry.id} className="history-item">
              <div className="history-date">
                {format(new Date(entry.date), 'yyyy年MM月dd日')}
              </div>
              <div className="history-weight">
                <span className="weight-value">{entry.weight}</span>
                <span className="weight-unit">kg</span>
                {change !== null && (
                  <span className={`weight-change ${change < 0 ? 'decrease' : change > 0 ? 'increase' : ''}`}>
                    {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change).toFixed(1)}kg
                  </span>
                )}
              </div>
              {entry.note && (
                <div className="history-note">{entry.note}</div>
              )}
              <button
                className="delete-button"
                onClick={() => {
                  if (confirm('确定要删除这条记录吗？')) {
                    onDelete(entry.id)
                  }
                }}
                title="删除记录"
              >
                🗑️
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
