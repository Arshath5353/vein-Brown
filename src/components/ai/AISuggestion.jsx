import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { generateDailySuggestion, getGeminiErrorMessage } from '../../services/geminiService'
import { createFitnessContext } from '../../services/fitnessContextService'
import { readLocalData, writeLocalData } from '../../services/localDataService'
import Card from '../ui/Card.jsx'

const todayKey = () => new Date().toISOString().slice(0, 10)

const AISuggestion = ({ summary }) => {
  const { user, profile } = useCurrentUser()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async (force = false) => {
    if (!user?.uid) return
    setLoading(true); setError('')
    const key = `ai-suggestion:${todayKey()}`
    try {
      const cached = force ? null : await readLocalData(user.uid, key)
      if (cached?.text) setText(cached.text)
      else {
        const suggestion = await generateDailySuggestion(await createFitnessContext(user.uid, profile, summary))
        setText(suggestion)
        await writeLocalData(user.uid, key, { text: suggestion, createdAt: Date.now() })
      }
    } catch (err) { setError(getGeminiErrorMessage(err)) } finally { setLoading(false) }
  }, [profile, summary, user?.uid])
  useEffect(() => { load() }, [load])
  return <Card className="mt-6">
    <div className="mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /><p className="font-semibold">AI Suggestion</p></div>
    {loading && <div className="space-y-2"><div className="h-4 w-full animate-pulse rounded bg-white/10" /><div className="h-4 w-4/5 animate-pulse rounded bg-white/10" /></div>}
    {!loading && text && <p className="whitespace-pre-wrap text-sm leading-6 text-ink-muted">{text}</p>}
    {!loading && error && <div className="flex items-center justify-between gap-3 text-sm text-ink-muted"><span>{error}</span><button onClick={() => load(true)} className="inline-flex shrink-0 items-center gap-1 text-accent"><RefreshCw className="h-4 w-4" />Retry</button></div>}
  </Card>
}

export default AISuggestion
