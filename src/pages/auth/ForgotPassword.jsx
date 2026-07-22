import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { isValidEmail } from '../../utils/validators'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'

const ForgotPassword = () => {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      toast.error('Could not send reset email. Check the address and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg bg-vein-radial px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        {!sent ? (
          <>
            <h1 className="font-display text-2xl font-bold">Reset your password</h1>
            <p className="mt-1 mb-8 text-sm text-ink-muted">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
              />
              <Button type="submit" loading={loading}>Send Reset Link</Button>
            </form>
          </>
        ) : (
          <div className="card-surface flex flex-col items-center gap-3 py-10 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <h2 className="text-lg font-bold">Check your inbox</h2>
            <p className="text-sm text-ink-muted">We sent a password reset link to {email}.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPassword
