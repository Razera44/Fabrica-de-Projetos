const COMPANY_KEY = 'segura_empresa'
const HISTORY_KEY = 'segura_historico'
const THEME_KEY = 'segura_tema'

// Total de avaliações guardadas, somando TODAS as empresas (cada uma exibe
// só as suas na tela, mas o armazenamento é um único array).
const MAX_HISTORY = 100

function sameCompany(a, b) {
  return (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase()
}

function loadAllHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    // localStorage pode não estar disponível (navegação anônima com
    // cookies/armazenamento bloqueado, política do navegador, etc.)
    return []
  }
}

export function loadCompanyName() {
  try {
    return localStorage.getItem(COMPANY_KEY) || ''
  } catch {
    return ''
  }
}

export function saveCompanyName(name) {
  try {
    localStorage.setItem(COMPANY_KEY, name)
  } catch {
    // silenciosamente ignorado — ver loadCompanyName
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // silenciosamente ignorado — ver loadCompanyName
  }
}

// Avaliações salvas antes do campo "Responsável" não têm a propriedade:
// aqui ela ganha o valor vazio, sem mexer no que está gravado.
function withDefaults(entry) {
  return { ...entry, responsavel: entry.responsavel || '' }
}

// Histórico de uma empresa específica. Cada avaliação salva carrega o nome
// da empresa junto, então o "Histórico de avaliações" de uma empresa nunca
// mistura notas de outra.
export function loadHistory(companyName) {
  const all = loadAllHistory()
  return all.filter(entry => sameCompany(entry.companyName, companyName)).map(withDefaults)
}

export function saveAssessment(entry) {
  const all = loadAllHistory()
  all.push(entry)

  // mantém só as avaliações mais recentes (de todas as empresas)
  const trimmed = all.slice(-MAX_HISTORY)

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
  } catch {
    // não foi possível salvar, mas devolve o histórico calculado mesmo
    // assim — a tela de resultados já teve o dado pra exibir
  }

  return trimmed.filter(e => sameCompany(e.companyName, entry.companyName)).map(withDefaults)
}

// ---------------------------------------------------------------------------
// Exportar / importar o histórico em JSON. O localStorage é por navegador:
// o arquivo é o jeito de levar a evolução para outra máquina ou guardar
// um backup (o próprio app cobra isso no tema Backup 🙂).
// ---------------------------------------------------------------------------

const EXPORT_APP = 'segura-diagnostico'
const EXPORT_VERSION = 1
const THEMES = ['Backup', 'Senhas', 'Antivírus', 'LGPD']

export function buildHistoryExport(companyName) {
  return {
    app: EXPORT_APP,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    companyName,
    entries: loadHistory(companyName)
  }
}

function sanitizeEntry(raw, questionCount) {
  if (!raw || typeof raw !== 'object') return null
  const date = new Date(raw.date)
  if (isNaN(date)) return null
  const overall = Number(raw.overall)
  if (!Number.isFinite(overall) || overall < 0 || overall > 100) return null
  if (!raw.themeScores || typeof raw.themeScores !== 'object') return null

  const themeScores = {}
  for (const t of THEMES) {
    const v = Number(raw.themeScores[t])
    if (!Number.isFinite(v) || v < 0 || v > 100) return null
    themeScores[t] = Math.round(v)
  }

  const entry = {
    date: date.toISOString(),
    overall: Math.round(overall),
    themeScores,
    responsavel: typeof raw.responsavel === 'string' ? raw.responsavel.slice(0, 120) : ''
  }

  const ok = Array.isArray(raw.answers) &&
    raw.answers.length === questionCount &&
    raw.answers.every(a => a === null || a === 0 || a === 1 || a === 2)
  if (ok) entry.answers = raw.answers.slice()

  return entry
}

// Mescla as avaliações do arquivo no histórico da empresa atual (o arquivo
// pode ter vindo de outro nome/grafia). Avaliações com a mesma data são
// tratadas como a mesma e não duplicam.
export function importHistory(data, companyName, questionCount) {
  const list = Array.isArray(data) ? data : data?.entries
  if (!Array.isArray(list)) {
    throw new Error('Arquivo não reconhecido: não há uma lista de avaliações.')
  }

  const valid = list.map(e => sanitizeEntry(e, questionCount)).filter(Boolean)
  if (!valid.length) {
    throw new Error('Nenhuma avaliação válida encontrada no arquivo.')
  }

  const all = loadAllHistory()
  const existing = new Set(
    all.filter(e => sameCompany(e.companyName, companyName)).map(e => new Date(e.date).toISOString())
  )

  let added = 0
  valid.forEach(entry => {
    if (existing.has(entry.date)) return
    existing.add(entry.date)
    all.push({ ...entry, companyName })
    added += 1
  })

  all.sort((a, b) => new Date(a.date) - new Date(b.date))
  const trimmed = all.slice(-MAX_HISTORY)

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
  } catch {
    throw new Error('Não foi possível gravar no armazenamento do navegador.')
  }

  return {
    added,
    skipped: valid.length - added,
    invalid: list.length - valid.length,
    history: trimmed.filter(e => sameCompany(e.companyName, companyName)).map(withDefaults)
  }
}
