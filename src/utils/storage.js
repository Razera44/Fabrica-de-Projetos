// Persistência local (localStorage) + formato de exportação/importação.
//
// Modelo persistido (um único array para todas as empresas):
//   { id, date, overall, themeScores, answers?, responsavel, companyName }
//
// As funções "puras" (sem localStorage) ficam exportadas para os testes.

import { THEME_WEIGHTS, OPTION_SCORES, computeOverallScore, computeThemeScores } from './scoring.js'

const COMPANY_KEY = 'segura_empresa'
const HISTORY_KEY = 'segura_historico'
const THEME_KEY = 'segura_tema'

// Máximo de avaliações guardadas POR EMPRESA (o limite de uma empresa
// nunca apaga avaliações de outra).
export const MAX_HISTORY = 200

// Tamanho máximo do nome da empresa (mesmo valor do maxlength do campo).
export const MAX_COMPANY_LENGTH = 80

export const EXPORT_APP = 'segura-diagnostico'
export const SCHEMA_VERSION = 2
// versões que a importação sabe ler (1 = primeiro formato, sem ids)
export const SUPPORTED_SCHEMAS = [1, 2]
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024

const THEMES = Object.keys(THEME_WEIGHTS)

function companyKey(name) {
  return (name || '').trim().toLowerCase()
}

export function sameCompany(a, b) {
  return companyKey(a) === companyKey(b)
}

// ---------------------------------------------------------------------------
// ids e ordenação
// ---------------------------------------------------------------------------

export function newId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch { /* sem crypto */ }
  return 'a-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

// Avaliações antigas não tinham id: deriva um id estável da data + nota,
// para a mesma avaliação receber sempre o mesmo id (e não duplicar).
export function legacyId(entry) {
  return `legacy-${entry.date}-${entry.overall}`
}

function timeOf(entry) {
  const t = new Date(entry.date).getTime()
  return Number.isFinite(t) ? t : NaN
}

// Cronológica; datas iguais mantêm a ordem de gravação (sort estável) e
// nenhuma avaliação é descartada. Datas inválidas vão para o fim.
export function sortChrono(list) {
  return list
    .map((e, i) => ({ e, i, t: timeOf(e) }))
    .sort((a, b) => {
      const an = Number.isNaN(a.t)
      const bn = Number.isNaN(b.t)
      if (an !== bn) return an ? 1 : -1
      if (!an && a.t !== b.t) return a.t - b.t
      return a.i - b.i
    })
    .map(x => x.e)
}

// ---------------------------------------------------------------------------
// acesso ao localStorage
// ---------------------------------------------------------------------------

function readAll() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const data = raw ? JSON.parse(raw) : []
    // descarta o que não é um registro utilizável (null, texto, notas
    // incompletas...): edição manual ou versão antiga não pode quebrar as telas
    return Array.isArray(data) ? data.filter(isUsableEntry) : []
  } catch {
    // localStorage indisponível (anônimo/bloqueado) ou conteúdo corrompido
    return []
  }
}

// Validação leve do que vem do localStorage: só confere o que as telas
// precisam (objeto, nota geral e as notas de todos os temas).
function isUsableEntry(e) {
  if (!e || typeof e !== 'object' || Array.isArray(e)) return false
  if (!isScore(e.overall)) return false
  const ts = e.themeScores
  if (!ts || typeof ts !== 'object' || Array.isArray(ts)) return false
  return THEMES.every(th => isScore(ts[th]))
}

// Aplica o limite por empresa: de cada empresa ficam as MAX_HISTORY
// avaliações mais recentes; as demais empresas não são afetadas.
function trimPerCompany(list) {
  const sorted = sortChrono(list)
  const count = new Map()
  const keep = []
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const key = companyKey(sorted[i].companyName)
    const n = count.get(key) || 0
    if (n < MAX_HISTORY) {
      keep.push(sorted[i])
      count.set(key, n + 1)
    }
  }
  return keep.reverse()
}

function writeAll(list) {
  // lança em caso de falha: quem chama decide como avisar o usuário
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

// Migração silenciosa: registros sem id ganham o id legado.
function migrate(list) {
  let changed = false
  const out = list.map(e => {
    if (e && typeof e === 'object' && !e.id) {
      changed = true
      return { ...e, id: legacyId(e) }
    }
    return e
  })
  return { out, changed }
}

function withDefaults(entry) {
  return { ...entry, responsavel: entry.responsavel || '' }
}

export function loadCompanyName() {
  try { return (localStorage.getItem(COMPANY_KEY) || '').slice(0, MAX_COMPANY_LENGTH) } catch { return '' }
}

export function saveCompanyName(name) {
  try { localStorage.setItem(COMPANY_KEY, String(name || '').slice(0, MAX_COMPANY_LENGTH)) } catch { /* ignorado */ }
}

export function loadTheme() {
  try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark' } catch { return 'dark' }
}

export function saveTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignorado */ }
}

// Histórico persistido de uma empresa, em ordem cronológica.
export function loadHistory(companyName) {
  const { out, changed } = migrate(readAll())
  if (changed) {
    try { writeAll(out) } catch { /* segue com a versão migrada em memória */ }
  }
  return sortChrono(out.filter(e => e && sameCompany(e.companyName, companyName)).map(withDefaults))
}

// Grava uma nova avaliação e devolve { id, history, persisted } da empresa.
// persisted = false quando o navegador não deixou gravar (cota cheia ou
// armazenamento bloqueado): a avaliação existe só em memória, e quem chama
// precisa avisar o usuário.
export function saveAssessment(entry) {
  const { out } = migrate(readAll())
  const record = { ...entry, id: entry.id || newId() }
  out.push(record)
  const trimmed = trimPerCompany(out)
  let persisted = true
  try {
    writeAll(trimmed)
  } catch {
    persisted = false
  }
  return {
    id: record.id,
    history: trimmed.filter(e => sameCompany(e.companyName, entry.companyName)).map(withDefaults),
    persisted
  }
}

// ---------------------------------------------------------------------------
// exportação
// ---------------------------------------------------------------------------

export function buildExport(companyName, entries, questionCount) {
  return {
    app: EXPORT_APP,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    companyName,
    // regras usadas no cálculo, para o arquivo ser autoexplicativo
    scoring: {
      weights: { ...THEME_WEIGHTS },
      optionScores: OPTION_SCORES.slice(),
      questionCount
    },
    // registros com data inválida não fazem parte do modelo exportável
    entries: sortChrono(entries).filter(e => Number.isFinite(timeOf(e))).map(e => {
      const out = {
        id: e.id,
        date: e.date,
        overall: e.overall,
        themeScores: { ...e.themeScores },
        responsavel: e.responsavel || ''
      }
      if (Array.isArray(e.answers)) out.answers = e.answers.slice()
      return out
    })
  }
}

export function exportFileName(companyName, date = new Date()) {
  const slug = (companyName || 'empresa')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const p = n => String(n).padStart(2, '0')
  return `diagnostico-${slug || 'empresa'}-${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

// ---------------------------------------------------------------------------
// importação — validação (pura)
// ---------------------------------------------------------------------------

function isScore(v) {
  return Number.isInteger(v) && v >= 0 && v <= 100
}

// Valida uma avaliação contra as regras reais do cálculo. Devolve
// { entry } ou { error } com a razão legível.
export function validateEntry(raw, questions) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'registro não é um objeto' }

  if (typeof raw.date !== 'string' || !raw.date.trim()) return { error: 'data ausente' }
  const t = new Date(raw.date).getTime()
  if (!Number.isFinite(t)) return { error: `data inválida (${String(raw.date).slice(0, 30)})` }
  if (t > Date.now() + 24 * 3600 * 1000) return { error: 'data no futuro' }

  if (!isScore(raw.overall)) return { error: 'pontuação geral fora de 0–100 ou não inteira' }

  if (!raw.themeScores || typeof raw.themeScores !== 'object') return { error: 'notas por tema ausentes' }
  const themeScores = {}
  for (const th of THEMES) {
    const v = raw.themeScores[th]
    if (!isScore(v)) return { error: `nota de ${th} ausente ou fora de 0–100` }
    themeScores[th] = v
  }
  const extra = Object.keys(raw.themeScores).filter(k => !THEMES.includes(k))
  if (extra.length) return { error: `tema desconhecido: ${extra.join(', ')}` }

  // a nota geral precisa bater com os pesos do app
  const expected = computeOverallScore(themeScores)
  if (Math.abs(expected - raw.overall) > 1) {
    return { error: `pontuação geral ${raw.overall} não confere com as notas por tema (esperado ${expected})` }
  }

  const entry = {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim().slice(0, 80) : null,
    date: new Date(t).toISOString(),
    overall: raw.overall,
    themeScores,
    responsavel: typeof raw.responsavel === 'string' ? raw.responsavel.trim().slice(0, 120) : ''
  }

  if (raw.answers !== undefined) {
    const a = raw.answers
    const okShape = Array.isArray(a) && a.length === questions.length &&
      a.every(x => x === null || x === 0 || x === 1 || x === 2)
    if (!okShape) return { error: `respostas inválidas (esperadas ${questions.length}, valores 0–2)` }
    const fromAnswers = computeThemeScores(questions, a)
    const mismatch = THEMES.find(th => fromAnswers[th] !== themeScores[th])
    if (mismatch) return { error: `respostas não conferem com a nota de ${mismatch}` }
    entry.answers = a.slice()
  }

  if (!entry.id) entry.id = legacyId(entry)
  return { entry }
}

// Lê o texto do arquivo e valida tudo. Nunca lança: devolve
// { ok:false, error } ou { ok:true, schemaVersion, companyName, valid, invalid }.
export function parseImport(text, questions) {
  if (typeof text !== 'string' || !text.trim()) return { ok: false, error: 'O arquivo está vazio.' }
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: 'Arquivo grande demais (máx. 2 MB).' }

  let data
  try {
    data = JSON.parse(text.replace(/^﻿/, ''))
  } catch {
    return { ok: false, error: 'O conteúdo não é um JSON válido.' }
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'Formato não reconhecido: esperado um objeto exportado pelo app.' }
  }
  if (data.app !== undefined && data.app !== EXPORT_APP) {
    return { ok: false, error: `Este arquivo é de outro aplicativo (${String(data.app).slice(0, 40)}).` }
  }

  const version = data.schemaVersion ?? data.version
  if (!SUPPORTED_SCHEMAS.includes(version)) {
    return { ok: false, error: `Versão de formato não suportada (${version ?? 'ausente'}). Suportadas: ${SUPPORTED_SCHEMAS.join(', ')}.` }
  }
  if (!Array.isArray(data.entries)) return { ok: false, error: 'O arquivo não contém a lista de avaliações.' }
  if (!data.entries.length) return { ok: false, error: 'O arquivo não contém nenhuma avaliação.' }
  if (data.entries.length > MAX_HISTORY) {
    return { ok: false, error: `Avaliações demais no arquivo (${data.entries.length}; máx. ${MAX_HISTORY}).` }
  }

  const valid = []
  const invalid = []
  const seen = new Set()
  data.entries.forEach((raw, index) => {
    const r = validateEntry(raw, questions)
    if (r.error) { invalid.push({ index, reason: r.error }); return }
    if (seen.has(r.entry.id)) { invalid.push({ index, reason: 'id repetido dentro do arquivo' }); return }
    seen.add(r.entry.id)
    valid.push(r.entry)
  })

  return {
    ok: true,
    schemaVersion: version,
    companyName: typeof data.companyName === 'string' ? data.companyName : '',
    valid,
    invalid
  }
}

// Duplicada = mesmo id, ou mesma data E mesmas notas (registro sem id).
function isDuplicate(a, b) {
  if (a.id && b.id && a.id === b.id) return true
  return a.date === b.date && a.overall === b.overall &&
    THEMES.every(t => a.themeScores?.[t] === b.themeScores?.[t])
}

// Calcula o que cada estratégia faria, sem gravar nada.
export function planImport(existing, incoming) {
  const toAdd = []
  const duplicates = []
  incoming.forEach(e => {
    if (existing.some(x => isDuplicate(x, e)) || toAdd.some(x => isDuplicate(x, e))) duplicates.push(e)
    else toAdd.push(e)
  })
  return { toAdd, duplicates, existingCount: existing.length }
}

// Aplica a importação. strategy: 'merge' (adiciona só as novas) ou
// 'replace' (o histórico desta empresa passa a ser o do arquivo).
// Grava de uma vez; se falhar, nada é alterado (lança Error).
export function applyImport(companyName, incoming, strategy) {
  const { out: all } = migrate(readAll())
  const mine = all.filter(e => sameCompany(e.companyName, companyName))
  const others = all.filter(e => !sameCompany(e.companyName, companyName))

  let nextMine
  let added
  if (strategy === 'replace') {
    nextMine = incoming.map(e => ({ ...e, companyName }))
    added = incoming.length
  } else if (strategy === 'merge') {
    const plan = planImport(mine, incoming)
    nextMine = mine.concat(plan.toAdd.map(e => ({ ...e, companyName })))
    added = plan.toAdd.length
  } else {
    throw new Error('Estratégia de importação desconhecida.')
  }

  if (nextMine.length > MAX_HISTORY) {
    throw new Error(`A importação ultrapassaria o limite de ${MAX_HISTORY} avaliações por empresa.`)
  }
  const next = sortChrono(others.concat(nextMine))
  try {
    writeAll(next)
  } catch {
    throw new Error('Não foi possível gravar no armazenamento do navegador. Nada foi alterado.')
  }
  return {
    added,
    history: next.filter(e => sameCompany(e.companyName, companyName)).map(withDefaults)
  }
}
