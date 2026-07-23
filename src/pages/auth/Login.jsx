import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { isValidEmail } from '../../utils/validators'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { mapAuthError } from '../../utils/authErrors'
import BrandLogo from '../../components/brand/BrandLogo.jsx'
import { auth, db, googleProvider, setAuthPersistence } from '../../firebase/config'
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { writeLocalData } from '../../services/localDataService'

const Login = () => {
  const { login, loginWithGoogle, user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '', rememberMe: true })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const GOOGLE_CLIENT_ID = '836423512306-qsife9q35aks9embrmtqhqe14q84ohpt.apps.googleusercontent.com'

  const from = location.state?.from?.pathname || '/dashboard'

  // GIS Callbacks and Effects
  useEffect(() => {
    // Load the GSI script if not present
    if (!window.google) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogleAuth
      document.body.appendChild(script)
    } else {
      initializeGoogleAuth()
    }

    function initializeGoogleAuth() {
      if (!window.google) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGISResponse,
        auto_select: false,
        use_fedcm_for_prompt: true
      })

      // We explicitly render the button UI directly over our container
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn-container'),
        { theme: 'outline', size: 'large', width: 330, shape: 'pill' }
      )
    }
  }, [])

  const handleGISResponse = async (response) => {
    setGoogleLoading(true)
    try {
      if (!response.credential) throw new Error("No credential returned from Google.")

      const credential = GoogleAuthProvider.credential(response.credential)

      // Perform final sign-in against our Firebase backend 
      await setAuthPersistence(true)
      const fbCred = await signInWithCredential(auth, credential)

      // Directly sync missing metadata for this user if necessary
      const docRef = doc(db, 'users', fbCred.user.uid)
      const snap = await getDoc(docRef)
      if (!snap.exists()) {
        const profileData = {
          uid: fbCred.user.uid,
          name: fbCred.user.displayName || fbCred.user.email?.split('@')[0] || 'Welcome Back',
          email: fbCred.user.email,
          photoURL: fbCred.user.photoURL || null,
          onboardingComplete: false,
          createdAt: Date.now(),
          provider: 'google',
        }
        await setDoc(docRef, profileData)
        await writeLocalData(fbCred.user.uid, 'profile', profileData)
      }

      // User is verified, useEffect router will now detect auth and navigate them
    } catch (err) {
      console.error('GIS sign-in failed:', err)
      toast.error(err?.message || 'Google Auth Failed')
      setGoogleLoading(false)
    }
  }

  // FIX: Resilient navigation logic. 
  // Wait until both user and profile states are resolved to prevent race conditions during auth.
  useEffect(() => {
    let timeoutId

    if (user && profile === null) {
      // HARSH DECISION: If iOS PWA is aggressively hanging on profile fetch,
      // force them into the dashboard after 2 seconds no matter what.
      timeoutId = setTimeout(() => {
        toast.success("Forced login recovery.")
        navigate(from, { replace: true })
      }, 2000)
    }

    if (!user || profile === null) return // Wait until user is authenticated and profile is completely loaded

    if (profile.onboardingComplete === false) {
      navigate('/onboarding', { replace: true })
    } else {
      navigate(from, { replace: true })
    }

    return () => clearTimeout(timeoutId)
  }, [user, profile, navigate, from])

  const validate = () => {
    const next = {}
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form)
      // Navigation is handled safely by useEffect
    } catch (err) {
      toast.error(mapAuthError(err.code))
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-bg bg-vein-radial px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <BrandLogo compact className="mx-auto mb-4 w-fit" />
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in to continue your training.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-ink-muted">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-card accent-primary"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-medium text-accent hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading}>Sign In</Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-ink-faint">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="flex justify-center w-full">
          <div id="google-btn-container"></div>
        </div>

        {googleLoading && (
          <p className="mt-4 text-center text-sm font-medium text-ink-muted animate-pulse">
            Authenticating securely...
          </p>
        )}

        <p className="mt-8 text-center text-sm text-ink-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-white hover:text-accent">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.96 11.96 0 000 12c0 1.93.46 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
)

export default Login