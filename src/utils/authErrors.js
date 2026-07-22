export const mapAuthError = (code) => {
  switch (code) {
    case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.'
    case 'auth/popup-blocked': return 'Allow pop-ups for this site, then try again.'
    case 'auth/unauthorized-domain': return 'This domain is not authorized in Firebase Authentication.'
    case 'auth/operation-not-allowed': return 'Enable Google as a sign-in provider in Firebase Authentication.'
    case 'auth/account-exists-with-different-credential': return 'An account already exists with this email. Sign in with its original method.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Incorrect email or password.'
    case 'auth/email-already-in-use': return 'An account with this email already exists.'
    case 'auth/weak-password': return 'Password should be at least 6 characters.'
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.'
    default: return 'Something went wrong. Please try again.'
  }
}
