import { WeightEntry } from '../types'
import { format, parseISO } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import './WeightChart.css'

interface WeightChartProps {
  entries: WeightEntry[]
}

export default function WeightChart({ entries }: WeightChartProps) {
  if (entries.length === 0) {
    return (
      <div className="weight-chart-card">
        <h2>📈 体重趋势</h2>
        <div className="empty-state">
          <p>记录更多数据后，这里会显示体重趋势图</p>
        </div>
      </div>
    )
  }

  // 按日期排序并格式化数据
  const chartData = [...entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: format(parseISO(entry.date), 'MM/dd'),
      weight: entry.weight,
      fullDate: entry.date,
    }))

  const latestWeight = entries[0]?.weight
  const oldestWeight = entries[entries.length - 1]?.weight
  const totalChange = latestWeight && oldestWeight ? latestWeight - oldestWeight : 0

  return (
    <div className="weight-chart-card">
      <h2>📈 体重趋势</h2>
      {totalChange !== 0 && (
        <div className="chart-summary">
          <span className={`summary-text ${totalChange < 0 ? 'positive' : 'negative'}`}>
            {totalChange < 0 ? '🎉' : '💪'} 
            累计 {totalChange < 0 ? '减' : '增'} {Math.abs(totalChange).toFixed(1)}kg
          </span>
        </div>
      )}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fontSize: 12 }}
              label={{ value: '体重 (kg)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} kg`, '体重']}
              labelFormatter={(label) => {
                const entry = chartData.find(d => d.date === label)
                return entry ? format(parseISO(entry.fullDate), 'yyyy年MM月dd日') : label
              }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ fill: '#8884d8', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
