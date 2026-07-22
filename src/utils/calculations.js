export const calculateBMI = (weightKg, heightCm) => {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  return Math.round(bmi * 10) / 10
}

export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#5BA3FF' }
  if (bmi < 25) return { label: 'Healthy', color: '#5BFF9C' }
  if (bmi < 30) return { label: 'Overweight', color: '#FFC15B' }
  return { label: 'Obese', color: '#FF5B5B' }
}

export const getHealthyWeightRange = (heightCm) => {
  const heightM = heightCm / 100
  const min = 18.5 * heightM * heightM
  const max = 24.9 * heightM * heightM
  return { min: Math.round(min * 10) / 10, max: Math.round(max * 10) / 10 }
}

/** Mifflin-St Jeor equation */
export const calculateBMR = ({ weightKg, heightCm, age, gender }) => {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
}

export const calculateTDEE = (bmr, activityLevel) => {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2
  return Math.round(bmr * multiplier)
}

export const calculateGoalCalories = (tdee) => ({
  lose: Math.round(tdee - 500),
  maintain: tdee,
  gain: Math.round(tdee + 350),
})

/** Returns grams of protein/carbs/fat + fiber and water targets for a given calorie goal */
export const calculateMacros = (calories, goal = 'maintain', weightKg = 70) => {
  const ratios = {
    lose: { protein: 0.4, carbs: 0.35, fat: 0.25 },
    maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
    gain: { protein: 0.35, carbs: 0.45, fat: 0.2 },
    athletic: { protein: 0.35, carbs: 0.4, fat: 0.25 },
  }
  const r = ratios[goal] || ratios.maintain
  const protein = Math.round((calories * r.protein) / 4)
  const carbs = Math.round((calories * r.carbs) / 4)
  const fat = Math.round((calories * r.fat) / 9)
  const fiber = Math.round(calories / 1000 * 14)
  const waterLiters = Math.round(weightKg * 0.033 * 10) / 10
  return { protein, carbs, fat, fiber, waterLiters }
}

/** US Navy body fat % formula (needs neckCm, waistCm, and hipCm for females) */
export const calculateBodyFat = ({ gender, heightCm, neckCm, waistCm, hipCm }) => {
  if (gender === 'male') {
    const bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450
    return Math.max(0, Math.round(bf * 10) / 10)
  }
  const bf =
    495 /
      (1.29579 -
        0.35004 * Math.log10(waistCm + (hipCm || 0) - neckCm) +
        0.221 * Math.log10(heightCm)) -
    450
  return Math.max(0, Math.round(bf * 10) / 10)
}

export const bmiSuggestions = (category) => {
  switch (category) {
    case 'Underweight':
      return [
        'Add calorie-dense whole foods like nuts, avocado, and whole grains.',
        'Prioritize strength training to build lean muscle mass.',
        'Eat frequent, smaller meals if appetite is limited.',
      ]
    case 'Healthy':
      return [
        'Maintain your current habits with balanced meals.',
        'Mix strength and cardio training for well-rounded fitness.',
        'Keep tracking progress to catch changes early.',
      ]
    case 'Overweight':
      return [
        'Aim for a moderate calorie deficit of 300-500 kcal/day.',
        'Combine resistance training with steady cardio.',
        'Focus on protein and fiber to stay full longer.',
      ]
    default:
      return [
        'Consult a healthcare provider before starting an intense program.',
        'Start with low-impact cardio and gradually build intensity.',
        'Focus on sustainable nutrition changes over quick fixes.',
      ]
  }
}
