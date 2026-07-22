import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { addLog, getLogs, deleteLog } from '../services/firestoreService'
import toast from 'react-hot-toast'

/**
 * useLogCollection('waterLogs') -> { logs, loading, add, remove, refresh }
 */
export const useLogCollection = (collectionName, days = 30) => {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getLogs(user.uid, collectionName, days)
      setLogs(data)
    } catch (err) {
      toast.error('Could not load your data.')
    } finally {
      setLoading(false)
    }
  }, [user, collectionName, days])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = async (payload) => {
    if (!user) return
    try {
      await addLog(user.uid, collectionName, payload)
      await refresh()
      toast.success('Saved!')
    } catch (err) {
      toast.error('Something went wrong.')
    }
  }

  const remove = async (logId) => {
    if (!user) return
    try {
      await deleteLog(user.uid, collectionName, logId)
      await refresh()
    } catch (err) {
      toast.error('Could not delete entry.')
    }
  }

  return { logs, loading, add, remove, refresh }
}
