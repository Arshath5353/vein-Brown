import { readLocalData, writeLocalData } from './localDataService'

const dateKey = (date = new Date()) => date.toISOString().slice(0, 10)
const defaultRecord = (date) => ({
  date, calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0,
  waterIntake: 0, weight: null, bmi: null, bodyFat: null, muscleMass: null,
  waist: null, chest: null, arms: null, legs: null, steps: 0, distance: 0,
  activeCalories: 0, workoutDuration: 0, workoutHistory: [], meals: [], mood: '',
  sleepDuration: 0, energyLevel: '', notes: '', updatedAt: Date.now(),
})

export const getDailyRecords = (uid) => readLocalData(uid, 'daily-records', {})

export const getDailyRecord = async (uid, date = dateKey()) => {
  const records = await getDailyRecords(uid)
  if (records[date]) return records[date]
  const record = defaultRecord(date)
  await writeLocalData(uid, 'daily-records', { ...records, [date]: record })
  return record
}

export const patchDailyRecord = async (uid, date, patch) => {
  const records = await getDailyRecords(uid)
  const next = { ...(records[date] || defaultRecord(date)), ...patch, date, updatedAt: Date.now() }
  await writeLocalData(uid, 'daily-records', { ...records, [date]: next })
  return next
}

export const ensureTodayRecord = (uid) => getDailyRecord(uid, dateKey())

export const applyLogToDailyRecord = async (uid, collection, log) => {
  const date = log.date || dateKey()
  const record = await getDailyRecord(uid, date)
  const patch = {}
  if (collection === 'mealLogs') {
    patch.meals = [log, ...record.meals.filter((meal) => meal.id !== log.id)]
    ;['calories', 'protein', 'fat', 'fiber', 'sugar'].forEach((key) => { patch[key] = record[key] + Number(log[key] || 0) })
    patch.carbohydrates = record.carbohydrates + Number(log.carbs || 0)
  }
  if (collection === 'waterLogs') patch.waterIntake = record.waterIntake + Number(log.amount || 0)
  if (collection === 'stepLogs') {
    patch.steps = record.steps + Number(log.count || 0)
    patch.distance = record.distance + Number(log.distance || 0)
    patch.activeCalories = record.activeCalories + Number(log.calories || 0)
  }
  if (collection === 'weightLogs') Object.assign(patch, { weight: Number(log.weight || 0), bmi: log.bmi ?? record.bmi, bodyFat: log.bodyFat ?? record.bodyFat, muscleMass: log.muscleMass ?? record.muscleMass })
  if (collection === 'workouts') Object.assign(patch, { workoutHistory: [log, ...record.workoutHistory.filter((workout) => workout.id !== log.id)], workoutDuration: record.workoutDuration + Number(log.duration || 0), activeCalories: record.activeCalories + Number(log.caloriesBurned || 0) })
  return patchDailyRecord(uid, date, patch)
}

export const rebuildDailyRecords = async (uid, logsByCollection) => {
  const records = {}
  Object.entries(logsByCollection).forEach(([collection, logs]) => logs.forEach((log) => {
    const date = log.date || dateKey()
    const record = records[date] || defaultRecord(date)
    records[date] = record
    if (collection === 'mealLogs') { record.meals.push(log); record.calories += Number(log.calories || 0); record.protein += Number(log.protein || 0); record.carbohydrates += Number(log.carbs || 0); record.fat += Number(log.fat || 0); record.fiber += Number(log.fiber || 0); record.sugar += Number(log.sugar || 0) }
    if (collection === 'waterLogs') record.waterIntake += Number(log.amount || 0)
    if (collection === 'stepLogs') { record.steps += Number(log.count || 0); record.distance += Number(log.distance || 0); record.activeCalories += Number(log.calories || 0) }
    if (collection === 'weightLogs') Object.assign(record, { weight: Number(log.weight || 0), bmi: log.bmi ?? record.bmi, bodyFat: log.bodyFat ?? record.bodyFat, muscleMass: log.muscleMass ?? record.muscleMass })
    if (collection === 'workouts') { record.workoutHistory.push(log); record.workoutDuration += Number(log.duration || 0); record.activeCalories += Number(log.caloriesBurned || 0) }
  }))
  await writeLocalData(uid, 'daily-records', records)
  return records
}
