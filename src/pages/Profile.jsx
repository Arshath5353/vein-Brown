import { useRef, useState } from 'react'
import { Camera, Award, Flame, Target, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { updateUserProfile } from '../services/firestoreService'
import { calculateBMI } from '../utils/calculations'
import { FITNESS_GOALS } from '../constants/theme'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

const BADGES = [
  { id: 'first-workout', label: 'First Workout', icon: Flame },
  { id: 'streak-7', label: '7-Day Streak', icon: Award },
  { id: 'goal-set', label: 'Goal Setter', icon: Target },
]

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth()
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: profile?.name || '',
    weight: profile?.weight || '',
    targetWeight: profile?.targetWeight || '',
    fitnessGoal: profile?.fitnessGoal || 'maintain',
  })

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const url = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      await updateUserProfile(user.uid, { photoURL: url })
      await refreshProfile()
      toast.success('Profile photo saved on this device!')
    } catch (err) {
      toast.error('Could not upload photo.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        name: form.name,
        weight: Number(form.weight),
        targetWeight: Number(form.targetWeight),
        fitnessGoal: form.fitnessGoal,
      })
      await refreshProfile()
      toast.success('Profile updated!')
    } catch (err) {
      toast.error('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  const bmi = profile?.weight && profile?.height ? calculateBMI(profile.weight, profile.height) : null
  const progressPct =
    profile?.weight && profile?.targetWeight
      ? Math.min(100, Math.max(0, Math.round(100 - (Math.abs(profile.weight - profile.targetWeight) / (profile.weight || 1)) * 100)))
      : 0

  return (
    <div className="page-shell">
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      <Card className="mt-5 flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-vein-gradient text-3xl font-bold">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              (profile?.name || 'A')[0]
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg bg-card"
            disabled={uploading}
          >
            <Camera className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <div>
          <p className="text-lg font-bold">{profile?.name}</p>
          <p className="text-sm text-ink-faint">{profile?.email}</p>
        </div>
      </Card>

      <Card className="mt-5">
        <p className="mb-3 text-sm font-semibold text-ink-muted">Goal Progress</p>
        <div className="flex items-center justify-between text-sm">
          <span>{profile?.weight ?? '—'} kg</span>
          <span className="text-ink-faint">Target: {profile?.targetWeight ?? '—'} kg</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-vein-gradient" style={{ width: `${progressPct}%` }} />
        </div>
        {bmi && <p className="mt-3 text-xs text-ink-faint">Current BMI: {bmi}</p>}
      </Card>

      <Card className="mt-5">
        <p className="mb-3 text-sm font-semibold text-ink-muted">Achievements</p>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map(({ id, label, icon: Icon }) => (
            <div key={id} className="flex flex-col items-center gap-2 rounded-xl2 border border-white/5 p-3 text-center">
              <Icon className="h-6 w-6 text-accent" />
              <span className="text-[11px] text-ink-muted">{label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-5 space-y-4">
        <p className="text-sm font-semibold text-ink-muted">Edit details</p>
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input type="number" label="Current weight (kg)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
        <Input type="number" label="Target weight (kg)" value={form.targetWeight} onChange={(e) => setForm({ ...form, targetWeight: e.target.value })} />
        <label className="block text-sm font-medium text-ink-muted">Fitness goal</label>
        <select value={form.fitnessGoal} onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })} className="input-field">
          {FITNESS_GOALS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <Button icon={Save} onClick={handleSave} loading={saving}>Save Changes</Button>
      </Card>
    </div>
  )
}

export default Profile
