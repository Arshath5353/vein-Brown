import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { getMealCategories, saveMealCategories } from '../services/firestoreService'

export const useMealCategories = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return
    getMealCategories(user.uid).then(setCategories).finally(() => setLoading(false))
  }, [user?.uid])

  const commit = useCallback(async (next) => {
    setCategories(next)
    await saveMealCategories(user.uid, next)
  }, [user?.uid])

  const addCategory = (name) => commit([...categories, { id: crypto.randomUUID(), name: name.trim(), collapsed: false }])
  const updateCategory = (id, changes) => commit(categories.map((category) => category.id === id ? { ...category, ...changes } : category))
  const removeCategory = (id) => commit(categories.filter((category) => category.id !== id))
  const moveCategory = (id, direction) => {
    const index = categories.findIndex((category) => category.id === id)
    const destination = index + direction
    if (index < 0 || destination < 0 || destination >= categories.length) return
    const next = [...categories]
    ;[next[index], next[destination]] = [next[destination], next[index]]
    commit(next)
  }

  return { categories, loading, addCategory, updateCategory, removeCategory, moveCategory }
}
