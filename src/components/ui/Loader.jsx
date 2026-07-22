import { motion } from 'framer-motion'
import BrandLogo from '../brand/BrandLogo.jsx'

const Loader = ({ fullscreen = false, label = 'Loading...' }) => {
  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="h-10 w-10 rounded-full border-2 border-white/10 border-t-accent"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
      {label && <p className="text-sm text-ink-muted">{label}</p>}
    </div>
  )

  if (!fullscreen) return spinner

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-6"><BrandLogo compact />{spinner}</div>
    </div>
  )
}

export default Loader
