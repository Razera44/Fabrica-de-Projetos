import { describe, it, expect, beforeEach } from 'vitest'
import { installMemoryStorage } from './setup-storage.js'
import { questions } from '../src/data/questions.js'
import { computeThemeScores, computeOverallScore } from '../src/utils/scoring.js'
import {
  saveAssessment, loadHistory, buildExport, parseImport, planImport, applyImport,
  sortChrono, loadCompanyName, saveCompanyName, SCHEMA_VERSION, MAX_HISTORY, MAX_COMPANY_LENGTH
} from '../src/utils/storage.js'

function entry(date, answers, extra = {}) {
  const themeScores = computeThemeScores(questions, answers)
  return { date, overall: computeOverallScore(themeScores), themeScores, answers, companyName: 'ACME', responsavel: 'Ana', ...extra }
}
const ALL_GOOD = new Array(20).fill(0)
const ALL_BAD = new Array(20).fill(2)
const MID = new Array(20).fill(1)

describe('armazenamento e exportação/importação', () => {
  let store
  beforeEach(() => { store = installMemoryStorage() })

  it('salva com id e devolve o histórico em ordem cronológica', () => {
    saveAssessment(entry('2026-03-01T10:00:00Z', MID))
    const r = saveAssessment(entry('2026-01-01T10:00:00Z', ALL_GOOD))
    expect(r.id).toBeTruthy()
    expect(r.history.map(e => e.date)).toEqual(['2026-01-01T10:00:00Z', '2026-03-01T10:00:00Z'])
  })

  it('mesma data não descarta nenhuma avaliação', () => {
    saveAssessment(entry('2026-01-01T10:00:00Z', MID))
    saveAssessment(entry('2026-01-01T10:00:00Z', ALL_GOOD))
    expect(loadHistory('acme')).toHaveLength(2)
  })

  it('migra registros antigos sem id', () => {
    const old = entry('2026-01-01T10:00:00Z', MID); delete old.answers
    store.set('segura_historico', JSON.stringify([old]))
    const h = loadHistory('ACME')
    expect(h[0].id).toMatch(/^legacy-/)
  })

  it('exportação gera JSON versionado que reimporta sem perdas', () => {
    saveAssessment(entry('2026-01-01T10:00:00Z', ALL_GOOD))
    saveAssessment(entry('2026-02-01T10:00:00Z', ALL_BAD))
    const h = loadHistory('ACME')
    const text = JSON.stringify(buildExport('ACME', h, 20))
    const r = parseImport(text, questions)
    expect(r.ok).toBe(true)
    expect(r.schemaVersion).toBe(SCHEMA_VERSION)
    expect(r.invalid).toHaveLength(0)
    expect(r.valid.map(e => e.id)).toEqual(h.map(e => e.id))
    expect(r.valid[1].answers).toEqual(ALL_BAD)
  })

  it('restaura (substituir) o histórico a partir do arquivo exportado', () => {
    saveAssessment(entry('2026-01-01T10:00:00Z', ALL_GOOD))
    const text = JSON.stringify(buildExport('ACME', loadHistory('ACME'), 20))
    saveAssessment(entry('2026-05-01T10:00:00Z', ALL_BAD))
    const r = parseImport(text, questions)
    const res = applyImport('ACME', r.valid, 'replace')
    expect(res.history).toHaveLength(1)
    expect(loadHistory('ACME')[0].overall).toBe(100)
  })

  it('JSON inválido não altera o histórico', () => {
    saveAssessment(entry('2026-01-01T10:00:00Z', ALL_GOOD))
    const before = store.get('segura_historico')
    expect(parseImport('{ quebrado', questions).ok).toBe(false)
    expect(parseImport('', questions).ok).toBe(false)
    expect(parseImport('[]', questions).ok).toBe(false)
    expect(parseImport(JSON.stringify({ schemaVersion: 99, entries: [] }), questions).ok).toBe(false)
    expect(parseImport(JSON.stringify({ app: 'outro', schemaVersion: 2, entries: [] }), questions).ok).toBe(false)
    expect(store.get('segura_historico')).toBe(before)
  })

  it('rejeita registros incoerentes e aceita parcialmente o resto', () => {
    const good = entry('2026-01-01T10:00:00Z', ALL_GOOD, { id: 'a' })
    const badOverall = { ...entry('2026-01-02T10:00:00Z', MID, { id: 'b' }), overall: 99 }
    const badDate = { ...entry('2026-01-03T10:00:00Z', MID, { id: 'c' }), date: 'ontem' }
    const badScore = { ...entry('2026-01-04T10:00:00Z', MID, { id: 'd' }), themeScores: { Backup: 150, Senhas: 50, Antivírus: 50, LGPD: 50 } }
    const badAnswers = { ...entry('2026-01-05T10:00:00Z', MID, { id: 'e' }), answers: ALL_GOOD }
    const r = parseImport(JSON.stringify({ schemaVersion: 2, entries: [good, badOverall, badDate, badScore, badAnswers] }), questions)
    expect(r.ok).toBe(true)
    expect(r.valid.map(e => e.id)).toEqual(['a'])
    expect(r.invalid.map(i => i.index)).toEqual([1, 2, 3, 4])
  })

  it('mesclar ignora duplicadas (estratégia explícita)', () => {
    saveAssessment(entry('2026-01-01T10:00:00Z', ALL_GOOD))
    const h = loadHistory('ACME')
    const r = parseImport(JSON.stringify(buildExport('ACME', h, 20)), questions)
    const plan = planImport(h, r.valid)
    expect(plan.toAdd).toHaveLength(0)
    expect(plan.duplicates).toHaveLength(1)
    const res = applyImport('ACME', r.valid, 'merge')
    expect(res.added).toBe(0)
    expect(loadHistory('ACME')).toHaveLength(1)
  })

  it('aceita o formato v1 (sem ids)', () => {
    const v1 = { app: 'segura-diagnostico', version: 1, entries: [{ date: '2026-01-01T10:00:00Z', overall: 52, themeScores: { Backup: 20, Senhas: 50, Antivírus: 70, LGPD: 80 } }] }
    const r = parseImport(JSON.stringify(v1), questions)
    expect(r.ok).toBe(true)
    expect(r.valid[0].id).toMatch(/^legacy-/)
  })

  it('sortChrono põe datas inválidas no fim', () => {
    const s = sortChrono([{ date: 'x' }, { date: '2026-02-01' }, { date: '2026-01-01' }])
    expect(s.map(e => e.date)).toEqual(['2026-01-01', '2026-02-01', 'x'])
  })

  // --- auditoria de validações ------------------------------------------

  it('elementos null/lixo no histórico salvo não quebram leitura, gravação nem importação', () => {
    const good = { ...entry('2026-01-01T10:00:00Z', MID), id: 'ok' }
    store.set('segura_historico', JSON.stringify([null, 5, 'texto', [], good]))
    expect(loadHistory('ACME')).toHaveLength(1)
    expect(() => saveAssessment(entry('2026-02-01T10:00:00Z', ALL_GOOD))).not.toThrow()
    store.set('segura_historico', JSON.stringify([null, good]))
    const incoming = parseImport(JSON.stringify(buildExport('ACME', [entry('2026-03-01T10:00:00Z', ALL_BAD, { id: 'novo' })], 20)), questions).valid
    expect(() => applyImport('ACME', incoming, 'merge')).not.toThrow()
    expect(loadHistory('ACME').map(e => e.id)).toEqual(['ok', 'novo'])
  })

  it('descarta ao ler registros com notas incompletas ou inválidas', () => {
    const good = { ...entry('2026-01-01T10:00:00Z', MID), id: 'ok' }
    const semTema = { ...entry('2026-01-02T10:00:00Z', MID), id: 'a', themeScores: { Backup: 50, Senhas: 50 } }
    const semNotas = { ...entry('2026-01-03T10:00:00Z', MID), id: 'b', themeScores: undefined }
    const overallTexto = { ...entry('2026-01-04T10:00:00Z', MID), id: 'c', overall: '50' }
    store.set('segura_historico', JSON.stringify([semTema, good, semNotas, overallTexto]))
    expect(loadHistory('ACME').map(e => e.id)).toEqual(['ok'])
  })

  it('avisa quando não consegue gravar (persisted = false) e mantém a avaliação em memória', () => {
    const ok = saveAssessment(entry('2026-01-01T10:00:00Z', MID))
    expect(ok.persisted).toBe(true)

    globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError') }
    const r = saveAssessment(entry('2026-02-01T10:00:00Z', ALL_GOOD))
    expect(r.persisted).toBe(false)
    expect(r.history).toHaveLength(2)
    expect(r.history.some(e => e.id === r.id)).toBe(true)
  })

  it('o limite de avaliações vale por empresa e não apaga dados de outra', () => {
    const day = 24 * 3600 * 1000
    const base = Date.UTC(2025, 0, 1)
    const many = Array.from({ length: MAX_HISTORY }, (_, i) =>
      ({ ...entry(new Date(base + i * day).toISOString(), MID), id: `a-${i}` }))
    store.set('segura_historico', JSON.stringify(many))

    // outra empresa não descarta nada da ACME
    saveAssessment(entry('2026-06-01T10:00:00Z', ALL_GOOD, { companyName: 'Outra' }))
    expect(loadHistory('ACME')).toHaveLength(MAX_HISTORY)
    expect(loadHistory('Outra')).toHaveLength(1)

    // a própria empresa passa do limite: só a mais antiga dela sai
    saveAssessment(entry('2026-07-01T10:00:00Z', ALL_BAD))
    const acme = loadHistory('ACME')
    expect(acme).toHaveLength(MAX_HISTORY)
    expect(acme[0].id).toBe('a-1')
    expect(loadHistory('Outra')).toHaveLength(1)
  })

  it('importar para uma empresa não esbarra no limite causado por outras empresas', () => {
    const day = 24 * 3600 * 1000
    const base = Date.UTC(2025, 0, 1)
    const many = Array.from({ length: MAX_HISTORY }, (_, i) =>
      ({ ...entry(new Date(base + i * day).toISOString(), MID, { companyName: 'Outra' }), id: `o-${i}` }))
    store.set('segura_historico', JSON.stringify(many))
    const incoming = parseImport(JSON.stringify(buildExport('ACME', [entry('2026-03-01T10:00:00Z', ALL_BAD, { id: 'novo' })], 20)), questions).valid
    const res = applyImport('ACME', incoming, 'merge')
    expect(res.added).toBe(1)
    expect(loadHistory('Outra')).toHaveLength(MAX_HISTORY)
  })

  it('nome da empresa é limitado a 80 caracteres ao ser lido', () => {
    saveCompanyName('x'.repeat(200))
    expect(loadCompanyName()).toHaveLength(MAX_COMPANY_LENGTH)
    expect(MAX_COMPANY_LENGTH).toBe(80)
  })
})
