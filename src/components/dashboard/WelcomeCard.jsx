import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { quoteOfTheDay } from '../../constants/quotes'
import { useCurrentUser } from '../../hooks/useCurrentUser'

const WelcomeCard = ({ streak }) => {
  const { name, greeting } = useCurrentUser()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl3 bg-vein-gradient p-6 shadow-glow md:p-8"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <p className="text-sm font-medium text-white/80">{greeting},</p>
      <h1 className="font-display text-2xl font-bold md:text-3xl">{name}</h1>
      <p className="mt-3 max-w-md text-sm text-white/85">"{quoteOfTheDay()}"</p>
      {streak > 0 && (
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-xs font-semibold">
          <Flame className="h-4 w-4 text-orange-300" />
          {streak}-day streak
        </div>
      )}
    </motion.div>
  )
}

export default WelcomeCard
