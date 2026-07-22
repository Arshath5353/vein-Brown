import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Globe, Trash2, LogOut, ShieldCheck, Mail, Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { deleteUser } from 'firebase/auth'
import { auth } from '../firebase/config'
import { clearUserLocalData, exportUserLocalData, importUserLocalData } from '../services/localDataService'
import { useAuth } from '../hooks/useAuth'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-white/10'}`}
  >
    <span
      className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0.5'
      }`}
    />
  </button>
)

const Settings = () => {
  const { user, logout, resendVerification } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('English')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const downloadBackup = async () => {
    const backup = await exportUserLocalData(user.uid)
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = `vein-brown-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url)
    toast.success('Backup exported.')
  }
  const downloadCsv = async () => {
    const backup = await exportUserLocalData(user.uid)
    const records = Object.values(backup.data['daily-records'] || {})
    const headers = ['date', 'calories', 'protein', 'carbohydrates', 'fat', 'waterIntake', 'weight', 'bmi', 'steps', 'workoutDuration', 'sleepDuration']
    const csv = [headers.join(','), ...records.map((record) => headers.map((key) => JSON.stringify(record[key] ?? '')).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a'); link.href = url; link.download = 'vein-brown-daily-history.csv'; link.click(); URL.revokeObjectURL(url)
    toast.success('Daily history exported as CSV.')
  }
  const importBackup = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try { await importUserLocalData(user.uid, JSON.parse(await file.text())); toast.success('Backup merged safely. Refresh to view imported data.') } catch (error) { toast.error(error.message || 'Could not import that file.') }
    event.target.value = ''
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await clearUserLocalData(user.uid)
      await deleteUser(auth.currentUser)
      toast.success('Account deleted.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error('Please log in again before deleting your account, then retry.')
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div className="page-shell max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <Card className="mt-5 divide-y divide-white/5">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-ink-muted" />
            <span className="text-sm font-medium">Notifications</span>
          </div>
          <Toggle checked={notifications} onChange={setNotifications} />
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-ink-muted" />
            <span className="text-sm font-medium">Language</span>
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-lg bg-card-hover px-3 py-1.5 text-sm">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Hindi</option>
          </select>
        </div>
        {!user?.emailVerified && (
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-ink-muted" />
              <span className="text-sm font-medium">Email not verified</span>
            </div>
            <button
              onClick={() => {
                resendVerification()
                toast.success('Verification email sent.')
              }}
              className="text-sm font-medium text-accent hover:underline"
            >
              Resend
            </button>
          </div>
        )}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-ink-muted" />
            <span className="text-sm font-medium">Privacy & Security</span>
          </div>
          <span className="text-xs text-ink-faint">Your data is private to you</span>
        </div>
      </Card>

      <Card className="mt-5">
        <div className="mb-3 flex flex-wrap gap-2 border-b border-white/5 pb-4">
          <Button variant="secondary" className="w-auto px-4" icon={Download} onClick={downloadBackup}>Export JSON</Button>
          <Button variant="secondary" className="w-auto px-4" icon={Download} onClick={downloadCsv}>Export CSV</Button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl2 border border-white/10 px-4 py-2.5 text-sm font-medium text-ink-muted hover:text-white"><Upload className="h-4 w-4" /> Import backup<input type="file" accept="application/json" className="hidden" onChange={importBackup} /></label>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-3 py-2 text-sm font-medium text-ink-muted hover:text-white">
          <LogOut className="h-5 w-5" /> Log out
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-2 flex w-full items-center gap-3 py-2 text-sm font-medium text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-5 w-5" /> Delete account
        </button>
      </Card>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete your account?">
        <p className="text-sm text-ink-muted">
          This permanently deletes your Vein Brown profile and data. This action cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} loading={deleting} className="!bg-red-500 !shadow-none">Delete</Button>
        </div>
      </Modal>
    </div>
  )
}

export default Settings
