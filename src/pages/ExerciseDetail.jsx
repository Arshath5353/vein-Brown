import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Flame, Clock, Dumbbell, Target, ExternalLink, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { EXERCISES } from '../constants/exercises'
import { useAuth } from '../hooks/useAuth'
import { logWorkout } from '../services/firestoreService'
import WorkoutTimer from '../components/exercises/WorkoutTimer.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

const ExerciseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const exercise = EXERCISES.find((ex) => ex.id === id)

  if (!exercise) {
    return (
      <div className="page-shell">
        <p className="text-ink-muted">Exercise not found.</p>
        <Button className="mt-4 max-w-xs" onClick={() => navigate('/exercises')}>Back to library</Button>
      </div>
    )
  }

  const markComplete = async () => {
    try {
      await logWorkout(user.uid, {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        category: exercise.category,
        caloriesBurned: exercise.caloriesBurned,
        durationMinutes: exercise.durationMinutes,
      })
      toast.success('Workout logged! Streak updated.')
    } catch (err) {
      toast.error('Could not log this workout.')
    }
  }

  return (
    <div className="page-shell">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="overflow-hidden rounded-xl3">
        <img src={exercise.image} alt={exercise.name} className="h-56 w-full object-cover md:h-72" />
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="section-eyebrow">{exercise.category}</span>
          <h1 className="mt-1 font-display text-2xl font-bold">{exercise.name}</h1>
        </div>
        <Button className="w-auto px-5" icon={CheckCircle2} onClick={markComplete}>
          Mark Complete
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="!p-3 text-center"><Flame className="mx-auto mb-1 h-5 w-5 text-orange-400" /><p className="text-sm font-semibold">{exercise.caloriesBurned} kcal</p></Card>
        <Card className="!p-3 text-center"><Clock className="mx-auto mb-1 h-5 w-5 text-accent" /><p className="text-sm font-semibold">{exercise.durationMinutes} min</p></Card>
        <Card className="!p-3 text-center"><Dumbbell className="mx-auto mb-1 h-5 w-5 text-primary" /><p className="text-sm font-semibold">{exercise.equipment}</p></Card>
        <Card className="!p-3 text-center"><Target className="mx-auto mb-1 h-5 w-5 text-green-400" /><p className="text-sm font-semibold">{exercise.difficulty}</p></Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-bold">Instructions</h2>
          <ol className="space-y-3">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-ink-muted">{step}</p>
              </li>
            ))}
          </ol>

          <p className="mt-4 text-sm text-ink-muted">
            <span className="font-semibold text-ink">Target muscles: </span>{exercise.targetMuscle}
          </p>

          <a
            href={exercise.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            Watch form video <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <WorkoutTimer initialSeconds={exercise.durationMinutes * 60} label="Exercise Timer" />
      </div>
    </div>
  )
}

export default ExerciseDetail
