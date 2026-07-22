import Card from '../ui/Card.jsx'
import ProgressRing from '../ui/ProgressRing.jsx'

const MacroRings = ({ calories, protein, carbs, fat }) => (
  <Card>
    <p className="mb-4 text-sm font-semibold text-ink-muted">Today's Macros</p>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="flex flex-col items-center gap-2">
        <ProgressRing value={calories.value} max={calories.goal} color="#4B2EFF" label={calories.value} sublabel="KCAL" />
        <span className="text-xs text-ink-faint">of {calories.goal}</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ProgressRing value={protein.value} max={protein.goal} color="#9C5BFF" label={protein.value} sublabel="PROTEIN" />
        <span className="text-xs text-ink-faint">of {protein.goal}g</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ProgressRing value={carbs.value} max={carbs.goal} color="#5BA3FF" label={carbs.value} sublabel="CARBS" />
        <span className="text-xs text-ink-faint">of {carbs.goal}g</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ProgressRing value={fat.value} max={fat.goal} color="#FFC15B" label={fat.value} sublabel="FAT" />
        <span className="text-xs text-ink-faint">of {fat.goal}g</span>
      </div>
    </div>
  </Card>
)

export default MacroRings
