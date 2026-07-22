import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Download } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getDailyRecords } from '../services/dailyJournalService'
import { chartData, createAnalytics, recordsForRange } from '../services/analyticsService'
import Card from '../components/ui/Card.jsx'
import WeeklyChart from '../components/dashboard/WeeklyChart.jsx'
import Button from '../components/ui/Button.jsx'

const isoDaysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

const Statistics = () => {
  const { user } = useAuth()
  const [records, setRecords] = useState({})
  const [range, setRange] = useState(30)
  useEffect(() => { if (user?.uid) getDailyRecords(user.uid).then(setRecords) }, [user?.uid])
  const selected = useMemo(() => recordsForRange(records, isoDaysAgo(range - 1), new Date().toISOString().slice(0, 10)), [records, range])
  const analytics = useMemo(() => createAnalytics(selected), [selected])
  const data = useMemo(() => chartData(selected), [selected])
  const cards = [['Avg calories', analytics.averageCalories], ['Avg protein', `${analytics.averageProtein}g`], ['Avg water', `${analytics.averageWater}L`], ['Workouts', analytics.workoutCount], ['Total steps', analytics.totalSteps.toLocaleString()], ['Consistency', `${analytics.consistencyScore}%`]]
  return <div className="page-shell"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-display text-2xl font-bold">Statistics</h1><p className="mt-1 text-sm text-ink-muted">Your local progress, kept on this device.</p></div><Button className="w-auto px-4" variant="secondary" icon={Download} onClick={() => window.print()}>Export PDF</Button></div>
    <div className="mt-5 flex gap-2">{[7, 30, 365].map((days) => <button key={days} onClick={() => setRange(days)} className={`rounded-full border px-4 py-2 text-sm ${range === days ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-ink-muted'}`}>{days === 365 ? 'Year' : `${days} days`}</button>)}</div>
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">{cards.map(([label, value]) => <Card key={label} className="!p-4"><p className="text-xs text-ink-faint">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></Card>)}</div>
    {!data.length ? <Card className="mt-6 text-center text-sm text-ink-muted"><BarChart3 className="mx-auto mb-2 h-7 w-7 text-accent" />Start tracking to see your charts.</Card> : <div className="mt-6 grid gap-4 md:grid-cols-2"><WeeklyChart title="Weight trend" data={data} dataKey="weight" color="#9C5BFF" unit="kg" /><WeeklyChart title="Daily steps" data={data} dataKey="steps" color="#5BFF9C" /><WeeklyChart title="Calories consumed" data={data} dataKey="calories" color="#FF9F5B" unit=" kcal" /><WeeklyChart title="Water intake" data={data} dataKey="water" color="#5BA3FF" unit="L" /><WeeklyChart title="Protein" data={data} dataKey="protein" color="#D75BFF" unit="g" /><WeeklyChart title="Workout count" data={data} dataKey="workouts" color="#4B2EFF" /></div>}
  </div>
}
export default Statistics
