import { describe, it, expect } from 'vitest'
import { questions } from '../src/data/questions.js'
import { computeThemeScores, computeOverallScore, getTier, diffAnswers, classifyChange, radarCoverage } from '../src/utils/scoring.js'

describe('pontuação', () => {
  it('todas as respostas mais seguras dão 100 em tudo', () => {
    const t = computeThemeScores(questions, new Array(20).fill(0))
    expect(Object.values(t)).toEqual([100, 100, 100, 100])
    expect(computeOverallScore(t)).toBe(100)
  })

  it('sem resposta conta como 0', () => {
    const t = computeThemeScores(questions, new Array(20).fill(null))
    expect(computeOverallScore(t)).toBe(0)
  })

  it('aplica os pesos (Backup 30, Senhas 25, Antivírus 20, LGPD 25)', () => {
    expect(computeOverallScore({ Backup: 100, Senhas: 0, Antivírus: 0, LGPD: 0 })).toBe(30)
    expect(computeOverallScore({ Backup: 20, Senhas: 50, Antivírus: 70, LGPD: 80 })).toBe(53)
  })

  it('faixas de risco seguem getTier (<40 alto, <70 moderado)', () => {
    expect(getTier(39).tone).toBe('crit')
    expect(getTier(40).tone).toBe('warn')
    expect(getTier(69).tone).toBe('warn')
    expect(getTier(70).tone).toBe('safe')
  })

  it('cobertura do radar: 100% só com tudo em 100', () => {
    expect(radarCoverage({ Backup: 100, Senhas: 100, Antivírus: 100, LGPD: 100 })).toBe(100)
    expect(radarCoverage({ Backup: 0, Senhas: 100, Antivírus: 0, LGPD: 100 })).toBe(0)
  })

  it('diffAnswers separa melhoras e pioras', () => {
    const prev = new Array(20).fill(1)
    const now = prev.slice(); now[0] = 0; now[1] = 2
    const d = diffAnswers(questions, now, prev)
    expect(d.improved.map(x => x.index)).toEqual([0])
    expect(d.worsened.map(x => x.index)).toEqual([1])
    expect(d.same).toBe(18)
  })

  it('diffAnswers: cada pergunta entra em um único grupo e os grupos somam o total', () => {
    const prev = new Array(20).fill(1)
    const now = prev.slice(); now[0] = 0; now[1] = 2; now[2] = null
    const d = diffAnswers(questions, now, prev)
    const all = [...d.improved, ...d.worsened, ...d.unchanged, ...d.unrated].map(x => x.index)
    expect(all.length).toBe(20)
    expect(new Set(all).size).toBe(20)
    expect(d.unchanged.length).toBe(d.same)
    expect(d.unchanged.every(x => x.before === x.now && x.points === 0)).toBe(true)
  })

  it('diffAnswers segue a semântica de cada pergunta (backup automático → manual é piora)', () => {
    const prev = new Array(20).fill(0)
    const now = prev.slice(); now[0] = 1
    const d = diffAnswers(questions, now, prev)
    expect(d.worsened).toHaveLength(1)
    expect(d.worsened[0]).toMatchObject({
      index: 0,
      theme: 'Backup',
      before: 'Sim, automático e regular',
      now: 'Sim, mas manual e irregular',
      points: -50,
      status: 'worsened'
    })
  })

  it('resposta ausente não vira melhora, piora nem igual', () => {
    const q = questions[0]
    expect(classifyChange(q, null, 0)).toBe('unrated')
    expect(classifyChange(q, 2, undefined)).toBe('unrated')
    expect(classifyChange(q, 7, 0)).toBe('unrated')
    expect(classifyChange(q, 2, 0)).toBe('improved')
    expect(classifyChange(q, 0, 2)).toBe('worsened')
    expect(classifyChange(q, 1, 1)).toBe('same')

    const prev = new Array(20).fill(2); prev[5] = null
    const d = diffAnswers(questions, new Array(20).fill(2), prev)
    expect(d.unrated.map(x => x.index)).toEqual([5])
    expect(d.unrated[0]).toMatchObject({ before: 'Sem resposta', points: null })
    expect(d.same).toBe(19)
  })
})
