import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import MobileNav from './MobileNav.jsx'
import FloatingAICoach from '../ai/FloatingAICoach.jsx'
import FloatingDietPlanner from '../ai/FloatingDietPlanner.jsx'
import InstallPrompt from '../pwa/InstallPrompt.jsx'

const AppLayout = () => (
  <div className="flex min-h-screen bg-bg bg-vein-radial bg-no-repeat">
    <Sidebar />
    <div className="flex-1">
      <Outlet />
    </div>
    <MobileNav />
    <FloatingAICoach />
    <FloatingDietPlanner />
    <InstallPrompt />
  </div>
)

export default AppLayout
