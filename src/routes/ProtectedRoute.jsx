import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/ui/Loader.jsx'

/** Blocks access unless the user is authenticated. */
export const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader fullscreen label="Checking your session..." />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

/** Redirects to onboarding if the user hasn't completed it yet, otherwise renders children. */
export const RequireOnboarding = () => {
  const { profile, loading } = useAuth()

  if (loading) return <Loader fullscreen label="Loading your profile..." />
  if (profile && profile.onboardingComplete === false) {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}

/** Sends already-onboarded users away from onboarding, and logged-in users away from auth pages. */
export const RedirectIfAuthed = ({ children }) => {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader fullscreen label="Loading..." />
  if (user && profile?.onboardingComplete) return <Navigate to="/dashboard" replace />
  if (user && profile && !profile.onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}
