<template>
  <!-- só o corpo: a moldura e o cabeçalho do módulo ficam no ResultsView -->
  <div>
  <div v-if="entries.length < 2" class="hist__empty">
    Essa é a primeira avaliação registrada. Refaça o questionário depois de um tempo
    pra começar a acompanhar a evolução aqui.
  </div>

  <div v-else class="hist">
    <div class="hist__plot">
      <!-- a linha é desenhada esticada; os pontos são HTML posicionado em %,
           senão o preserveAspectRatio="none" achataria os círculos -->
      <svg class="hist__line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline :points="linePoints" fill="none" stroke-width="0.6" vector-effect="non-scaling-stroke" />
      </svg>

      <span
        v-for="(p, i) in points"
        :key="i"
        class="hist__pt"
        :class="{ 'is-current': i === points.length - 1 }"
        :style="{ left: p.x + '%', bottom: p.y + '%', '--c': p.color }"
      >
        <b>{{ p.value }}</b>
        <em>{{ p.date }}</em>
      </span>
    </div>

    <div class="hist__delta" :class="delta >= 0 ? 'is-up' : 'is-down'">
      <b>{{ deltaText }}</b>
      <span>desde a 1ª</span>
    </div>

    <!-- registro das últimas avaliações: data, responsável e nota -->
    <ul class="hist__log" aria-label="Avaliações recentes">
      <li
        v-for="e in log"
        :key="e.date"
        class="hist__item"
        :class="{ 'is-ref': e.date === compareDate, 'is-now': e.isCurrent }"
      >
        <span class="hist__when">{{ e.day }}</span>
        <span class="hist__who" :class="{ 'is-empty': !e.responsavel }">{{ e.responsavel || 'não informado' }}</span>
        <span class="hist__score">{{ e.overall }}/100</span>
        <span class="hist__act">
          <span v-if="e.isCurrent" class="hist__badge">Atual</span>
          <span v-else-if="e.date === compareDate" class="hist__badge hist__badge--ref">Referência</span>
          <button v-else type="button" class="hist__use" @click="$emit('compare', e.date)">Comparar</button>
        </span>
      </li>
    </ul>
  </div>

  <!-- backup do histórico: o localStorage vive só neste navegador -->
  <div class="hist__io">
    <button type="button" class="btn btn--ghost" @click="exportJson" :disabled="!entries.length">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Exportar JSON
    </button>
    <button type="button" class="btn btn--ghost" @click="$refs.file.click()">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 16V3m0 0L7.5 7.5M12 3l4.5 4.5M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Importar JSON
    </button>
    <input ref="file" type="file" accept="application/json,.json" hidden @change="importJson" />
    <span v-if="status" class="hist__status" :class="`is-${status.kind}`" role="status">{{ status.text }}</span>
  </div>
  </div>
</template>

<script>
import { getTier } from '../utils/scoring.js'
import { buildHistoryExport, importHistory } from '../utils/storage.js'

export default {
  name: 'HistoryPanel',
  props: {
    entries: {
      type: Array,
      required: true
    },
    companyName: {
      type: String,
      default: ''
    },
    compareDate: {
      type: String,
      default: ''
    },
    questionCount: {
      type: Number,
      default: 20
    }
  },
  emits: ['compare', 'updated'],
  data() {
    return { status: null }
  },
  computed: {
    recentEntries() {
      return this.entries.slice(-5)
    },
    // escala vertical: 0–100 deixaria a linha praticamente reta em variações
    // pequenas, então o eixo se ajusta ao intervalo dos dados com folga —
    // e cada ponto carrega o número, para a inclinação nunca ser lida sozinha
    bounds() {
      const values = this.recentEntries.map(e => e.overall)
      const min = Math.min(...values)
      const max = Math.max(...values)
      const pad = Math.max(6, (max - min) * 0.35)
      const lo = Math.max(0, Math.round(min - pad))
      const hi = Math.min(100, Math.round(max + pad))
      return hi === lo ? { lo: Math.max(0, lo - 5), hi: Math.min(100, hi + 5) } : { lo, hi }
    },
    points() {
      const list = this.recentEntries
      const { lo, hi } = this.bounds
      return list.map((entry, i) => ({
        // margem lateral para o rótulo do primeiro e do último não vazarem
        x: list.length === 1 ? 50 : 8 + (i / (list.length - 1)) * 84,
        y: 16 + ((entry.overall - lo) / (hi - lo)) * 62,
        value: entry.overall,
        date: this.formatDate(entry.date),
        color: `var(--${getTier(entry.overall).tone})`
      }))
    },
    // mais recente primeiro
    log() {
      const last = this.entries[this.entries.length - 1]
      // a referência escolhida sempre aparece no registro, mesmo que seja antiga
      const list = this.recentEntries.slice()
      const ref = this.entries.find(e => e.date === this.compareDate)
      if (ref && !list.includes(ref)) list.unshift(ref)
      return list
        .map(e => ({
          isCurrent: e === last,
          date: e.date,
          overall: e.overall,
          responsavel: e.responsavel,
          day: new Date(e.date).toLocaleDateString('pt-BR')
        }))
        .reverse()
    },
    linePoints() {
      return this.points.map(p => `${p.x},${100 - p.y}`).join(' ')
    },
    delta() {
      if (this.entries.length < 2) return 0
      return this.entries[this.entries.length - 1].overall - this.entries[0].overall
    },
    deltaText() {
      return (this.delta > 0 ? '+' : '') + this.delta
    }
  },
  methods: {
    exportJson() {
      const data = buildHistoryExport(this.companyName)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const slug = (this.companyName || 'empresa')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `historico-${slug || 'empresa'}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
      this.status = { kind: 'ok', text: `${data.entries.length} avaliações exportadas` }
    },
    async importJson(ev) {
      const file = ev.target.files && ev.target.files[0]
      ev.target.value = ''
      if (!file) return
      try {
        if (file.size > 2 * 1024 * 1024) throw new Error('Arquivo grande demais (máx. 2 MB).')
        const data = JSON.parse(await file.text())
        const r = importHistory(data, this.companyName, this.questionCount)
        this.$emit('updated', r.history)
        const extra = []
        if (r.skipped) extra.push(`${r.skipped} já existiam`)
        if (r.invalid) extra.push(`${r.invalid} inválidas`)
        this.status = {
          kind: r.added ? 'ok' : 'warn',
          text: `${r.added} importadas` + (extra.length ? ` · ${extra.join(' · ')}` : '')
        }
      } catch (err) {
        this.status = {
          kind: 'err',
          text: err instanceof SyntaxError ? 'O arquivo não é um JSON válido.' : err.message
        }
      }
    },
    formatDate(iso) {
      return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase()
    }
  }
}
</script>

<style scoped>
.hist__empty {
  padding: 20px 18px;
  font-size: 13px;
  color: var(--ink-lo);
  line-height: 1.65;
}

.hist {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 116px;
  gap: 20px;
  align-items: center;
  padding: 22px 18px 18px;
}

.hist__plot {
  position: relative;
  height: 108px;
}

.hist__line polyline {
  stroke: rgba(var(--fx), 0.32);
}

.hist__line {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hist__pt {
  position: absolute;
  transform: translate(-50%, 50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  opacity: 0.6;
}

.hist__pt::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid var(--c);
  order: 2;
}

.hist__pt.is-current {
  opacity: 1;
}

.hist__pt.is-current::before {
  background: var(--c);
}

.hist__pt b {
  order: 1;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ink);
  line-height: 1.2;
}

.hist__pt em {
  order: 3;
  font-style: normal;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--ink-faint);
  white-space: nowrap;
}

/* ocupa a linha de baixo da grade, sem competir com o gráfico */
.hist__log {
  grid-column: 1 / -1;
  list-style: none;
  border-top: 1px solid var(--line-soft);
  margin-top: 4px;
}

.hist__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px solid var(--line-soft);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.hist__item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.hist__when {
  color: var(--ink-lo);
  font-variant-numeric: tabular-nums;
}

.hist__who {
  color: var(--ink-mid);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hist__who.is-empty {
  color: var(--ink-lo);
  font-style: italic;
}

.hist__score {
  color: var(--ink);
  font-weight: 500;
}

.hist__delta {
  text-align: right;
}

.hist__item {
  grid-template-columns: auto minmax(0, 1fr) auto 96px !important;
}

.hist__item.is-ref .hist__when,
.hist__item.is-ref .hist__score { color: var(--crit); }

.hist__act { text-align: right; }

.hist__badge {
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink);
  border: 1px solid var(--line-strong);
  padding: 2px 6px;
}

.hist__badge--ref {
  color: var(--crit);
  border-color: var(--crit);
}

.hist__use {
  font: inherit;
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-lo);
  background: none;
  border: 1px dashed var(--line);
  padding: 2px 6px;
  cursor: pointer;
  transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}

.hist__use:hover,
.hist__use:focus-visible {
  color: var(--crit);
  border-color: var(--crit);
}

.hist__io {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border-top: 1px solid var(--line);
  background: rgba(var(--fx), 0.015);
}

.hist__status {
  margin-left: auto;
  padding-right: 8px;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hist__status.is-ok { color: var(--safe); }
.hist__status.is-warn { color: var(--warn); }
.hist__status.is-err { color: var(--crit); }

.hist__delta b {
  display: block;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 1.1;
}

.hist__delta.is-up b { color: var(--safe); }
.hist__delta.is-down b { color: var(--crit); }

.hist__delta span {
  font-size: 9.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-lo);
}

@media (max-width: 560px) {
  .hist {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }

  .hist__delta {
    text-align: left;
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .hist__pt em {
    display: none;
  }
}
</style>
