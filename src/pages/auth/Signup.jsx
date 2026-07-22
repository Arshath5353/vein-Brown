import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { isValidEmail, isStrongPassword, passwordStrength } from '../../utils/validators'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import BrandLogo from '../../components/brand/BrandLogo.jsx'
import { mapAuthError } from '../../utils/authErrors'

const Signup = () => {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const strength = form.password ? passwordStrength(form.password) : null

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    if (!isStrongPassword(form.password)) next.password = 'Password must be at least 6 characters.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup(form)
      toast.success('Account created! Check your inbox to verify your email.')
      navigate('/onboarding', { replace: true })
    } catch (err) {
      toast.error(mapAuthError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg bg-vein-radial px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <BrandLogo compact className="mx-auto mb-4 w-fit" />
          <h1 className="font-display text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-ink-muted">Start your transformation with Vein Brown.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            icon={User}
            placeholder="Jordan Blake"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <div>
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            {strength && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${(strength.score / 5) * 100}%`, backgroundColor: strength.color }}
                  />
                </div>
                <span className="text-xs" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>
          <Input
            label="Confirm password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
          />

          <Button type="submit" loading={loading}>Create Account</Button>
        </form>

        <p className="mt-8 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-white hover:text-accent">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Signup
