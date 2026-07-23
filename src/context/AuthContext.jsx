import { createContext, useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider, setAuthPersistence } from '../firebase/config'
import { readLocalData, writeLocalData } from '../services/localDataService'
import { initializeUserJournal } from '../services/firestoreService'

export const AuthContext = createContext(null)

const withTimeout = (promise, ms = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms))
  ])
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // FIX: Stale-while-revalidate strategy using Firestore as the Source of Truth
  const fetchProfile = useCallback(async (uid) => {
    // 1. Try local cache first for instant UI response (prevents stutter)
    let currentProfile = await readLocalData(uid, 'profile')
    if (currentProfile) {
      setProfile(currentProfile)
    }

    // 2. Fetch remote truth from Firestore to handle new devices or cleared caches
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await withTimeout(getDoc(docRef), 3000)

      if (docSnap.exists()) {
        currentProfile = docSnap.data()
        setProfile(currentProfile)
        // 3. Update the local cache so it's ready for next time
        await writeLocalData(uid, 'profile', currentProfile)
      } else {
        // Handle case where user exists in Auth but has no Firestore profile 
        // (e.g., interrupted sign up, legacy user, iOS Safari redirect bug)
        console.warn('Profile not found in Firestore. Creating fallback.')
        currentProfile = {
          uid: uid,
          name: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Welcome Back',
          email: auth.currentUser?.email,
          photoURL: auth.currentUser?.photoURL || null,
          onboardingComplete: false,
          createdAt: Date.now(),
          provider: 'unknown',
        }
        setProfile(currentProfile)

        // Asynchronously try to repair their firestore document
        setDoc(docRef, currentProfile).catch(err => console.error('Failed to repair profile in Firestore:', err))
        await writeLocalData(uid, 'profile', currentProfile)
      }
    } catch (error) {
      console.error('Error fetching profile from Firestore:', error)
    }

    return currentProfile
  }, [])

  const syncNewUserToFirestore = async (firebaseUser, provider) => {
    try {
      const docRef = doc(db, 'users', firebaseUser.uid)
      const docSnap = await withTimeout(getDoc(docRef), 3000)
      let profileData

      if (!docSnap.exists()) {
        profileData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Welcome Back',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          onboardingComplete: false,
          createdAt: Date.now(),
          provider: provider,
        }
        // Save to Firestore so it exists globally
        await withTimeout(setDoc(docRef, profileData), 3000)
      } else {
        profileData = docSnap.data()
      }

      // Save to local cache
      await writeLocalData(firebaseUser.uid, 'profile', profileData)
      setProfile(profileData)
    } catch (error) {
      console.error('Error syncing new user to Firestore (likely unprovisioned or offline):', error)

      // Still populate locally so they can use the app even if Firestore is down/unprovisioned
      const profileData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Welcome Back',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || null,
        onboardingComplete: false,
        createdAt: Date.now(),
        provider: provider,
      }
      await writeLocalData(firebaseUser.uid, 'profile', profileData)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    // Specifically to handle iOS PWA/Mobile redirect flows seamlessly
    const handleRedirectResult = async () => {
      try {
        const cred = await getRedirectResult(auth)
        if (cred?.user) {
          toast.success('Google Auth Return Success!')
          await syncNewUserToFirestore(cred.user, 'google')
        } else {
          // It frequently returns null on first load, so we won't toast here normally.
          // But to be sure it ran:
          // console.log('Redirect result null')
        }
      } catch (error) {
        toast.error('Auth Error: ' + error.message)
        console.error('Google Redirect result error:', error)
      }
    }

    handleRedirectResult()

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      try {
        if (firebaseUser) {
          // fetchProfile returns immediately if syncNewUserToFirestore already loaded the cache
          await fetchProfile(firebaseUser.uid)
          await initializeUserJournal(firebaseUser.uid)
        } else {
          setProfile(null)
        }
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [fetchProfile])

  const signup = async ({ name, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    setUser(cred.user)

    await updateProfile(cred.user, { displayName: name })
    await sendEmailVerification(cred.user)

    // Create baseline data and sync it immediately to Firestore
    const profileData = {
      uid: cred.user.uid,
      name,
      email,
      photoURL: cred.user.photoURL || null,
      onboardingComplete: false,
      createdAt: Date.now(),
      provider: 'password',
    }

    await setDoc(doc(db, 'users', cred.user.uid), profileData)
    await writeLocalData(cred.user.uid, 'profile', profileData)
    setProfile(profileData)

    return cred.user
  }

  const login = async ({ email, password, rememberMe = true }) => {
    await setAuthPersistence(rememberMe)
    const cred = await signInWithEmailAndPassword(auth, email, password)

    setUser(cred.user)
    await fetchProfile(cred.user.uid)

    return cred.user
  }

  const loginWithGoogle = async () => {
    await setAuthPersistence(true)

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone

    if (isMobile || isPWA) {
      await signInWithRedirect(auth, googleProvider)
      return null // Browser will redirect and reload
    } else {
      const cred = await signInWithPopup(auth, googleProvider)
      setUser(cred.user)
      await syncNewUserToFirestore(cred.user, 'google')
      return cred.user
    }
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