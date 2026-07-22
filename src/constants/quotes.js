export const QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "The pain of discipline weighs ounces; the pain of regret weighs tons.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Small daily improvements lead to staggering long-term results.",
  "Champions keep playing until they get it right.",
  "The only bad workout is the one that didn't happen.",
  "Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.",
]

export const quoteOfTheDay = () => {
  const dayIndex = new Date().getDate() % QUOTES.length
  return QUOTES[dayIndex]
}
