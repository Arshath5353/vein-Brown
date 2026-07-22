import { createContext, useEffect, useState, useCallback } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider, setAuthPersistence } from '../firebase/config'
import { readLocalData, writeLocalData } from '../services/localDataService'
import { initializeUserJournal } from '../services/firestoreService'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (uid) => {
    const localProfile = await readLocalData(uid, 'profile')
    setProfile(localProfile)
    return localProfile
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      try {
        if (firebaseUser) { await fetchProfile(firebaseUser.uid); await initializeUserJournal(firebaseUser.uid) }
        else setProfile(null)
      } finally {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [fetchProfile])

  const signup = async ({ name, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await sendEmailVerification(cred.user)
    await writeLocalData(cred.user.uid, 'profile', {
      uid: cred.user.uid,
      name,
      email,
      photoURL: cred.user.photoURL || null,
      onboardingComplete: false,
      createdAt: Date.now(),
      provider: 'password',
    })
    await fetchProfile(cred.user.uid)
    return cred.user
  }

  const login = async ({ email, password, rememberMe = true }) => {
    await setAuthPersistence(rememberMe)
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await fetchProfile(cred.user.uid)
    return cred.user
  }

  const loginWithGoogle = async () => {
    await setAuthPersistence(true)
    const cred = await signInWithPopup(auth, googleProvider)
    const existing = await readLocalData(cred.user.uid, 'profile')
    if (!existing) {
      await writeLocalData(cred.user.uid, 'profile', {
        uid: cred.user.uid,
        name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Welcome Back',
        email: cred.user.email,
        photoURL: cred.user.photoURL || null,
        onboardingComplete: false,
        createdAt: Date.now(),
        provider: 'google',
      })
    }
    await fetchProfile(cred.user.uid)
    return cred.user
  }

  const logout = () => signOut(auth)

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const resendVerification = () => {
    if (auth.currentUser) return sendEmailVerification(auth.currentUser)
    return Promise.resolve()
  }

  const refreshProfile = () => (user ? fetchProfile(user.uid) : Promise.resolve(null))

  const value = {
    user,
    profile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    resendVerification,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
