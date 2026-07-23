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
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider, setAuthPersistence } from '../firebase/config'
import { readLocalData, writeLocalData } from '../services/localDataService'
import { initializeUserJournal } from '../services/firestoreService'

export const AuthContext = createContext(null)

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
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        currentProfile = docSnap.data()
        setProfile(currentProfile)
        // 3. Update the local cache so it's ready for next time
        await writeLocalData(uid, 'profile', currentProfile)
      }
    } catch (error) {
      console.error('Error fetching profile from Firestore:', error)
    }

    return currentProfile
  }, [])

  // Helper function to sync a brand new user across both DBs (especially useful for Google Auth)
  const syncNewUserToFirestore = async (firebaseUser, provider) => {
    try {
      const docRef = doc(db, 'users', firebaseUser.uid)
      const docSnap = await getDoc(docRef)
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
        await setDoc(docRef, profileData)
      } else {
        profileData = docSnap.data()
      }

      // Save to local cache
      await writeLocalData(firebaseUser.uid, 'profile', profileData)
      setProfile(profileData)
    } catch (error) {
      console.error('Error syncing new user to Firestore:', error)
    }
  }

  useEffect(() => {
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

    const cred = await signInWithPopup(auth, googleProvider)
    setUser(cred.user)

    await syncNewUserToFirestore(cred.user, 'google')
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