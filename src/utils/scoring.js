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

// Área do polígono do radar em relação ao máximo possível (todos os temas
// em 100). Com eixos igualmente espaçados a área é proporcional à soma dos
// produtos de vizinhos — então dá pra comparar sem trigonometria.
export function radarCoverage(themeScores) {
  const v = Object.keys(THEME_WEIGHTS).map(t => themeScores?.[t] ?? 0)
  const n = v.length
  let sum = 0
  for (let i = 0; i < n; i += 1) sum += v[i] * v[(i + 1) % n]
  return Math.round((sum / (n * 10000)) * 100)
}

// Diferença entre a nota mais alta e a mais baixa: quanto menor, mais
// equilibrada está a proteção entre os temas.
export function scoreSpread(themeScores) {
  const v = Object.keys(THEME_WEIGHTS).map(t => themeScores?.[t] ?? 0)
  return Math.max(...v) - Math.min(...v)
}

// Nível de segurança de uma resposta, na mesma escala da pontuação: cada
// pergunta lista as opções da mais segura (100) para a mais arriscada (0).
// Devolve null quando a resposta não existe ou não é uma opção da pergunta.
export function answerScore(question, option) {
  if (!Number.isInteger(option)) return null
  if (option < 0 || option >= question.options.length) return null
  return OPTION_SCORES[option] ?? null
}

// Situação de uma pergunta entre duas avaliações: 'improved', 'worsened',
// 'same' ou 'unrated' (falta resposta em um dos lados, então não dá para
// afirmar que houve melhora, piora ou estabilidade).
export function classifyChange(question, before, now) {
  const a = answerScore(question, now)
  const b = answerScore(question, before)
  if (a === null || b === null) return 'unrated'
  if (a > b) return 'improved'
  if (a < b) return 'worsened'
  return 'same'
}

// Compara resposta a resposta. Cada pergunta cai em exatamente um grupo;
// `same` continua sendo a contagem de iguais.
export function diffAnswers(questions, current, previous) {
  if (!Array.isArray(current) || !Array.isArray(previous)) return null
  const improved = []
  const worsened = []
  const unchanged = []
  const unrated = []
  const label = (q, option) => (answerScore(q, option) === null ? 'Sem resposta' : q.options[option])
  questions.forEach((q, i) => {
    const status = classifyChange(q, previous[i], current[i])
    const item = {
      index: i,
      theme: q.theme,
      text: q.text,
      status,
      before: label(q, previous[i]),
      now: label(q, current[i]),
      points: status === 'unrated' ? null : answerScore(q, current[i]) - answerScore(q, previous[i])
    }
    if (status === 'improved') improved.push(item)
    else if (status === 'worsened') worsened.push(item)
    else if (status === 'same') unchanged.push(item)
    else unrated.push(item)
  })
  return { improved, worsened, unchanged, unrated, same: unchanged.length }
}
