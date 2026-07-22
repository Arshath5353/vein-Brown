import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { CATEGORIES, EXERCISES } from '../constants/exercises'
import ExerciseCard from '../components/exercises/ExerciseCard.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

const Exercises = () => {
  const navigate = useNavigate()
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchesCategory = category === 'All' || ex.category === category
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [category, search])

  return (
    <div className="page-shell">
      <h1 className="font-display text-2xl font-bold">Exercise Library</h1>
      <p className="mt-1 text-sm text-ink-muted">Browse by category and build your session.</p>

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="input-field pl-11"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              category === c ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-ink-muted'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No exercises found" description="Try a different category or search term." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} onClick={() => navigate(`/exercises/${ex.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Exercises
