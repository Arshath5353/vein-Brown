export const todayISO = () => new Date().toISOString().slice(0, 10)

export const formatFriendlyDate = (isoString) =>
  new Date(isoString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

export const last7Days = () => {
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
    })
  }
  return days
}

export const timeAgo = (date) => {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
