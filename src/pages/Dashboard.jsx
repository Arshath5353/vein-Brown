import { useEffect, useMemo, useState } from 'react'
import { Droplets, Footprints, Scale, Activity } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useLogCollection } from '../hooks/useFirestore'
import { getWorkoutHistory, computeStreak } from '../services/firestoreService'
import { calculateBMR, calculateTDEE, calculateGoalCalories, calculateMacros, calculateBMI, getBMICategory } from '../utils/calculations'
import { last7Days, todayISO } from '../utils/dateHelpers'
import WelcomeCard from '../components/dashboard/WelcomeCard.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import MacroRings from '../components/dashboard/MacroRings.jsx'
import WeeklyChart from '../components/dashboard/WeeklyChart.jsx'
import AISuggestion from '../components/ai/AISuggestion.jsx'

const Dashboard = () => {
  const { profile } = useAuth()
  const { logs: waterLogs } = useLogCollection('waterLogs')
  const { logs: weightLogs } = useLogCollection('weightLogs')
  const { logs: stepLogs } = useLogCollection('stepLogs')
  const { logs: mealLogs } = useLogCollection('mealLogs')
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const loadStreak = async () => {
      if (!profile) return
      const history = await getWorkoutHistory(profile.uid, 60)
      setStreak(computeStreak(history))
    }
    loadStreak()
  }, [profile])

  const targets = useMemo(() => {
    if (!profile?.weight || !profile?.height || !profile?.age) return null
    const bmr = calculateBMR({
      weightKg: profile.weight,
      heightCm: profile.height,
      age: profile.age,
      gender: profile.gender,
    })
    const tdee = calculateTDEE(bmr, profile.activityLevel)
    const goalCalories = calculateGoalCalories(tdee)
    const calorieTarget =
      profile.fitnessGoal === 'lose' ? goalCalories.lose : profile.fitnessGoal === 'gain' ? goalCalories.gain : tdee
    const macros = calculateMacros(calorieTarget, profile.fitnessGoal, profile.weight)
    const bmi = calculateBMI(profile.weight, profile.height)
    return { bmr, tdee, calorieTarget, macros, bmi, bmiCategory: getBMICategory(bmi) }
  }, [profile])

  const todayMeals = mealLogs.filter((m) => m.date === todayISO())
  const caloriesToday = todayMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0)
  const proteinToday = todayMeals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0)
  const carbsToday = todayMeals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0)
  const fatToday = todayMeals.reduce((sum, m) => sum + (Number(m.fat) || 0), 0)

  const waterToday = waterLogs
    .filter((w) => w.date === todayISO())
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0)

  const stepsToday = stepLogs
    .filter((s) => s.date === todayISO())
    .reduce((sum, s) => sum + (Number(s.count) || 0), 0)

  const latestWeight = weightLogs[0]?.weight || profile?.weight

  const weekDays = last7Days()
  const weightChartData = weekDays.map(({ iso, label }) => {
    const entry = weightLogs.find((w) => w.date === iso)
    return { label, weight: entry ? Number(entry.weight) : null }
  })
  const stepsChartData = weekDays.map(({ iso, label }) => {
    const total = stepLogs.filter((s) => s.date === iso).reduce((sum, s) => sum + Number(s.count || 0), 0)
    return { label, steps: total }
  })

  return (
    <div className="page-shell">
      <WelcomeCard streak={streak} />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Droplets} label="Water" value={waterToday.toFixed(1)} unit="L" accent="#5BA3FF" />
        <StatCard icon={Footprints} label="Steps" value={stepsToday.toLocaleString()} unit="" accent="#5BFF9C" />
        <StatCard icon={Scale} label="Weight" value={latestWeight ?? '—'} unit="kg" accent="#9C5BFF" />
        <StatCard icon={Activity} label="BMI" value={targets?.bmi ?? '—'} unit={targets?.bmiCategory?.label ?? ''} accent="#4B2EFF" />
      </div>

      {targets && (
        <div className="mt-6">
          <MacroRings
            calories={{ value: caloriesToday, goal: targets.calorieTarget }}
            protein={{ value: proteinToday, goal: targets.macros.protein }}
            carbs={{ value: carbsToday, goal: targets.macros.carbs }}
            fat={{ value: fatToday, goal: targets.macros.fat }}
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <WeeklyChart title="Weight Trend (7 days)" data={weightChartData} dataKey="weight" color="#9C5BFF" unit="kg" />
        <WeeklyChart title="Steps (7 days)" data={stepsChartData} dataKey="steps" color="#5BFF9C" unit="" />
      </div>

      <AISuggestion summary={{ caloriesToday, proteinToday, waterToday, stepsToday, calorieTarget: targets?.calorieTarget, proteinTarget: targets?.macros?.protein, bmi: targets?.bmi }} />
    </div>
  )
}

export default Dashboard
