const numeric = (value) => Number(value || 0)
const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

export const recordsForRange = (records, start, end) => Object.values(records || {}).filter((record) => record.date >= start && record.date <= end).sort((a, b) => a.date.localeCompare(b.date))

export const createAnalytics = (records) => {
  const values = records || []
  const workouts = values.reduce((sum, record) => sum + record.workoutHistory.length, 0)
  const dates = new Set(values.filter((record) => record.meals.length || record.steps || record.waterIntake || record.workoutHistory.length).map((record) => record.date))
  const calorieBurned = values.reduce((sum, record) => sum + numeric(record.activeCalories), 0)
  const calories = values.reduce((sum, record) => sum + numeric(record.calories), 0)
  const completeWater = values.filter((record) => numeric(record.waterIntake) >= 3).length
  return {
    averageCalories: Math.round(average(values.map((record) => numeric(record.calories)))), averageProtein: Math.round(average(values.map((record) => numeric(record.protein)))), averageWater: Number(average(values.map((record) => numeric(record.waterIntake))).toFixed(1)), averageWeight: Number(average(values.filter((record) => record.weight).map((record) => numeric(record.weight))).toFixed(1)), weightChange: values.length > 1 ? Number((numeric(values.at(-1).weight) - numeric(values[0].weight)).toFixed(1)) : 0, bmiChange: values.length > 1 ? Number((numeric(values.at(-1).bmi) - numeric(values[0].bmi)).toFixed(1)) : 0, workoutCount: workouts, workoutTime: values.reduce((sum, record) => sum + numeric(record.workoutDuration), 0), totalSteps: values.reduce((sum, record) => sum + numeric(record.steps), 0), averageSleep: Number(average(values.map((record) => numeric(record.sleepDuration))).toFixed(1)), caloriesConsumed: calories, caloriesBurned: calorieBurned, waterGoalPercent: values.length ? Math.round((completeWater / values.length) * 100) : 0, consistencyScore: values.length ? Math.round((dates.size / values.length) * 100) : 0,
  }
}

export const chartData = (records) => records.map((record) => ({ label: new Date(`${record.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), weight: record.weight, bmi: record.bmi, calories: record.calories, protein: record.protein, water: record.waterIntake, steps: record.steps, workouts: record.workoutHistory.length }))
