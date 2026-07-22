import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Heart, Pencil, Plus, Save, Trash2, UtensilsCrossed } from 'lucide-react'
import { useLogCollection } from '../hooks/useFirestore'
import { useMealCategories } from '../hooks/useMealCategories'
import { useAuth } from '../hooks/useAuth'
import { readLocalData, writeLocalData } from '../services/localDataService'
import { todayISO } from '../utils/dateHelpers'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

const emptyForm = { categoryId: '', name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '', sodium: '', servingSize: '', time: '', notes: '' }
const nutrients = ['calories', 'protein', 'carbs', 'fat']

const MealTracker = () => {
  const { user } = useAuth()
  const { logs, add, remove } = useLogCollection('mealLogs')
  const { categories, addCategory, updateCategory, removeCategory, moveCategory } = useMealCategories()
  const [open, setOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [savedFoods, setSavedFoods] = useState([])
  const [recentFoods, setRecentFoods] = useState([])

  useEffect(() => {
    if (!user?.uid) return
    Promise.all([readLocalData(user.uid, 'saved-foods', []), readLocalData(user.uid, 'recent-foods', [])]).then(([saved, recent]) => {
      setSavedFoods(saved)
      setRecentFoods(recent)
    })
  }, [user?.uid])

  const todayMeals = logs.filter((log) => log.date === todayISO())
  const totals = useMemo(() => todayMeals.reduce((acc, meal) => {
    nutrients.forEach((nutrient) => { acc[nutrient] += Number(meal[nutrient] || 0) })
    return acc
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 }), [todayMeals])

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const chooseFood = (food) => setForm((current) => ({ ...current, ...food, categoryId: current.categoryId || categories[0]?.id || '' }))

  const handleAdd = async () => {
    if (!form.name || !form.calories || !form.categoryId) return
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, nutrients.includes(key) || ['fiber', 'sugar', 'sodium'].includes(key) ? Number(value) || 0 : value]))
    await add(payload)
    const food = Object.fromEntries(Object.entries(payload).filter(([key]) => key !== 'categoryId' && key !== 'time' && key !== 'notes'))
    const nextRecent = [food, ...recentFoods.filter((item) => item.name?.toLowerCase() !== food.name.toLowerCase())].slice(0, 12)
    setRecentFoods(nextRecent)
    await writeLocalData(user.uid, 'recent-foods', nextRecent)
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' })
    setOpen(false)
  }

  const toggleFavorite = async () => {
    if (!form.name) return
    const food = Object.fromEntries(Object.entries(form).filter(([key]) => !['categoryId', 'time', 'notes'].includes(key)))
    const exists = savedFoods.some((item) => item.name?.toLowerCase() === food.name.toLowerCase())
    const next = exists ? savedFoods.filter((item) => item.name?.toLowerCase() !== food.name.toLowerCase()) : [food, ...savedFoods]
    setSavedFoods(next)
    await writeLocalData(user.uid, 'saved-foods', next)
  }

  const saveCategory = async () => {
    const name = categoryName.trim()
    if (!name) return
    if (editingCategory) await updateCategory(editingCategory, { name })
    else await addCategory(name)
    setCategoryName(''); setEditingCategory(null); setCategoryOpen(false)
  }

  const openMealModal = (categoryId = categories[0]?.id || '') => {
    setForm({ ...emptyForm, categoryId })
    setOpen(true)
  }

  return <div className="page-shell">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="font-display text-2xl font-bold">Meal Tracker</h1><p className="mt-1 text-sm text-ink-muted">Log what you eat, hit your macros.</p></div>
      <div className="flex gap-2"><Button variant="secondary" className="w-auto px-4" icon={Plus} onClick={() => setCategoryOpen(true)}>Category</Button><Button className="w-auto px-4" icon={Plus} onClick={() => openMealModal()}>Add Meal</Button></div>
    </div>

    <div className="mt-5 grid grid-cols-4 gap-2 text-center">
      {[[totals.calories, 'KCAL', ''], [totals.protein, 'PROTEIN', 'g'], [totals.carbs, 'CARBS', 'g'], [totals.fat, 'FAT', 'g']].map(([value, label, suffix]) => <Card key={label} className="!p-3"><p className="text-lg font-bold">{value}{suffix}</p><p className="text-[10px] text-ink-faint">{label}</p></Card>)}
    </div>

    <div className="mt-6 space-y-5">
      {categories.map((category, index) => {
        const meals = todayMeals.filter((meal) => meal.categoryId === category.id || (!meal.categoryId && meal.mealType === category.name))
        return <section key={category.id} className="rounded-xl2 border border-transparent p-1 transition hover:border-white/5">
          <div className="flex items-center gap-1">
            <button onClick={() => updateCategory(category.id, { collapsed: !category.collapsed })} className="flex min-w-0 flex-1 items-center gap-2 text-left"><h3 className="text-sm font-semibold uppercase tracking-wide text-accent">{category.name}</h3>{category.collapsed ? <ChevronDown className="h-4 w-4 text-ink-faint" /> : <ChevronUp className="h-4 w-4 text-ink-faint" />}</button>
            <button title="Move up" disabled={!index} onClick={() => moveCategory(category.id, -1)} className="p-1 text-ink-faint disabled:opacity-25"><ChevronUp className="h-4 w-4" /></button><button title="Move down" disabled={index === categories.length - 1} onClick={() => moveCategory(category.id, 1)} className="p-1 text-ink-faint disabled:opacity-25"><ChevronDown className="h-4 w-4" /></button>
            <button title="Rename" onClick={() => { setEditingCategory(category.id); setCategoryName(category.name); setCategoryOpen(true) }} className="p-1 text-ink-faint hover:text-white"><Pencil className="h-4 w-4" /></button>
            <button title="Delete category" onClick={() => removeCategory(category.id)} className="p-1 text-ink-faint hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
          </div>
          {!category.collapsed && <div className="mt-2 space-y-2">
            {meals.map((meal) => <Card key={meal.id} className="flex items-center justify-between !p-3.5"><div><p className="text-sm font-medium">{meal.name}{meal.servingSize ? <span className="ml-1 text-xs font-normal text-ink-faint">· {meal.servingSize}</span> : null}</p><p className="text-xs text-ink-faint">{meal.calories} kcal · P{meal.protein} C{meal.carbs} F{meal.fat}{meal.fiber ? ` · Fiber ${meal.fiber}g` : ''}</p>{meal.notes && <p className="mt-1 text-xs text-ink-muted">{meal.notes}</p>}</div><button onClick={() => remove(meal.id)} className="rounded-full p-2 text-ink-faint hover:bg-white/5 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></Card>)}
            {!meals.length && <p className="text-sm text-ink-faint">Nothing logged yet.</p>}
            <button onClick={() => openMealModal(category.id)} className="text-xs font-medium text-accent hover:text-white">+ Add food</button>
          </div>}
        </section>
      })}
      {!categories.length && <EmptyState icon={UtensilsCrossed} title="No meal categories" description="Add a category to begin logging meals." />}
      {!!categories.length && !todayMeals.length && <EmptyState icon={UtensilsCrossed} title="No meals logged today" description="Tap Add Meal to start tracking." />}
    </div>

    <Modal open={categoryOpen} onClose={() => { setCategoryOpen(false); setEditingCategory(null); setCategoryName('') }} title={editingCategory ? 'Rename meal category' : 'Add meal category'}><div className="space-y-4"><Input label="Meal category name" autoFocus placeholder="e.g. Post Workout" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} /><Button onClick={saveCategory}>{editingCategory ? 'Save name' : 'Add category'}</Button></div></Modal>

    <Modal open={open} onClose={() => setOpen(false)} title="Log a meal"><div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((category) => <button key={category.id} onClick={() => updateForm('categoryId', category.id)} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs ${form.categoryId === category.id ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-ink-muted'}`}>{category.name}</button>)}</div>
      {(savedFoods.length > 0 || recentFoods.length > 0) && <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Quick add</p><div className="flex gap-2 overflow-x-auto pb-1">{[...savedFoods, ...recentFoods].slice(0, 12).map((food, index) => <button key={`${food.name}-${index}`} onClick={() => chooseFood(food)} className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-ink-muted hover:border-accent">{food.name}</button>)}</div></div>}
      <div className="flex items-end gap-2"><div className="flex-1"><Input label="Food name" placeholder="Search or enter food manually" value={form.name} onChange={(event) => updateForm('name', event.target.value)} /></div><button title="Save favorite food" onClick={toggleFavorite} className="mb-0.5 rounded-xl2 border border-white/10 p-3 text-accent"><Heart className={`h-4 w-4 ${savedFoods.some((food) => food.name?.toLowerCase() === form.name.toLowerCase()) ? 'fill-current' : ''}`} /></button></div>
      <div className="grid grid-cols-2 gap-3">{[['calories', 'Calories'], ['protein', 'Protein (g)'], ['carbs', 'Carbs (g)'], ['fat', 'Fat (g)'], ['fiber', 'Fiber (g)'], ['sugar', 'Sugar (g)'], ['sodium', 'Sodium (mg)'], ['servingSize', 'Serving size']].map(([key, label]) => <Input key={key} type={key === 'servingSize' ? 'text' : 'number'} label={label} value={form[key]} onChange={(event) => updateForm(key, event.target.value)} />)}</div>
      <Input type="time" label="Time" value={form.time} onChange={(event) => updateForm('time', event.target.value)} /><Input label="Notes" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} />
      <Button icon={Save} onClick={handleAdd}>Save Meal</Button>
    </div></Modal>
  </div>
}

export default MealTracker
