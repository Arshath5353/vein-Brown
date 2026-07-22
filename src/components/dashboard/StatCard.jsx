import Card from '../ui/Card.jsx'

const StatCard = ({ icon: Icon, label, value, unit, accent = '#4B2EFF' }) => (
  <Card className="flex items-center gap-3 !p-4">
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl2"
      style={{ backgroundColor: `${accent}22` }}
    >
      <Icon className="h-5 w-5" style={{ color: accent }} />
    </div>
    <div className="min-w-0">
      <p className="truncate text-xs text-ink-muted">{label}</p>
      <p className="text-lg font-bold leading-tight">
        {value} <span className="text-xs font-medium text-ink-faint">{unit}</span>
      </p>
    </div>
  </Card>
)

export default StatCard
