import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { saveOnboardingData } from '../../services/firestoreService'
import {
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
  FOOD_PREFERENCES,
  WORKOUT_LOCATIONS,
  WORKOUT_EXPERIENCE,
} from '../../constants/theme'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

const TOTAL_STEPS = 9

const OptionGrid = ({ options, value, onChange, columns = 2 }) => (
  <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`rounded-xl2 border px-4 py-4 text-left transition-colors ${
          value === opt.value ? 'border-accent bg-accent/10' : 'border-white/10 hover:border-white/20'
        }`}
      >
        <p className="font-medium">{opt.label}</p>
        {opt.desc && <p className="mt-0.5 text-xs text-ink-faint">{opt.desc}</p>}
      </button>
    ))}
  </div>
)

const Onboarding = () => {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    gender: '',
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    bodyFat: '',
    activityLevel: '',
    workoutExperience: '',
    workoutLocation: '',
    foodPreference: '',
    medicalConditions: '',
    waterIntake: '2.5',
    sleepHours: '7',
    fitnessGoal: '',
  })

  const set = (key, value) => setData((d) => ({ ...d, [key]: value }))

  const canContinue = () => {
    switch (step) {
      case 0: return !!data.gender
      case 1: return !!data.age
      case 2: return !!data.height && !!data.weight
      case 3: return !!data.targetWeight
      case 4: return !!data.activityLevel
      case 5: return !!data.workoutExperience && !!data.workoutLocation
      case 6: return !!data.foodPreference
      case 7: return true
      case 8: return !!data.fitnessGoal
      default: return true
    }
  }

  const finish = async () => {
    setSaving(true)
    try {
      await saveOnboardingData(user.uid, {
        ...data,
        age: Number(data.age),
        height: Number(data.height),
        weight: Number(data.weight),
        targetWeight: Number(data.targetWeight),
        bodyFat: data.bodyFat ? Number(data.bodyFat) : null,
        waterIntake: Number(data.waterIntake),
        sleepHours: Number(data.sleepHours),
      })
      await refreshProfile()
      toast.success("You're all set!")
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error('Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const next = () => {
    if (step === TOTAL_STEPS - 1) {
      finish()
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg bg-vein-radial px-4 py-8">
      <div className="mx-auto w-full max-w-lg flex-1">
        <div className="mb-8 flex items-center gap-2">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="rounded-full p-2 hover:bg-white/5">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex flex-1 gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div>
                <h2 className="mb-1 font-display text-2xl font-bold">Tell us about yourself</h2>
                <p className="mb-6 text-sm text-ink-muted">This helps us personalize your plan.</p>
                <OptionGrid
                  options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
                  value={data.gender}
                  onChange={(v) => set('gender', v)}
                  columns={3}
                />
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="mb-1 font-display text-2xl font-bold">How old are you?</h2>
                <p className="mb-6 text-sm text-ink-muted">Age helps us calibrate your calorie needs.</p>
                <Input type="number" placeholder="Age" value={data.age} onChange={(e) => set('age', e.target.value)} />
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-1 font-display text-2xl font-bold">Your measurements</h2>
                <p className="mb-6 text-sm text-ink-muted">We'll use this for your BMI and calorie targets.</p>
                <div className="space-y-4">
                  <Input type="number" label="Height (cm)" placeholder="175" value={data.height} onChange={(e) => set('height', e.target.value)} />
                  <Input type="number" label="Current weight (kg)" placeholder="70" value={data.weight} onChange={(e) => set('weight', e.target.value)} />
                  <Input type="number" label="Body fat % (optional)" placeholder="18" value={data.bodyFat} onChange={(e) => set('bodyFat', e.target.value)} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="mb-1 font-display text-2xl font-bold">What's your target weight?</h2>
                <p className="mb-6 text-sm text-ink-muted">We'll track your progress toward this goal.</p>
                <Input type="number" placeholder="65" value={data.targetWeight} onChange={(e) => set('targetWeight', e.target.value)} />
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="mb-1 font-display text-2xl font-bold">Physical activity level?</h2>
                <p className="mb-6 text-sm text-ink-muted">Be honest — this shapes your calorie target.</p>
                <OptionGrid options={ACTIVITY_LEVELS} value={data.activityLevel} onChange={(v) => set('activityLevel', v)} columns={1} />
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="mb-1 font-display text-2xl font-bold">Your training setup</h2>
                <p className="mb-6 text-sm text-ink-muted">Experience level and where you train.</p>
                <p className="mb-2 text-sm font-medium text-ink-muted">Experience</p>
                <OptionGrid options={WORKOUT_EXPERIENCE} value={data.workoutExperience} onChange={(v) => set('workoutExperience', v)} columns={3} />
                <p className="mb-2 mt-5 text-sm font-medium text-ink-muted">Location</p>
                <OptionGrid options={WORKOUT_LOCATIONS} value={data.workoutLocation} onChange={(v) => set('workoutLocation', v)} columns={2} />
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 className="mb-1 font-display text-2xl font-bold">Food preference</h2>
                <p className="mb-6 text-sm text-ink-muted">We'll tailor meal suggestions to this.</p>
                <OptionGrid options={FOOD_PREFERENCES} value={data.foodPreference} onChange={(v) => set('foodPreference', v)} columns={1} />
              </div>
            )}

            {step === 7 && (
              <div>
                <h2 className="mb-1 font-display text-2xl font-bold">A few last details</h2>
                <p className="mb-6 text-sm text-ink-muted">Medical conditions, hydration, and sleep.</p>
                <div className="space-y-4">
                  <Input
                    label="Medical conditions (optional)"
                    placeholder="e.g. asthma, knee injury"
                    value={data.medicalConditions}
                    onChange={(e) => set('medicalConditions', e.target.value)}
                  />
                  <Input type="number" step="0.1" label="Daily water intake (liters)" value={data.waterIntake} onChange={(e) => set('waterIntake', e.target.value)} />
                  <Input type="number" label="Average sleep hours" value={data.sleepHours} onChange={(e) => set('sleepHours', e.target.value)} />
                </div>
              </div>
            )}

            {step === 8 && (
              <div>
                <h2 className="mb-1 font-display text-2xl font-bold">What's your goal?</h2>
                <p className="mb-6 text-sm text-ink-muted">This drives your whole plan.</p>
                <OptionGrid options={FITNESS_GOALS} value={data.fitnessGoal} onChange={(v) => set('fitnessGoal', v)} columns={1} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-auto w-full max-w-lg pt-6">
        <Button onClick={next} disabled={!canContinue()} loading={saving} icon={step === TOTAL_STEPS - 1 ? Check : ChevronRight}>
          {step === TOTAL_STEPS - 1 ? 'Finish Setup' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}

export default Onboarding
