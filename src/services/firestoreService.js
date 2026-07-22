import { readLocalData, writeLocalData } from './localDataService'
import { applyLogToDailyRecord, ensureTodayRecord, rebuildDailyRecords } from './dailyJournalService'

/* ---------------------------------- users --------------------------------- */

export const saveOnboardingData = async (uid, data) => {
  const current = await readLocalData(uid, 'profile', {})
  await writeLocalData(uid, 'profile', { ...current, ...data, onboardingComplete: true, updatedAt: Date.now() })
}

export const updateUserProfile = async (uid, data) => {
  const current = await readLocalData(uid, 'profile', {})
  await writeLocalData(uid, 'profile', { ...current, ...data, updatedAt: Date.now() })
}

/* ------------------------------ generic logs ------------------------------ */

const todayKey = (date = new Date()) => date.toISOString().slice(0, 10)

/**
 * Adds a dated log entry to a user's sub-collection (waterLogs, weightLogs, stepLogs, mealLogs).
 */
export const addLog = async (uid, collectionName, payload) => {
  const logs = await readLocalData(uid, collectionName, [])
  const id = crypto.randomUUID()
  const log = { ...payload, id, date: payload.date || todayKey(), createdAt: Date.now() }
  await writeLocalData(uid, collectionName, [log, ...logs])
  await applyLogToDailyRecord(uid, collectionName, log)
  return id
}

export const getLogs = async (uid, collectionName, days = 30) => {
  const logs = await readLocalData(uid, collectionName, [])
  return logs.sort((a, b) => b.createdAt - a.createdAt).slice(0, days)
}

export const deleteLog = async (uid, collectionName, logId) => {
  const logs = await readLocalData(uid, collectionName, [])
  await writeLocalData(uid, collectionName, logs.filter((log) => log.id !== logId))
  const collections = ['mealLogs', 'waterLogs', 'stepLogs', 'weightLogs', 'workouts']
  const sources = await Promise.all(collections.map((name) => readLocalData(uid, name, [])))
  await rebuildDailyRecords(uid, Object.fromEntries(collections.map((name, index) => [name, name === collectionName ? logs.filter((log) => log.id !== logId) : sources[index]])))
}

export const updateLog = async (uid, collectionName, logId, changes) => {
  const logs = await readLocalData(uid, collectionName, [])
  await writeLocalData(uid, collectionName, logs.map((log) => log.id === logId ? { ...log, ...changes, updatedAt: Date.now() } : log))
}

/* ---------------------------- meal categories ---------------------------- */

const DEFAULT_MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((name) => ({
  id: name.toLowerCase(), name, collapsed: false,
}))

export const getMealCategories = async (uid) => {
  const categories = await readLocalData(uid, 'mealCategories', null)
  return categories?.length ? categories : DEFAULT_MEAL_CATEGORIES
}

export const saveMealCategories = (uid, categories) => writeLocalData(uid, 'mealCategories', categories)

export const getTodayLogs = async (uid, collectionName) => {
  const logs = await readLocalData(uid, collectionName, [])
  return logs.filter((log) => log.date === todayKey())
}

export const initializeUserJournal = (uid) => ensureTodayRecord(uid)

/* -------------------------------- workouts -------------------------------- */

export const logWorkout = async (uid, workoutData) => addLog(uid, 'workouts', workoutData)

export const getWorkoutHistory = async (uid, days = 30) => getLogs(uid, 'workouts', days)

/* -------------------------------- goals ------------------------------------ */

export const setUserGoal = async (uid, goalData) => {
  await writeLocalData(uid, 'goal', { ...goalData, updatedAt: Date.now() })
}

export const getUserGoal = async (uid) => {
  return readLocalData(uid, 'goal')
}

/* ------------------------------ diet plans --------------------------------- */

export const saveDietPlan = async (uid, plan) => {
  return addLog(uid, 'dietPlans', plan)
}

export const getLatestDietPlan = async (uid) => {
  const [latest] = await getLogs(uid, 'dietPlans', 1)
  return latest || null
}

/* --------------------------------- streaks --------------------------------- */

export const computeStreak = (workoutLogs) => {
  if (!workoutLogs?.length) return 0
  const dates = new Set(workoutLogs.map((w) => w.date))
  let streak = 0
  const cursor = new Date()
  while (dates.has(todayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
