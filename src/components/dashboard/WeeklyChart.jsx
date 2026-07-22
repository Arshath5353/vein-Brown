import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Card from '../ui/Card.jsx'

const WeeklyChart = ({ title, data, dataKey, color = '#4B2EFF', unit = '' }) => (
  <Card>
    <p className="mb-4 text-sm font-semibold text-ink-muted">{title}</p>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" vertical={false} />
        <XAxis dataKey="label" stroke="#6B6B6F" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#6B6B6F" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: '#121212', border: '1px solid #232323', borderRadius: 12 }}
          labelStyle={{ color: '#A0A0A0' }}
          formatter={(value) => [`${value}${unit}`, title]}
        />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#fill-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  </Card>
)

export default WeeklyChart
