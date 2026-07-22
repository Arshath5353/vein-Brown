import { useState } from 'react'
import {
  calculateBMI,
  getBMICategory,
  getHealthyWeightRange,
  bmiSuggestions,
  calculateBMR,
  calculateTDEE,
  calculateGoalCalories,
  calculateMacros,
  calculateBodyFat,
} from '../utils/calculations'
import { useAuth } from '../hooks/useAuth'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

const TABS = ['BMI', 'BMR & TDEE', 'Macros', 'Body Fat']

const Calculators = () => {
  const { profile } = useAuth()
  const [tab, setTab] = useState('BMI')

  return (
    <div className="page-shell">
      <h1 className="font-display text-2xl font-bold">Calculators</h1>
      <p className="mt-1 text-sm text-ink-muted">Know your numbers, train with purpose.</p>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
              tab === t ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-ink-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'BMI' && <BMICalc profile={profile} />}
        {tab === 'BMR & TDEE' && <BMRCalc profile={profile} />}
        {tab === 'Macros' && <MacroCalc profile={profile} />}
        {tab === 'Body Fat' && <BodyFatCalc profile={profile} />}
      </div>
    </div>
  )
}

const BMICalc = ({ profile }) => {
  const [form, setForm] = useState({
    height: profile?.height || '',
    weight: profile?.weight || '',
    age: profile?.age || '',
    gender: profile?.gender || 'male',
  })
  const [result, setResult] = useState(null)

  const calculate = () => {
    if (!form.height || !form.weight) return
    const bmi = calculateBMI(Number(form.weight), Number(form.height))
    const category = getBMICategory(bmi)
    const range = getHealthyWeightRange(Number(form.height))
    setResult({ bmi, category, range, suggestions: bmiSuggestions(category.label) })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="space-y-4">
        <Input type="number" label="Height (cm)" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
        <Input type="number" label="Weight (kg)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
        <Input type="number" label="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        <div className="flex gap-2">
          {['male', 'female'].map((g) => (
            <button
              key={g}
              onClick={() => setForm({ ...form, gender: g })}
              className={`flex-1 rounded-xl2 border px-4 py-3 text-sm capitalize ${
                form.gender === g ? 'border-accent bg-accent/10' : 'border-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <Button onClick={calculate}>Calculate BMI</Button>
      </Card>

      {result && (
        <Card>
          <p className="text-sm text-ink-muted">Your BMI</p>
          <p className="text-4xl font-bold" style={{ color: result.category.color }}>{result.bmi}</p>
          <p className="mt-1 font-semibold" style={{ color: result.category.color }}>{result.category.label}</p>
          <p className="mt-3 text-sm text-ink-muted">
            Healthy range for your height: {result.range.min}–{result.range.max} kg
          </p>
          <ul className="mt-4 space-y-2">
            {result.suggestions.map((s, i) => (
              <li key={i} className="text-sm text-ink-muted">• {s}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

const BMRCalc = ({ profile }) => {
  const [form, setForm] = useState({
    weight: profile?.weight || '',
    height: profile?.height || '',
    age: profile?.age || '',
    gender: profile?.gender || 'male',
    activityLevel: profile?.activityLevel || 'moderate',
  })
  const [result, setResult] = useState(null)

  const calculate = () => {
    if (!form.weight || !form.height || !form.age) return
    const bmr = calculateBMR({
      weightKg: Number(form.weight),
      heightCm: Number(form.height),
      age: Number(form.age),
      gender: form.gender,
    })
    const tdee = calculateTDEE(bmr, form.activityLevel)
    const goals = calculateGoalCalories(tdee)
    setResult({ bmr, tdee, goals })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="space-y-4">
        <Input type="number" label="Weight (kg)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
        <Input type="number" label="Height (cm)" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
        <Input type="number" label="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        <div className="flex gap-2">
          {['male', 'female'].map((g) => (
            <button
              key={g}
              onClick={() => setForm({ ...form, gender: g })}
              className={`flex-1 rounded-xl2 border px-4 py-3 text-sm capitalize ${
                form.gender === g ? 'border-accent bg-accent/10' : 'border-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <label className="block text-sm font-medium text-ink-muted">Activity level</label>
        <select
          value={form.activityLevel}
          onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
          className="input-field"
        >
          <option value="sedentary">Sedentary</option>
          <option value="light">Lightly Active</option>
          <option value="moderate">Moderately Active</option>
          <option value="active">Very Active</option>
          <option value="athlete">Athlete</option>
        </select>
        <Button onClick={calculate}>Calculate</Button>
      </Card>

      {result && (
        <Card className="space-y-4">
          <div>
            <p className="text-sm text-ink-muted">BMR (calories at rest)</p>
            <p className="text-3xl font-bold">{result.bmr} kcal</p>
          </div>
          <div>
            <p className="text-sm text-ink-muted">TDEE (maintenance calories)</p>
            <p className="text-3xl font-bold text-accent">{result.tdee} kcal</p>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div><p className="text-xs text-ink-faint">Lose</p><p className="font-semibold">{result.goals.lose}</p></div>
            <div><p className="text-xs text-ink-faint">Maintain</p><p className="font-semibold">{result.goals.maintain}</p></div>
            <div><p className="text-xs text-ink-faint">Gain</p><p className="font-semibold">{result.goals.gain}</p></div>
          </div>
        </Card>
      )}
    </div>
  )
}

const MacroCalc = ({ profile }) => {
  const [form, setForm] = useState({
    calories: '',
    goal: profile?.fitnessGoal || 'maintain',
    weight: profile?.weight || '',
  })
  const [result, setResult] = useState(null)

  const calculate = () => {
    if (!form.calories) return
    setResult(calculateMacros(Number(form.calories), form.goal, Number(form.weight) || 70))
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="space-y-4">
        <Input type="number" label="Daily calorie target" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
        <Input type="number" label="Weight (kg)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
        <label className="block text-sm font-medium text-ink-muted">Goal</label>
        <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="input-field">
          <option value="lose">Lose Fat</option>
          <option value="maintain">Maintain</option>
          <option value="gain">Build Muscle</option>
          <option value="athletic">Athletic</option>
        </select>
        <Button onClick={calculate}>Calculate Macros</Button>
      </Card>

      {result && (
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-ink-faint">Protein</p><p className="text-2xl font-bold text-accent">{result.protein}g</p></div>
            <div><p className="text-xs text-ink-faint">Carbs</p><p className="text-2xl font-bold text-primary-light">{result.carbs}g</p></div>
            <div><p className="text-xs text-ink-faint">Fat</p><p className="text-2xl font-bold text-yellow-400">{result.fat}g</p></div>
            <div><p className="text-xs text-ink-faint">Fiber</p><p className="text-2xl font-bold text-green-400">{result.fiber}g</p></div>
          </div>
          <p className="mt-4 text-sm text-ink-muted">Suggested water intake: {result.waterLiters}L/day</p>
        </Card>
      )}
    </div>
  )
}

const BodyFatCalc = ({ profile }) => {
  const [form, setForm] = useState({
    gender: profile?.gender || 'male',
    height: profile?.height || '',
    neck: '',
    waist: '',
    hip: '',
  })
  const [result, setResult] = useState(null)

  const calculate = () => {
    if (!form.height || !form.neck || !form.waist) return
    const bf = calculateBodyFat({
      gender: form.gender,
      heightCm: Number(form.height),
      neckCm: Number(form.neck),
      waistCm: Number(form.waist),
      hipCm: Number(form.hip),
    })
    setResult(bf)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="space-y-4">
        <p className="text-xs text-ink-faint">U.S. Navy body fat formula — measure in cm.</p>
        <div className="flex gap-2">
          {['male', 'female'].map((g) => (
            <button
              key={g}
              onClick={() => setForm({ ...form, gender: g })}
              className={`flex-1 rounded-xl2 border px-4 py-3 text-sm capitalize ${
                form.gender === g ? 'border-accent bg-accent/10' : 'border-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <Input type="number" label="Height (cm)" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
        <Input type="number" label="Neck (cm)" value={form.neck} onChange={(e) => setForm({ ...form, neck: e.target.value })} />
        <Input type="number" label="Waist (cm)" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
        {form.gender === 'female' && (
          <Input type="number" label="Hip (cm)" value={form.hip} onChange={(e) => setForm({ ...form, hip: e.target.value })} />
        )}
        <Button onClick={calculate}>Calculate Body Fat</Button>
      </Card>

      {result !== null && (
        <Card>
          <p className="text-sm text-ink-muted">Estimated body fat</p>
          <p className="text-4xl font-bold text-accent">{result}%</p>
        </Card>
      )}
    </div>
  )
}

export default Calculators
