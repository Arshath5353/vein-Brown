import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Dumbbell,
  Calculator,
  Droplets,
  UtensilsCrossed,
  User,
  Settings,
  LogOut,
  CalendarDays,
  ChartNoAxesCombined,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import BrandLogo from '../brand/BrandLogo.jsx'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/exercises', label: 'Exercises', icon: Dumbbell },
  { to: '/calculators', label: 'Calculators', icon: Calculator },
  { to: '/trackers', label: 'Trackers', icon: Droplets },
  { to: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/statistics', label: 'Statistics', icon: ChartNoAxesCombined },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const Sidebar = () => {
  const { logout } = useAuth()
  const { profile, name } = useCurrentUser()

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-white/5 bg-bg-soft px-5 py-8 md:flex">
      <BrandLogo className="mb-10 px-2" />

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl2 px-3.5 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/[0.06] text-white'
                  : 'text-ink-muted hover:bg-white/[0.04] hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/5 pt-5">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              (profile?.name || 'A')[0]
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-ink-faint">{profile?.fitnessGoal || 'Vein Brown'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl2 px-3.5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-white/5 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
