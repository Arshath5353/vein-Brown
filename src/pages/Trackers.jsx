import { useState } from 'react'
import { Droplets, Scale, Footprints, Plus, Trash2 } from 'lucide-react'
import { useLogCollection } from '../hooks/useFirestore'
import { last7Days, todayISO, formatFriendlyDate } from '../utils/dateHelpers'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import WeeklyChart from '../components/dashboard/WeeklyChart.jsx'

const TABS = [
  { key: 'water', label: 'Water', icon: Droplets },
  { key: 'weight', label: 'Weight', icon: Scale },
  { key: 'steps', label: 'Steps', icon: Footprints },
]

const Trackers = () => {
  const [tab, setTab] = useState('water')

  return (
    <div className="page-shell">
      <h1 className="font-display text-2xl font-bold">Trackers</h1>
      <p className="mt-1 text-sm text-ink-muted">Log daily habits and watch the trend.</p>

      <div className="mt-5 flex gap-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
              tab === key ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-ink-muted'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'water' && <WaterTab />}
        {tab === 'weight' && <WeightTab />}
        {tab === 'steps' && <StepsTab />}
      </div>
    </div>
  )
}

const WaterTab = () => {
  const { logs, add, remove } = useLogCollection('waterLogs')
  const dailyGoal = 3.0
  const todayTotal = logs.filter((l) => l.date === todayISO()).reduce((s, l) => s + Number(l.amount || 0), 0)
  const pct = Math.min(100, Math.round((todayTotal / dailyGoal) * 100))

  const weekData = last7Days().map(({ iso, label }) => ({
    label,
    amount: logs.filter((l) => l.date === iso).reduce((s, l) => s + Number(l.amount || 0), 0),
  }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <p className="text-sm text-ink-muted">Today's intake</p>
        <p className="text-3xl font-bold text-blue-400">{todayTotal.toFixed(1)}L <span className="text-sm text-ink-faint">/ {dailyGoal}L goal</span></p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-blue-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-5 flex gap-2">
          {[0.25, 0.5, 0.75, 1].map((amt) => (
            <Button key={amt} variant="secondary" className="w-auto px-4" icon={Plus} onClick={() => add({ amount: amt })}>
              {amt}L
            </Button>
          ))}
        </div>
      </Card>
      <WeeklyChart title="Weekly Water Intake" data={weekData} dataKey="amount" color="#5BA3FF" unit="L" />
      <LogList logs={logs.filter((l) => l.date === todayISO())} onDelete={remove} render={(l) => `${l.amount}L`} icon={Droplets} />
    </div>
  )
}

const WeightTab = () => {
  const { logs, add, remove } = useLogCollection('weightLogs')
  const [form, setForm] = useState({ weight: '', bodyFat: '', muscleMass: '' })

  const weekData = last7Days().map(({ iso, label }) => {
    const entry = logs.find((l) => l.date === iso)
    return { label, weight: entry ? Number(entry.weight) : null }
  })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <p className="mb-3 text-sm font-semibold text-ink-muted">Log today's weight</p>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Weight (kg)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          <Input type="number" placeholder="Body fat %" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} />
          <Input type="number" placeholder="Muscle mass kg" value={form.muscleMass} onChange={(e) => setForm({ ...form, muscleMass: e.target.value })} />
          <Button
            className="w-auto px-5"
            icon={Plus}
            onClick={() => {
              if (!form.weight) return
              add({ weight: Number(form.weight), bodyFat: Number(form.bodyFat) || null, muscleMass: Number(form.muscleMass) || null })
              setForm({ weight: '', bodyFat: '', muscleMass: '' })
            }}
          >
            Add
          </Button>
        </div>
      </Card>
      <WeeklyChart title="Weight Trend" data={weekData} dataKey="weight" color="#9C5BFF" unit="kg" />
      <LogList logs={logs} onDelete={remove} render={(l) => `${l.weight} kg`} icon={Scale} />
    </div>
  )
}

const StepsTab = () => {
  const { logs, add, remove } = useLogCollection('stepLogs')
  const [form, setForm] = useState({ count: '', distance: '', calories: '' })
  const todayTotal = logs.filter((l) => l.date === todayISO()).reduce((s, l) => s + Number(l.count || 0), 0)

  const weekData = last7Days().map(({ iso, label }) => ({
    label,
    steps: logs.filter((l) => l.date === iso).reduce((s, l) => s + Number(l.count || 0), 0),
  }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <p className="text-sm text-ink-muted">Today's steps</p>
        <p className="text-3xl font-bold text-green-400">{todayTotal.toLocaleString()}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Steps" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} />
          <Input type="number" placeholder="Distance (km)" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} />
          <Input type="number" placeholder="Active calories" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
          <Button
            className="w-auto px-5"
            icon={Plus}
            onClick={() => {
              if (!form.count) return
              add({ count: Number(form.count), distance: Number(form.distance) || 0, calories: Number(form.calories) || 0 })
              setForm({ count: '', distance: '', calories: '' })
            }}
          >
            Add
          </Button>
        </div>
      </Card>
      <WeeklyChart title="Weekly Steps" data={weekData} dataKey="steps" color="#5BFF9C" unit="" />
      <LogList logs={logs.filter((l) => l.date === todayISO())} onDelete={remove} render={(l) => `${Number(l.count).toLocaleString()} steps`} icon={Footprints} />
    </div>
  )
}

const LogList = ({ logs, onDelete, render, icon: Icon }) => (
  <Card className="md:col-span-2">
    <p className="mb-3 text-sm font-semibold text-ink-muted">Recent entries</p>
    {logs.length === 0 ? (
      <EmptyState icon={Icon} title="No entries yet" description="Log your first entry above." />
    ) : (
      <ul className="divide-y divide-white/5">
        {logs.map((l) => (
          <li key={l.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-ink-faint" />
              <div>
                <p className="text-sm font-medium">{render(l)}</p>
                <p className="text-xs text-ink-faint">{formatFriendlyDate(l.date)}</p>
              </div>
            </div>
            <button onClick={() => onDelete(l.id)} className="rounded-full p-2 text-ink-faint hover:bg-white/5 hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </Card>
)

export default Trackers
