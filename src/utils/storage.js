const COMPANY_KEY = 'segura_empresa'
const HISTORY_KEY = 'segura_historico'

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

// Histórico de uma empresa específica. Cada avaliação salva carrega o nome
// da empresa junto, então o "Histórico de avaliações" de uma empresa nunca
// mistura notas de outra.
export function loadHistory(companyName) {
  const all = loadAllHistory()
  return all.filter(entry => sameCompany(entry.companyName, companyName))
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

  return trimmed.filter(e => sameCompany(e.companyName, entry.companyName))
}
