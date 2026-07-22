const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl3 border border-dashed border-white/10 px-6 py-14 text-center">
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-7 w-7 text-ink-faint" />
      </div>
    )}
    <h3 className="text-base font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1 max-w-xs text-sm text-ink-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
)

export default EmptyState
