import { GoogleGenAI } from '@google/genai'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash'

const COACH_SYSTEM_PROMPT = `You are the Vein Brown AI Fitness Coach: knowledgeable, encouraging, and direct. You help with workouts, nutrition, recovery, sleep, and healthy habits. Keep answers practical and concise. Never diagnose illness or replace a qualified clinician.`
const sanitize = (value, maxLength = 1200) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, maxLength)

export const getGeminiErrorMessage = (error) => {
  const message = error?.message || ''
  if (!navigator.onLine) return 'You are offline. Connect to the internet to use AI coaching.'
  if (message.includes('429')) return 'AI is busy right now. Please retry in a minute.'
  if (message.includes('401') || message.includes('403')) return 'AI service configuration needs attention. Please try again later.'
  console.error('Gemini AI request failed:', error)
  return 'Unable to contact AI Coach. Please try again later.'
}

const getClient = () => {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key is missing.')
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY })
}

async function callGemini(contents, systemInstruction = COACH_SYSTEM_PROMPT) {
  if (!navigator.onLine) throw new Error('Device is offline.')
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents,
    config: { systemInstruction, temperature: 0.7, maxOutputTokens: 1200 },
  })
  const text = response.text?.trim()
  if (!text) throw new Error('Gemini returned an empty response.')
  return text
}

export const askAICoach = async (history, userMessage, fitnessContext = '') => callGemini([
  ...history.slice(-12).map((message) => ({ role: message.role, parts: [{ text: sanitize(message.text, 800) }] })),
  { role: 'user', parts: [{ text: `Member context:\n${sanitize(fitnessContext, 5000)}\n\nQuestion: ${sanitize(userMessage, 1000)}` }] },
])

export const streamWithCoach = async (history, userMessage, fitnessContext = '', onChunk) => {
  if (!navigator.onLine) throw new Error('Device is offline.')
  const contents = [
    ...history.slice(-12).map((message) => ({ role: message.role, parts: [{ text: sanitize(message.text, 800) }] })),
    { role: 'user', parts: [{ text: `Member context:\n${sanitize(fitnessContext, 5000)}\n\nQuestion: ${sanitize(userMessage, 1000)}` }] },
  ]
  const stream = await getClient().models.generateContentStream({
    model: MODEL,
    contents,
    config: { systemInstruction: COACH_SYSTEM_PROMPT, temperature: 0.7, maxOutputTokens: 1200 },
  })
  let text = ''
  for await (const chunk of stream) {
    const part = chunk.text || ''
    text += part
    onChunk(text)
  }
  if (!text.trim()) throw new Error('Gemini returned an empty response.')
  return text
}

export const generateDailySuggestion = (fitnessContext) => callGemini([
  { role: 'user', parts: [{ text: `Using this member data, write a concise daily fitness briefing. Include motivation, workout, nutrition, hydration, recovery, and a safety warning only if appropriate. Use short bullets and no heading.\n\n${sanitize(fitnessContext, 5000)}` }] },
])

export const generateSuggestion = generateDailySuggestion

export const generateMealAdvice = (meal, fitnessContext = '') => callGemini([
  { role: 'user', parts: [{ text: `Give concise nutrition feedback for this meal: ${sanitize(JSON.stringify(meal), 1800)}. Member context: ${sanitize(fitnessContext, 3500)}` }] },
])

export const generateWorkoutAdvice = (workout, fitnessContext = '') => callGemini([
  { role: 'user', parts: [{ text: `Give practical workout advice for: ${sanitize(JSON.stringify(workout), 1800)}. Member context: ${sanitize(fitnessContext, 3500)}` }] },
])

export const chatWithCoach = (history, userMessage, fitnessContext = '') => askAICoach(history, userMessage, fitnessContext)

export const generateDietPlan = async (answers) => {
  const raw = await callGemini([{ role: 'user', parts: [{ text: `Create a 7-day diet plan as valid JSON. Member: ${sanitize(JSON.stringify(answers), 3000)}. Return an object with summary, dailyCalorieTarget, macros, days, shoppingList, mealTiming, hydrationAdvice, and supplements.` }] }])
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()) } catch { throw new Error('Could not parse the AI diet plan. Please try again.') }
}

export const generateWeeklyPlan = generateDietPlan
