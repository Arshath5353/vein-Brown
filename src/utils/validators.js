export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const isStrongPassword = (password) => password.length >= 6

export const passwordStrength = (password) => {
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 1) return { score, label: 'Weak', color: '#FF5B5B' }
  if (score <= 3) return { score, label: 'Fair', color: '#FFC15B' }
  return { score, label: 'Strong', color: '#5BFF9C' }
}
