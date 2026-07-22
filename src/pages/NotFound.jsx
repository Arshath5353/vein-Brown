import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-bg bg-vein-radial px-4 text-center">
    <p className="font-display text-6xl font-bold text-accent">404</p>
    <h1 className="mt-2 text-xl font-bold">Page not found</h1>
    <p className="mt-1 text-sm text-ink-muted">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="mt-6">
      <Button className="w-auto px-6">Back to Dashboard</Button>
    </Link>
  </div>
)

export default NotFound
