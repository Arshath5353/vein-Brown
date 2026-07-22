import { Flame, Clock, Dumbbell } from 'lucide-react'

const DIFFICULTY_COLOR = {
  Beginner: '#5BFF9C',
  Intermediate: '#FFC15B',
  Advanced: '#FF5B5B',
}

const ExerciseCard = ({ exercise, onClick }) => (
  <button
    onClick={onClick}
    className="group overflow-hidden rounded-xl3 border border-card-border bg-card text-left shadow-card transition-transform hover:-translate-y-1"
  >
    <div className="relative h-36 w-full overflow-hidden">
      <img
        src={exercise.image}
        alt={exercise.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span
        className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold backdrop-blur"
        style={{ color: DIFFICULTY_COLOR[exercise.difficulty] }}
      >
        {exercise.difficulty}
      </span>
    </div>
    <div className="space-y-2 p-4">
      <h3 className="font-semibold leading-tight">{exercise.name}</h3>
      <p className="text-xs text-ink-faint">{exercise.targetMuscle}</p>
      <div className="flex items-center gap-3 pt-1 text-xs text-ink-muted">
        <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{exercise.caloriesBurned} kcal</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{exercise.durationMinutes}m</span>
        <span className="flex items-center gap-1"><Dumbbell className="h-3.5 w-3.5" />{exercise.equipment}</span>
      </div>
    </div>
  </button>
)

export default ExerciseCard
