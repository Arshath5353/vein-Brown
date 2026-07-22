import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UtensilsCrossed, X, ChevronRight, ChevronLeft, Download, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateDietPlan } from '../../services/geminiService'
import { saveDietPlan } from '../../services/firestoreService'
import { useAuth } from '../../hooks/useAuth'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const STEPS = ['basics', 'goal', 'preferences', 'health']

const FloatingDietPlanner = () => {
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [activeDay, setActiveDay] = useState(0)
  const [answers, setAnswers] = useState({
    age: profile?.age || '',
    gender: profile?.gender || '',
    height: profile?.height || '',
    weight: profile?.weight || '',
    goal: profile?.fitnessGoal || 'maintain',
    activityLevel: profile?.activityLevel || 'moderate',
    foodPreference: profile?.foodPreference || 'non-vegetarian',
    budget: 'medium',
    medicalConditions: '',
    allergies: '',
    mealsPerDay: '3',
    cuisinePreference: '',
    cookingSkill: 'beginner',
    workoutFrequency: '',
  })

  const update = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))

  const reset = () => {
    setStep(0)
    setPlan(null)
    setActiveDay(0)
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateDietPlan(answers)
      setPlan(result)
      if (user) await saveDietPlan(user.uid, { ...result, inputs: answers })
      toast.success('Your 7-day plan is ready!')
    } catch (err) {
      toast.error(err.message || 'Could not generate a plan right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[152px] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-card border border-white/10 shadow-glow-accent transition-transform hover:scale-105 active:scale-95 md:bottom-[104px] md:right-8"
        aria-label="Open AI Diet Planner"
      >
        <UtensilsCrossed className="h-6 w-6 text-accent" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[210] flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="glass flex h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl3 md:h-[680px] md:rounded-xl3"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                <h3 className="font-display font-bold">AI Diet Planner</h3>
                <button
                  onClick={() => {
                    setOpen(false)
                    reset()
                  }}
                  className="rounded-full p-1.5 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {!plan && (
                  <>
                    <div className="mb-6 flex gap-1.5">
                      {STEPS.map((s, i) => (
                        <div
                          key={s}
                          className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-white/10'}`}
                        />
                      ))}
                    </div>

                    {step === 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">The basics</h4>
                        <Input label="Age" type="number" value={answers.age} onChange={(e) => update('age', e.target.value)} />
                        <Input label="Gender" value={answers.gender} onChange={(e) => update('gender', e.target.value)} placeholder="e.g. female, male, non-binary" />
                        <Input label="Height (cm)" type="number" value={answers.height} onChange={(e) => update('height', e.target.value)} />
                        <Input label="Weight (kg)" type="number" value={answers.weight} onChange={(e) => update('weight', e.target.value)} />
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">Your goal</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {['lose', 'maintain', 'gain', 'athletic'].map((g) => (
                            <button
                              key={g}
                              onClick={() => update('goal', g)}
                              className={`rounded-xl2 border px-4 py-3 text-sm capitalize ${
                                answers.goal === g ? 'border-accent bg-accent/10' : 'border-white/10'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                        <h4 className="mt-2 font-semibold">Activity level</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {['sedentary', 'light', 'moderate', 'active', 'athlete'].map((a) => (
                            <button
                              key={a}
                              onClick={() => update('activityLevel', a)}
                              className={`rounded-xl2 border px-4 py-3 text-sm capitalize ${
                                answers.activityLevel === a ? 'border-accent bg-accent/10' : 'border-white/10'
                              }`}
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                        <Input label="Workouts per week" type="number" value={answers.workoutFrequency} onChange={(e) => update('workoutFrequency', e.target.value)} />
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">Food & budget</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {['vegetarian', 'non-vegetarian', 'vegan'].map((f) => (
                            <button
                              key={f}
                              onClick={() => update('foodPreference', f)}
                              className={`rounded-xl2 border px-3 py-3 text-xs capitalize ${
                                answers.foodPreference === f ? 'border-accent bg-accent/10' : 'border-white/10'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                        <h4 className="mt-2 font-semibold">Weekly grocery budget</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {['low', 'medium', 'high'].map((b) => (
                            <button
                              key={b}
                              onClick={() => update('budget', b)}
                              className={`rounded-xl2 border px-3 py-3 text-xs capitalize ${
                                answers.budget === b ? 'border-accent bg-accent/10' : 'border-white/10'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                        <Input label="Meals per day" type="number" value={answers.mealsPerDay} onChange={(e) => update('mealsPerDay', e.target.value)} />
                        <Input label="Cuisine preference" value={answers.cuisinePreference} onChange={(e) => update('cuisinePreference', e.target.value)} placeholder="e.g. South Indian, Mediterranean" />
                        <Input label="Cooking skill" value={answers.cookingSkill} onChange={(e) => update('cookingSkill', e.target.value)} placeholder="beginner, intermediate, advanced" />
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">Health notes</h4>
                        <Input
                          label="Medical conditions (optional)"
                          value={answers.medicalConditions}
                          onChange={(e) => update('medicalConditions', e.target.value)}
                          placeholder="e.g. diabetes, hypertension"
                        />
                        <Input
                          label="Allergies (optional)"
                          value={answers.allergies}
                          onChange={(e) => update('allergies', e.target.value)}
                          placeholder="e.g. peanuts, shellfish"
                        />
                      </div>
                    )}

                    <div className="mt-8 flex gap-3">
                      {step > 0 && (
                        <Button variant="secondary" onClick={() => setStep((s) => s - 1)} icon={ChevronLeft}>
                          Back
                        </Button>
                      )}
                      {step < STEPS.length - 1 ? (
                        <Button onClick={() => setStep((s) => s + 1)} icon={ChevronRight}>
                          Next
                        </Button>
                      ) : (
                        <Button onClick={handleGenerate} loading={loading}>
                          Generate my plan
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {loading && !plan && (
                  <div className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
                    <Loader2 className="h-4 w-4 animate-spin" /> Building your personalized 7-day plan…
                  </div>
                )}

                {plan && (
                  <div className="space-y-5">
                    <p className="text-sm text-ink-muted">{plan.summary}</p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="card-surface !p-3">
                        <p className="text-lg font-bold">{plan.dailyCalorieTarget}</p>
                        <p className="text-[10px] text-ink-faint">KCAL</p>
                      </div>
                      <div className="card-surface !p-3">
                        <p className="text-lg font-bold">{plan.macros?.protein}g</p>
                        <p className="text-[10px] text-ink-faint">PROTEIN</p>
                      </div>
                      <div className="card-surface !p-3">
                        <p className="text-lg font-bold">{plan.macros?.carbs}g</p>
                        <p className="text-[10px] text-ink-faint">CARBS</p>
                      </div>
                      <div className="card-surface !p-3">
                        <p className="text-lg font-bold">{plan.macros?.fat}g</p>
                        <p className="text-[10px] text-ink-faint">FAT</p>
                      </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {plan.days?.map((d, i) => (
                        <button
                          key={d.day}
                          onClick={() => setActiveDay(i)}
                          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs ${
                            activeDay === i ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-ink-muted'
                          }`}
                        >
                          {d.day}
                        </button>
                      ))}
                    </div>

                    {plan.days?.[activeDay] && (
                      <div className="space-y-2">
                        {['breakfast', 'lunch', 'dinner', 'snacks'].map((meal) => {
                          const m = plan.days[activeDay][meal]
                          if (!m) return null
                          return (
                            <div key={meal} className="card-surface !p-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-accent">{meal}</span>
                                <span className="text-xs text-ink-faint">{m.calories} kcal</span>
                              </div>
                              <p className="mt-1 text-sm">{m.name}</p>
                              <p className="mt-1 text-xs text-ink-faint">
                                P {m.protein}g · C {m.carbs}g · F {m.fat}g
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div>
                      <h5 className="mb-2 text-sm font-semibold">Shopping list</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.shoppingList?.map((item) => (
                          <span key={item} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-ink-muted">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs text-ink-muted">
                      <p><span className="font-semibold text-ink">Meal timing: </span>{plan.mealTiming}</p>
                      <p><span className="font-semibold text-ink">Hydration: </span>{plan.hydrationAdvice}</p>
                      <p><span className="font-semibold text-ink">Supplements: </span>{plan.supplements?.join(', ')}</p>
                    </div>

                    <Button variant="secondary" icon={Download} onClick={reset}>
                      Start over
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingDietPlanner
