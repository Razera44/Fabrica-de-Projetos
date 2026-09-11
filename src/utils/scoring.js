import { actionLibrary } from '../data/actionLibrary.js'

export const THEME_WEIGHTS = {
  Backup: 0.30,
  Senhas: 0.25,
  Antivírus: 0.20,
  LGPD: 0.25
}

export const OPTION_SCORES = [100, 50, 0]

export function computeThemeScores(questions, answers) {
  const grouped = {}
  Object.keys(THEME_WEIGHTS).forEach(theme => { grouped[theme] = [] })

  questions.forEach((question, index) => {
    const selected = answers[index]
    const value = selected === null || selected === undefined ? 0 : OPTION_SCORES[selected]
    grouped[question.theme].push(value)
  })

  const themeScores = {}
  Object.keys(grouped).forEach(theme => {
    const values = grouped[theme]
    const sum = values.reduce((a, b) => a + b, 0)
    themeScores[theme] = Math.round(sum / values.length)
  })

  return themeScores
}

export function computeOverallScore(themeScores) {
  let total = 0
  Object.keys(THEME_WEIGHTS).forEach(theme => {
    total += themeScores[theme] * THEME_WEIGHTS[theme]
  })
  return Math.round(total)
}

export function getWeakestTheme(themeScores) {
  let weakest = Object.keys(themeScores)[0]
  Object.keys(themeScores).forEach(theme => {
    if (themeScores[theme] < themeScores[weakest]) weakest = theme
  })
  return weakest
}

export function getTier(score) {
  if (score < 40) return { label: 'Risco alto', tone: 'crit' }
  if (score < 70) return { label: 'Risco moderado', tone: 'warn' }
  return { label: 'Risco baixo', tone: 'safe' }
}

export function buildActionPlan(themeScores) {
  const items = Object.keys(themeScores).map(theme => {
    const score = themeScores[theme]
    const tone = getTier(score).tone
    const action = actionLibrary[theme][tone]
    return { theme, score, tone, title: action.title, desc: action.desc }
  })
  items.sort((a, b) => a.score - b.score)
  return items
}
