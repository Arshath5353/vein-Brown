import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

const WorkoutTimer = ({ initialSeconds = 60, label = 'Rest Timer' }) => {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            toast.success(`${label} complete!`)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, label])

  const reset = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSeconds(initialSeconds)
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const pct = 1 - seconds / initialSeconds

  return (
    <div className="card-surface flex flex-col items-center gap-4">
      <p className="text-sm font-semibold text-ink-muted">{label}</p>
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg className="absolute -rotate-90" width="128" height="128">
          <circle cx="64" cy="64" r="56" stroke="#232323" strokeWidth="8" fill="none" />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="#4B2EFF"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 56}
            strokeDashoffset={2 * Math.PI * 56 * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="font-mono text-3xl font-bold">{mins}:{secs}</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-vein-gradient"
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          onClick={reset}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10"
          aria-label="Reset"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default WorkoutTimer
