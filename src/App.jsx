import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute, RequireOnboarding, RedirectIfAuthed } from './routes/ProtectedRoute.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import Loader from './components/ui/Loader.jsx'

const Login = lazy(() => import('./pages/auth/Login.jsx'))
const Signup = lazy(() => import('./pages/auth/Signup.jsx'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword.jsx'))
const Onboarding = lazy(() => import('./pages/onboarding/Onboarding.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Exercises = lazy(() => import('./pages/Exercises.jsx'))
const ExerciseDetail = lazy(() => import('./pages/ExerciseDetail.jsx'))
const Calculators = lazy(() => import('./pages/Calculators.jsx'))
const Trackers = lazy(() => import('./pages/Trackers.jsx'))
const MealTracker = lazy(() => import('./pages/MealTracker.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Statistics = lazy(() => import('./pages/Statistics.jsx'))
const Calendar = lazy(() => import('./pages/Calendar.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#121212', color: '#FFFFFF', border: '1px solid #232323' },
        }}
      />
      <Suspense fallback={<Loader fullscreen label="Loading..." />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthed>
              <Signup />
            </RedirectIfAuthed>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />

          <Route element={<RequireOnboarding />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/exercises/:id" element={<ExerciseDetail />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/trackers" element={<Trackers />} />
              <Route path="/meals" element={<MealTracker />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/calendar" element={<Calendar />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </>
  )
}

export default App
