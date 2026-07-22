export const getUserDisplayName = (user, profile) => {
  const candidate = user?.displayName || profile?.name || user?.email?.split('@')[0]
  if (!candidate?.trim()) return 'Welcome Back'
  return candidate.trim().split(/\s+/).map((part) => `${part[0]?.toUpperCase() || ''}${part.slice(1)}`).join(' ')
}

export const getTimeGreeting = (date = new Date()) => {
  const hour = date.getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}
