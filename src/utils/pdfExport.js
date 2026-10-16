// Geração do PDF do relatório de diagnóstico.
//
// Reproduz o tema visual do app (src/style.css): fundo escuro, fonte
// monoespaçada, texto claro, painéis com borda fina e faixas de risco
// coloridas. Tudo desenhado direto com jsPDF (texto e formas — sem
// html2canvas), então o PDF não é uma "foto" da tela, mas segue a mesma
// linguagem visual.

import { jsPDF, GState } from 'jspdf'
import { THEME_WEIGHTS, getTier } from './scoring.js'
import { AZERET_MONO_REGULAR_BASE64 } from './fonts/azeretMonoRegular.js'
import { AZERET_MONO_SEMIBOLD_BASE64 } from './fonts/azeretMonoSemiBold.js'

// Paleta extraída de src/style.css. Os tons de --line/--ink que na tela são
// brancos com opacidade (sobre fundo escuro) viram aqui cinzas sólidos
// equivalentes, já que o PDF não compõe transparência do mesmo jeito.
const BG = [8, 9, 10] // --bg
const PANEL = [13, 14, 15] // --panel
const LINE = [70, 70, 70] // ~--line-strong sobre --bg
const LINE_SOFT = [38, 38, 38] // ~--line sobre --bg
const INK = [244, 244, 242] // --ink
const INK_MID = [176, 176, 174] // ~--ink-mid sobre --bg
const INK_LO = [134, 134, 132] // ~--ink-lo sobre --bg

const CRIT = [226, 112, 122]
const WARN = [229, 187, 99]
const SAFE = [79, 221, 118]
const TONE_COLOR = { crit: CRIT, warn: WARN, safe: SAFE }
const TONE_LABEL = { crit: 'Crítico', warn: 'Importante', safe: 'Recomendado' }

// Mesma fonte usada na tela (src/style.css: 'Azeret Mono'), embutida no PDF
// como TTF em base64 — não é mais uma aproximação com uma monoespaçada
// genérica. 'normal' usa o peso 400 e 'bold' usa o peso 600 (o mesmo peso
// que a tela usa para títulos e destaques).
const FONT = 'AzeretMono'

function registerFont(doc) {
  doc.addFileToVFS('AzeretMono-Regular.ttf', AZERET_MONO_REGULAR_BASE64)
  doc.addFont('AzeretMono-Regular.ttf', FONT, 'normal')
  doc.addFileToVFS('AzeretMono-SemiBold.ttf', AZERET_MONO_SEMIBOLD_BASE64)
  doc.addFont('AzeretMono-SemiBold.ttf', FONT, 'bold')
}

function paintBackground(doc) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  doc.setFillColor(...BG)
  doc.rect(0, 0, w, h, 'F')
}

function newPage(doc) {
  doc.addPage()
  paintBackground(doc)
  return 60
}

function pageBreakIfNeeded(doc, y, limit = 764) {
  return y > limit ? newPage(doc) : y
}

// Cabeçalho de seção no estilo do .section-head da tela: "[01] TÍTULO ----"
function sectionHead(doc, index, title, x, y, width) {
  doc.setFont(FONT, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...INK)
  doc.setDrawColor(...LINE)

  const boxW = doc.getTextWidth(index) + 10
  doc.rect(x, y - 9, boxW, 13)
  doc.text(index, x + 5, y)

  doc.setFontSize(10.5)
  const label = title.toUpperCase()
  doc.text(label, x + boxW + 10, y, { charSpace: 0.6 })

  const labelW = doc.getTextWidth(label) + label.length * 0.6
  const lineStart = x + boxW + 10 + labelW + 10
  doc.setLineDashPattern([1, 1.6], 0)
  doc.line(lineStart, y - 3, x + width, y - 3)
  doc.setLineDashPattern([], 0)
}

function signed(n) {
  return n > 0 ? `+${n}` : n < 0 ? `-${Math.abs(n)}` : '0'
}

// Polígono fechado a partir de pontos absolutos (jsPDF.lines usa deltas)
function polygon(doc, pts, style) {
  const segs = []
  for (let i = 1; i < pts.length; i += 1) {
    segs.push([pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y])
  }
  doc.lines(segs, pts[0].x, pts[0].y, [1, 1], style, true)
}

function withOpacity(doc, opacity, fn) {
  doc.saveGraphicsState()
  doc.setGState(new GState({ opacity, 'stroke-opacity': opacity }))
  fn()
  doc.restoreGraphicsState()
}

// Radar no mesmo desenho da tela: faixas de risco, grade, referência em
// vermelho tracejado e a avaliação atual em traço claro com vértices
// coloridos pela faixa.
function drawRadar(doc, cx, cy, R, themeScores, previousScores) {
  const themes = Object.keys(THEME_WEIGHTS)
  const pt = (i, v, extra = 0) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / themes.length
    const r = (R * Math.max(0, Math.min(100, v || 0))) / 100 + extra
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  const ring = lvl => themes.map((_, i) => pt(i, lvl))

  // faixas (de fora pra dentro, cada uma pinta por cima da anterior)
  ;[[100, 0.03], [70, 0.06], [40, 0.1]].forEach(([lvl, op]) => {
    withOpacity(doc, op, () => {
      doc.setFillColor(...INK)
      polygon(doc, ring(lvl), 'F')
    })
  })

  doc.setLineWidth(0.5)
  ;[20, 40, 60, 80, 100].forEach(lvl => {
    doc.setDrawColor(...(lvl === 40 || lvl === 100 ? LINE : LINE_SOFT))
    if (lvl !== 40 && lvl !== 100) doc.setLineDashPattern([1, 2], 0)
    polygon(doc, ring(lvl), 'S')
    doc.setLineDashPattern([], 0)
  })
  doc.setDrawColor(...LINE)
  polygon(doc, ring(70), 'S')

  themes.forEach((_, i) => {
    const p = pt(i, 100)
    doc.setDrawColor(...LINE_SOFT)
    doc.line(cx, cy, p.x, p.y)
  })

  doc.setFont(FONT, 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...INK_MID)
  ;[20, 40, 60, 80].forEach(lvl => doc.text(String(lvl), cx + 3, pt(0, lvl).y + 2))

  if (previousScores) {
    const prev = themes.map((t, i) => pt(i, previousScores[t]))
    withOpacity(doc, 0.12, () => {
      doc.setFillColor(...CRIT)
      polygon(doc, prev, 'F')
    })
    doc.setDrawColor(...CRIT)
    doc.setLineWidth(1)
    doc.setLineDashPattern([4, 3], 0)
    polygon(doc, prev, 'S')
    doc.setLineDashPattern([], 0)
    prev.forEach(p => {
      doc.setFillColor(...BG)
      doc.circle(p.x, p.y, 2, 'FD')
    })
  }

  const cur = themes.map((t, i) => pt(i, themeScores[t]))
  withOpacity(doc, 0.14, () => {
    doc.setFillColor(...INK)
    polygon(doc, cur, 'F')
  })
  doc.setDrawColor(...INK)
  doc.setLineWidth(1.4)
  polygon(doc, cur, 'S')
  doc.setLineWidth(0.5)

  themes.forEach((t, i) => {
    const p = cur[i]
    doc.setFillColor(...TONE_COLOR[getTier(themeScores[t]).tone])
    doc.rect(p.x - 3, p.y - 3, 6, 6, 'F')
  })

  // rótulos
  themes.forEach((t, i) => {
    const p = pt(i, 100, 14)
    const c = Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / themes.length)
    const align = Math.abs(c) < 0.3 ? 'center' : c > 0 ? 'left' : 'right'
    const dy = i === 0 ? -4 : i === 2 ? 8 : 3
    doc.setFont(FONT, 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...INK)
    doc.text(`${t.toUpperCase()} ${themeScores[t]}`, p.x, p.y + dy, { align })
  })
}

export function exportResultsPdf({
  companyName,
  responsavel,
  issuedAt,
  overall,
  themeScores,
  actionPlan,
  previousScores = null,
  previousDate = '',
  previousOverall = null
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  registerFont(doc)
  paintBackground(doc)

  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 48
  const contentWidth = pageWidth - marginX * 2
  let y = 64

  // Cabeçalho
  doc.setFont(FONT, 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...INK)
  doc.text('SEGURA.', marginX, y)

  doc.setFont(FONT, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK_LO)
  doc.text('RELATÓRIO DE DIAGNÓSTICO DE SEGURANÇA DIGITAL', marginX, y + 14, { charSpace: 0.5 })
  y += 42

  doc.setFont(FONT, 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...INK)
  doc.text(companyName || 'Empresa', marginX, y)

  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...INK_LO)
  doc.text(`EMITIDO EM ${issuedAt.toUpperCase()}`, marginX, y + 13, { charSpace: 0.4 })
  y += 30

  if (responsavel) {
    const line = doc.splitTextToSize(`RESPONSÁVEL: ${responsavel}`, contentWidth)[0]
    doc.text(line, marginX, y - 4, { charSpace: 0.4 })
    y += 14
  }

  doc.setDrawColor(...LINE)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 26

  // Índice geral — painel com moldura, igual ao card da ResultsView
  const tier = getTier(overall)
  const panelH = 90
  doc.setDrawColor(...LINE)
  doc.setFillColor(...PANEL)
  doc.rect(marginX, y, contentWidth, panelH, 'FD')

  const padIn = 20
  doc.setFont(FONT, 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...INK_LO)
  doc.text('ÍNDICE GERAL', marginX + padIn, y + 26, { charSpace: 0.6 })

  doc.setTextColor(...(TONE_COLOR[tier.tone]))
  doc.text(tier.label.toUpperCase(), pageWidth - marginX - padIn, y + 26, {
    align: 'right',
    charSpace: 0.6
  })

  doc.setFont(FONT, 'bold')
  doc.setFontSize(34)
  doc.setTextColor(...INK)
  doc.text(String(overall), marginX + padIn, y + 68)
  const overallWidth = doc.getTextWidth(String(overall))
  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...INK_LO)
  doc.text('/100', marginX + padIn + overallWidth + 6, y + 68)

  if (previousOverall !== null && previousOverall !== undefined) {
    const d = overall - previousOverall
    doc.setFont(FONT, 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...(d > 0 ? SAFE : d < 0 ? CRIT : INK_LO))
    doc.text(signed(d), pageWidth - marginX - padIn, y + 62, { align: 'right' })
    doc.setFont(FONT, 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...INK_LO)
    doc.text(`VS ${previousDate || 'ANTERIOR'} (${previousOverall}/100)`, pageWidth - marginX - padIn, y + 74, {
      align: 'right',
      charSpace: 0.4
    })
  }

  y += panelH + 34

  // Radar comparativo
  sectionHead(doc, '01', 'Radar comparativo', marginX, y, contentWidth)
  y += 20
  const radarR = 82
  const radarCx = marginX + 130
  const radarCy = y + radarR + 22
  drawRadar(doc, radarCx, radarCy, radarR, themeScores, previousScores)

  // tabela ao lado: tema | atual | referência | Δ
  const tx = marginX + 290
  const tw = pageWidth - marginX - tx
  let ty = y + 34
  doc.setFont(FONT, 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...INK_LO)
  doc.text('TEMA', tx, ty, { charSpace: 0.5 })
  doc.text('ATUAL', tx + tw * 0.55, ty, { align: 'right', charSpace: 0.5 })
  if (previousScores) {
    doc.text('REF.', tx + tw * 0.78, ty, { align: 'right', charSpace: 0.5 })
    doc.text('DIF.', tx + tw, ty, { align: 'right', charSpace: 0.5 })
  }
  ty += 8
  doc.setDrawColor(...LINE)
  doc.line(tx, ty, tx + tw, ty)
  ty += 16
  Object.keys(THEME_WEIGHTS).forEach(theme => {
    const cur = themeScores[theme]
    doc.setFont(FONT, 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...INK_MID)
    doc.text(theme.toUpperCase(), tx, ty, { charSpace: 0.4 })
    doc.setFont(FONT, 'bold')
    doc.setTextColor(...INK)
    doc.text(String(cur), tx + tw * 0.55, ty, { align: 'right' })
    if (previousScores) {
      const prev = previousScores[theme] ?? 0
      const d = cur - prev
      doc.setFont(FONT, 'normal')
      doc.setTextColor(...CRIT)
      doc.text(String(prev), tx + tw * 0.78, ty, { align: 'right' })
      doc.setFont(FONT, 'bold')
      doc.setTextColor(...(d > 0 ? SAFE : d < 0 ? CRIT : INK_LO))
      doc.text(signed(d), tx + tw, ty, { align: 'right' })
    }
    ty += 8
    doc.setDrawColor(...LINE_SOFT)
    doc.line(tx, ty, tx + tw, ty)
    ty += 16
  })

  // legenda
  ty += 4
  doc.setLineWidth(1.4)
  doc.setDrawColor(...INK)
  doc.line(tx, ty - 3, tx + 14, ty - 3)
  doc.setLineWidth(0.5)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...INK_LO)
  doc.text('ATUAL', tx + 20, ty, { charSpace: 0.4 })
  if (previousScores) {
    doc.setLineWidth(1)
    doc.setDrawColor(...CRIT)
    doc.setLineDashPattern([3, 2], 0)
    doc.line(tx + 70, ty - 3, tx + 84, ty - 3)
    doc.setLineDashPattern([], 0)
    doc.setLineWidth(0.5)
    doc.text(`REFERÊNCIA ${previousDate}`, tx + 90, ty, { charSpace: 0.4 })
  } else {
    doc.text('SEM AVALIAÇÃO ANTERIOR', tx + 70, ty, { charSpace: 0.4 })
  }

  y = radarCy + radarR + 40

  // Notas por tema
  sectionHead(doc, '02', 'Notas por tema', marginX, y, contentWidth)
  y += 26

  const barX = marginX + 150
  const barW = pageWidth - marginX - barX - 46

  Object.keys(THEME_WEIGHTS).forEach(theme => {
    const score = themeScores[theme]
    const themeTone = getTier(score).tone

    doc.setFont(FONT, 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...INK_MID)
    doc.text(theme.toUpperCase(), marginX, y, { charSpace: 0.5 })

    doc.setDrawColor(...LINE_SOFT)
    doc.setFillColor(...LINE_SOFT)
    doc.rect(barX, y - 6.5, barW, 6, 'F')
    doc.setFillColor(...(TONE_COLOR[themeTone]))
    doc.rect(barX, y - 6.5, (barW * score) / 100, 6, 'F')

    doc.setTextColor(...INK_LO)
    doc.text(`${score}/100`, pageWidth - marginX, y, { align: 'right' })

    y += 24
  })

  y += 10

  // Plano de ação
  sectionHead(doc, '03', 'Plano de ação priorizado', marginX, y, contentWidth)
  y += 10
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...INK_LO)
  doc.text('DO TEMA COM MENOR NOTA PARA O MAIS FORTE.', marginX, y + 12, { charSpace: 0.4 })
  y += 32

  const textX = marginX + 32
  const textWidth = contentWidth - 32

  actionPlan.forEach((item, i) => {
    y = pageBreakIfNeeded(doc, y)

    // índice numerado em caixa, igual ao .index da tela
    const num = String(i + 1).padStart(2, '0')
    doc.setDrawColor(...LINE)
    doc.rect(marginX, y - 10, 20, 13)
    doc.setFont(FONT, 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...INK)
    doc.text(num, marginX + 4, y)

    const themeLabel = item.theme.toUpperCase()
    doc.text(themeLabel, textX, y, { charSpace: 0.5 })
    const themeWidth = doc.getTextWidth(themeLabel) + themeLabel.length * 0.5

    doc.setFont(FONT, 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...(TONE_COLOR[item.tone]))
    doc.text(`  \u2022  ${TONE_LABEL[item.tone].toUpperCase()}`, textX + themeWidth, y)
    y += 18

    y = pageBreakIfNeeded(doc, y)
    doc.setFont(FONT, 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...INK)
    doc.text(item.title, textX, y)
    y += 16

    y = pageBreakIfNeeded(doc, y)
    doc.setFont(FONT, 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...INK_LO)
    const descLines = doc.splitTextToSize(item.desc, textWidth)
    doc.text(descLines, textX, y)
    y += descLines.length * 13 + 12

    // linha divisória entre itens, como o .plan__item da tela
    doc.setDrawColor(...LINE_SOFT)
    doc.line(marginX, y, pageWidth - marginX, y)
    y += 20
  })

  const slug = (companyName || 'empresa')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  doc.save(`diagnostico-${slug || 'empresa'}.pdf`)
}
