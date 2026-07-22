import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { useAIChat } from '../../hooks/useAIChat'

const STARTER_PROMPTS = [
  'How much protein do I need daily?',
  'Best exercises for lower back pain?',
  'How do I break a weight-loss plateau?',
]

const MarkdownMessage = ({ text }) => {
  const lines = text.split('\n')
  return <div className="space-y-1">{lines.map((line, index) => {
    if (line.startsWith('```')) return <pre key={index} className="overflow-x-auto rounded bg-black/30 p-2 text-xs">{line.replace(/```\w*/g, '')}</pre>
    if (/^[-*] /.test(line)) return <p key={index} className="pl-3 before:mr-2 before:content-['•']">{line.slice(2)}</p>
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return <p key={index}>{parts.map((part, partIndex) => part.startsWith('**') ? <strong key={partIndex}>{part.slice(2, -2)}</strong> : part)}</p>
  })}</div>
}

const FloatingAICoach = () => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, loading, send: sendMessage, loggedIn } = useAIChat()
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  const send = async (text) => {
    const messageText = text ?? input
    if (!messageText.trim() || loading || !loggedIn) return
    setInput('')
    await sendMessage(messageText)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-vein-gradient shadow-glow transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
        aria-label="Open AI Coach"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[210] flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="glass flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-xl3 md:h-[640px] md:rounded-xl3"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <h3 className="font-display font-bold">AI Fitness Coach</h3>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-xl2 px-4 py-2.5 text-sm ${
                        m.role === 'user' ? 'bg-vein-gradient text-white' : 'bg-white/5 text-ink'
                      }`}
                    >
                      <MarkdownMessage text={m.text || 'Thinking…'} />
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl2 bg-white/5 px-4 py-2.5 text-sm text-ink-muted">Thinking…</div>
                  </div>
                )}
              </div>

              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 px-5 pb-3">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-ink-muted hover:border-accent hover:text-white"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
                className="flex items-center gap-2 border-t border-white/5 px-4 py-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about workouts, recovery, nutrition…"
                  className="input-field flex-1 py-2.5"
                />
                <button
                  type="submit"
                  disabled={loading || !loggedIn}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl2 bg-vein-gradient disabled:opacity-50"
                  aria-label="Send"
                >
                  <Send className="h-5 w-5 text-white" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingAICoach
