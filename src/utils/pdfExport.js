// Geração do PDF do relatório de diagnóstico.
//
// Reproduz o tema visual do app (src/style.css): fundo escuro, fonte
// monoespaçada, texto claro, painéis com borda fina e faixas de risco
// coloridas. Tudo desenhado direto com jsPDF (texto e formas — sem
// html2canvas), então o PDF não é uma "foto" da tela, mas segue a mesma
// linguagem visual.

import { jsPDF } from 'jspdf'
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

export function exportResultsPdf({ companyName, issuedAt, overall, themeScores, actionPlan }) {
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

  y += panelH + 34

  // Notas por tema
  sectionHead(doc, '01', 'Notas por tema', marginX, y, contentWidth)
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
  sectionHead(doc, '02', 'Plano de ação priorizado', marginX, y, contentWidth)
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
