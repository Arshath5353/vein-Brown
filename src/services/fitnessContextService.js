import { getLogs, getWorkoutHistory, getUserGoal } from './firestoreService'
import { calculateBMI } from '../utils/calculations'

export const createFitnessContext = async (uid, profile, today = {}) => {
  if (!uid) return ''
  const [meals, water, steps, workouts, sleep, exerciseHistory, goal] = await Promise.all([
    getLogs(uid, 'mealLogs', 7), getLogs(uid, 'waterLogs', 7), getLogs(uid, 'stepLogs', 7), getWorkoutHistory(uid, 7), getLogs(uid, 'sleepLogs', 7), getLogs(uid, 'exerciseLogs', 14), getUserGoal(uid),
  ])
  return JSON.stringify({ profile: { age: profile?.age, gender: profile?.gender, heightCm: profile?.height, weightKg: profile?.weight, bmi: calculateBMI(profile?.weight, profile?.height), goal: profile?.fitnessGoal, activityLevel: profile?.activityLevel, sleepHours: profile?.sleepHours, preferences: profile?.foodPreference, medicalNotes: profile?.medicalNotes }, goal, today, recentMeals: meals, recentWater: water, recentSteps: steps, recentSleep: sleep, exerciseHistory, recentWorkouts: workouts })
}
