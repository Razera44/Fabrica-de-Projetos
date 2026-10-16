import { describe, it, expect } from 'vitest'
import { prepareHistory, historyStats, percentChange, labelStep } from '../src/utils/history.js'

const e = (id, date, overall) => ({ id, date, overall, themeScores: {} })

describe('histórico', () => {
  it('100 → 36 dá −64 pontos (e −64% relativo)', () => {
    const { points } = prepareHistory([e('a', '2026-01-01', 100), e('b', '2026-02-01', 36)])
    const s = historyStats(points, 'b')
    expect(s.deltaPts).toBe(-64)
    expect(s.deltaPct).toBe(-64)
    expect(s.previous.id).toBe('a')
  })

  it('ordena cronologicamente mesmo fora de ordem', () => {
    const { points } = prepareHistory([e('b', '2026-02-01', 50), e('a', '2026-01-01', 40)])
    expect(points.map(p => p.id)).toEqual(['a', 'b'])
    expect(points[1].deltaPts).toBe(10)
  })

  it('anterior é relativo à avaliação atual, não à última', () => {
    const { points } = prepareHistory([e('a', '2026-01-01', 10), e('b', '2026-02-01', 20), e('c', '2026-03-01', 90)])
    const s = historyStats(points, 'b')
    expect(s.current.id).toBe('b')
    expect(s.previous.id).toBe('a')
    expect(s.deltaPts).toBe(10)
  })

  it('uma avaliação: sem variação', () => {
    const { points } = prepareHistory([e('a', '2026-01-01', 70)])
    const s = historyStats(points, 'a')
    expect(s.deltaPts).toBeNull()
    expect(s.previous).toBeNull()
  })

  it('nenhuma avaliação', () => {
    const s = historyStats(prepareHistory([]).points, 'x')
    expect(s.count).toBe(0)
    expect(s.current).toBeNull()
  })

  it('datas inválidas ficam fora do gráfico e são contadas', () => {
    const r = prepareHistory([e('a', 'lixo', 70), e('b', '2026-01-01', 50)])
    expect(r.points).toHaveLength(1)
    expect(r.invalidDates).toBe(1)
  })

  it('pontuações iguais dão variação ±0', () => {
    const { points } = prepareHistory([e('a', '2026-01-01', 60), e('b', '2026-01-02', 60)])
    expect(points[1].deltaPts).toBe(0)
  })

  it('percentual indisponível quando a base é 0', () => {
    expect(percentChange(0, 50)).toBeNull()
  })

  it('muitos pontos: rótulos de data espaçados', () => {
    expect(labelStep(5)).toBe(1)
    expect(labelStep(40)).toBe(5)
  })
})
