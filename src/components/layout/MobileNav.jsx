import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Droplets, ChartNoAxesCombined, User } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/exercises', label: 'Train', icon: Dumbbell },
  { to: '/statistics', label: 'Stats', icon: ChartNoAxesCombined },
  { to: '/trackers', label: 'Track', icon: Droplets },
  { to: '/profile', label: 'You', icon: User },
]

const MobileNav = () => (
  <nav className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around px-2 py-2 md:hidden">
    {links.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
            isActive ? 'text-white' : 'text-ink-faint'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={`h-5 w-5 ${isActive ? 'text-accent' : ''}`} />
            {label}
          </>
        )}
      </NavLink>
    ))}
  </nav>
)

export default MobileNav
