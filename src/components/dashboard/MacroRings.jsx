import Card from '../ui/Card.jsx'
import ProgressRing from '../ui/ProgressRing.jsx'

const MacroRings = ({ calories, protein, carbs, fat }) => (
  <Card className="relative overflow-hidden glass !bg-card/40 transition-all duration-300 hover:border-white/15">
    <div className="absolute inset-0 bg-gradient-to-br from-[#4B2EFF]/5 via-transparent to-[#FFC15B]/5 pointer-events-none" />
    <p className="mb-6 text-xs tracking-[0.2em] uppercase font-semibold text-accent relative z-10">Today's Macros</p>
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 relative z-10">
      <div className="flex flex-col items-center gap-2 group cursor-default">
        <div className="transition-transform duration-300 hover:scale-105">
          <ProgressRing value={calories.value} max={calories.goal} color="#4B2EFF" label={calories.value} sublabel="KCAL" />
        </div>
        <span className="text-[11px] font-medium text-ink-faint bg-white/5 px-2.5 py-0.5 rounded-full ring-1 ring-white/10">of {calories.goal}</span>
      </div>
      <div className="flex flex-col items-center gap-2 group cursor-default">
        <div className="transition-transform duration-300 hover:scale-105">
          <ProgressRing value={protein.value} max={protein.goal} color="#9C5BFF" label={protein.value} sublabel="PRO" />
        </div>
        <span className="text-[11px] font-medium text-ink-faint bg-white/5 px-2.5 py-0.5 rounded-full ring-1 ring-white/10">of {protein.goal}g</span>
      </div>
      <div className="flex flex-col items-center gap-2 group cursor-default">
        <div className="transition-transform duration-300 hover:scale-105">
          <ProgressRing value={carbs.value} max={carbs.goal} color="#5BA3FF" label={carbs.value} sublabel="CARBS" />
        </div>
        <span className="text-[11px] font-medium text-ink-faint bg-white/5 px-2.5 py-0.5 rounded-full ring-1 ring-white/10">of {carbs.goal}g</span>
      </div>
      <div className="flex flex-col items-center gap-2 group cursor-default">
        <div className="transition-transform duration-300 hover:scale-105">
          <ProgressRing value={fat.value} max={fat.goal} color="#FFC15B" label={fat.value} sublabel="FAT" />
        </div>
        <span className="text-[11px] font-medium text-ink-faint bg-white/5 px-2.5 py-0.5 rounded-full ring-1 ring-white/10">of {fat.goal}g</span>
      </div>
    </div>
  </Card>
)

export default MacroRings
