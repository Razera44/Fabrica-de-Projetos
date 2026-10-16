// Preparação dos dados do gráfico de histórico (funções puras, testadas).

import { sortChrono } from './storage.js'

export function formatDate(iso, withTime = false) {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return ''
  const p = n => String(n).padStart(2, '0')
  const day = `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`
  return withTime ? `${day} ${p(d.getHours())}:${p(d.getMinutes())}` : day
}

// Variação percentual relativa (pontos e % são métricas diferentes).
// Sem base (anterior = 0) não existe percentual.
export function percentChange(prev, now) {
  if (!Number.isFinite(prev) || !Number.isFinite(now) || prev === 0) return null
  return Math.round(((now - prev) / prev) * 100)
}

// Ordena, separa registros com data inválida e calcula a variação de cada
// avaliação em relação à imediatamente anterior (cronológica).
export function prepareHistory(entries) {
  const sorted = sortChrono(entries || [])
  const points = []
  let invalidDates = 0
  sorted.forEach(e => {
    if (!Number.isFinite(new Date(e.date).getTime())) { invalidDates += 1; return }
    const prev = points[points.length - 1]
    points.push({
      ...e,
      n: points.length + 1,
      deltaPts: prev ? e.overall - prev.overall : null,
      deltaPct: prev ? percentChange(prev.overall, e.overall) : null,
      prevDate: prev ? prev.date : null
    })
  })
  return { points, invalidDates }
}

// Indicadores do resumo: atual = avaliação identificada como atual;
// anterior = a imediatamente anterior a ela na linha do tempo.
export function historyStats(points, currentId) {
  const idx = points.findIndex(p => p.id === currentId)
  const current = idx >= 0 ? points[idx] : points[points.length - 1] || null
  const ci = current ? points.indexOf(current) : -1
  const previous = ci > 0 ? points[ci - 1] : null
  return {
    count: points.length,
    current,
    previous,
    deltaPts: current && previous ? current.overall - previous.overall : null,
    deltaPct: current && previous ? percentChange(previous.overall, current.overall) : null
  }
}

// Quais rótulos de data cabem no eixo X sem sobrepor (mostra 1 a cada k).
export function labelStep(count, maxLabels = 8) {
  if (count <= maxLabels) return 1
  return Math.ceil(count / maxLabels)
}
