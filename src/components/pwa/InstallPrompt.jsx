import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone

const InstallPrompt = () => {
  const [prompt, setPrompt] = useState(null)
  const [showIos, setShowIos] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem('vein-install-dismissed') === new Date().toDateString()) return
    setDismissed(false)
    const handler = (event) => { event.preventDefault(); setPrompt(event) }
    window.addEventListener('beforeinstallprompt', handler)
    if (isIos()) setShowIos(true)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const close = () => { localStorage.setItem('vein-install-dismissed', new Date().toDateString()); setDismissed(true) }
  const install = async () => {
    if (!prompt) return
    prompt.prompt(); await prompt.userChoice; setPrompt(null); close()
  }
  if (dismissed || (!prompt && !showIos)) return null
  return <aside className="fixed inset-x-3 bottom-[5.75rem] z-[100] mx-auto flex max-w-md items-center gap-3 rounded-xl2 border border-accent/30 bg-card p-3 shadow-glow md:bottom-5">
    <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Install Vein Brown</p><p className="text-xs text-ink-muted">{showIos ? 'Tap Share, then Add to Home Screen.' : 'Add the app to your home screen for a faster full-screen experience.'}</p></div>
    {showIos ? <Share className="h-5 w-5 shrink-0 text-accent" /> : <button onClick={install} className="rounded-lg bg-accent p-2 text-white" aria-label="Install app"><Download className="h-5 w-5" /></button>}
    <button onClick={close} className="p-1 text-ink-faint" aria-label="Dismiss install prompt"><X className="h-4 w-4" /></button>
  </aside>
}
export default InstallPrompt
