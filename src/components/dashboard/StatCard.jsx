import Card from '../ui/Card.jsx'

const StatCard = ({ icon: Icon, label, value, unit, accent = '#4B2EFF' }) => (
  <Card
    className="group relative flex items-center gap-3 !p-4 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-glow hover:-translate-y-1 cursor-pointer border-white/5"
  >
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl2 transition-transform duration-300 group-hover:scale-110"
      style={{ backgroundColor: `${accent}25`, boxShadow: `0 0 20px ${accent}20` }}
    >
      <Icon className="h-5 w-5 transition-transform duration-300" style={{ color: accent }} />
    </div>
    <div className="min-w-0 z-10">
      <p className="truncate text-xs font-semibold text-ink-muted tracking-wider">{label}</p>
      <p className="text-[22px] font-bold leading-tight mt-0.5" style={{ textShadow: `0 2px 10px ${accent}30` }}>
        {value} <span className="text-sm font-medium text-ink-faint">{unit}</span>
      </p>
    </div>
  </Card>
)

export default StatCard
