import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { getTimeGreeting, getUserDisplayName } from '../utils/userIdentity'

export const useCurrentUser = () => {
  const { user, profile, loading } = useAuth()
  return useMemo(() => ({ user, profile, loading, name: getUserDisplayName(user, profile), greeting: getTimeGreeting() }), [user, profile, loading])
}
