import { useCallback, useEffect, useState } from 'react'
import { useCurrentUser } from './useCurrentUser'
import { getGeminiErrorMessage, streamWithCoach } from '../services/geminiService'
import { createFitnessContext } from '../services/fitnessContextService'
import { readLocalData, writeLocalData } from '../services/localDataService'

const welcome = { role: 'model', text: "Hey, I'm your Vein Brown AI Coach. Ask me about workouts, recovery, sleep, or nutrition." }

export const useAIChat = () => {
  const { user, profile } = useCurrentUser()
  const [messages, setMessages] = useState([welcome])
  const [loading, setLoading] = useState(false)
  useEffect(() => { if (user?.uid) readLocalData(user.uid, 'ai-chat', [welcome]).then((saved) => setMessages(saved?.length ? saved : [welcome])) }, [user?.uid])
  const send = useCallback(async (message) => {
    const text = message.trim()
    if (!text || loading || !user?.uid) return
    const next = [...messages, { role: 'user', text }]
    setMessages(next); setLoading(true)
    try {
      const streaming = [...next, { role: 'model', text: '', streaming: true }]
      setMessages(streaming)
      const context = await createFitnessContext(user.uid, profile)
      const reply = await streamWithCoach(messages, text, context, (partial) => {
        setMessages([...next, { role: 'model', text: partial, streaming: true }])
      })
      const complete = [...next, { role: 'model', text: reply }]
      setMessages(complete); await writeLocalData(user.uid, 'ai-chat', complete.slice(-30))
    } catch (error) {
      const complete = [...next, { role: 'model', text: getGeminiErrorMessage(error) }]
      setMessages(complete); await writeLocalData(user.uid, 'ai-chat', complete.slice(-30))
    } finally { setLoading(false) }
  }, [loading, messages, profile, user?.uid])
  return { messages, loading, send, loggedIn: Boolean(user?.uid) }
}
