import { describe, it, expect, beforeEach } from 'vitest'
import { installMemoryStorage } from './setup-storage.js'
import { questions } from '../src/data/questions.js'
import { computeThemeScores, computeOverallScore } from '../src/utils/scoring.js'
import {
  saveAssessment, loadHistory, buildExport, parseImport, planImport, applyImport,
  sortChrono, SCHEMA_VERSION
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
})
