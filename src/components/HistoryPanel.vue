<template>
  <!-- só o corpo: moldura e cabeçalho ficam no ResultsView -->
  <div class="hp">
    <!-- resumo analítico -->
    <div class="hp__stats">
      <div class="hp__stat">
        <span class="hp__k">Atual</span>
        <span class="hp__v">{{ stats.current ? stats.current.overall : '—' }}<small v-if="stats.current">/100</small></span>
        <span class="hp__s">{{ stats.current ? fmt(stats.current.date, true) : 'sem registro' }}</span>
      </div>
      <div class="hp__stat">
        <span class="hp__k">Anterior</span>
        <span class="hp__v">{{ stats.previous ? stats.previous.overall : '—' }}<small v-if="stats.previous">/100</small></span>
        <span class="hp__s">{{ stats.previous ? fmt(stats.previous.date, true) : 'sem avaliação anterior' }}</span>
      </div>
      <div class="hp__stat">
        <span class="hp__k">Variação</span>
        <span class="hp__v" :class="signClass(stats.deltaPts)">{{ stats.deltaPts === null ? '—' : signed(stats.deltaPts) }}<small v-if="stats.deltaPts !== null">pts</small></span>
        <span class="hp__s">{{ pctText(stats.deltaPct, stats.deltaPts) }}</span>
      </div>
      <div class="hp__stat">
        <span class="hp__k">Avaliações</span>
        <span class="hp__v">{{ stats.count }}</span>
        <span class="hp__s">registradas</span>
      </div>
    </div>

    <!-- estados vazios -->
    <div v-if="!points.length" class="hp__empty">
      Nenhuma avaliação registrada para esta empresa ainda.
    </div>

    <template v-else>
      <div class="hp__chartwrap">
        <svg
          class="hp__svg"
          :viewBox="`0 0 ${W} ${H}`"
          role="img"
          :aria-label="ariaLabel"
          @mouseleave="hover = null"
        >
          <!-- grade e eixo Y 0–100 -->
          <g class="hp__grid">
            <template v-for="v in [0, 25, 50, 75, 100]" :key="v">
              <line :x1="PL" :x2="W - PR" :y1="y(v)" :y2="y(v)" :class="{ 'is-base': v === 0 }" />
              <text :x="PL - 8" :y="y(v) + 3" text-anchor="end">{{ v }}</text>
            </template>
          </g>

          <!-- linha só quando há pelo menos 2 avaliações -->
          <polyline v-if="points.length > 1" :points="linePoints" class="hp__line" />

          <!-- eixo X: datas reais, com rótulos espaçados para não sobrepor -->
          <g class="hp__xlab">
            <template v-for="(p, i) in points" :key="'x' + p.id">
              <text
                v-if="i % step === 0 || i === points.length - 1"
                :x="x(i)" :y="H - 8"
                text-anchor="middle"
              >{{ fmt(p.date) }}</text>
            </template>
          </g>

          <!-- pontos -->
          <g
            v-for="(p, i) in points"
            :key="p.id"
            class="hp__pt"
            :class="{ 'is-current': p.id === stats.current?.id, 'is-ref': p.id === referenceId, 'is-hover': hover === i }"
            tabindex="0"
            role="button"
            :aria-label="pointLabel(p)"
            @mouseenter="hover = i"
            @focus="hover = i"
            @blur="hover = null"
            @click="choose(p)"
            @keydown.enter.prevent="choose(p)"
            @keydown.space.prevent="choose(p)"
            @keydown.left.prevent="move(i, -1)"
            @keydown.right.prevent="move(i, 1)"
            @keydown.esc="hover = null"
          >
            <circle :cx="x(i)" :cy="y(p.overall)" r="14" class="hp__hit" />
            <circle :cx="x(i)" :cy="y(p.overall)" :r="p.id === stats.current?.id ? 6 : 4.5" class="hp__dot" />
            <circle v-if="p.id === referenceId" :cx="x(i)" :cy="y(p.overall)" r="9.5" class="hp__refring" />
            <text
              v-if="showValues"
              :x="x(i)" :y="y(p.overall) - 13"
              text-anchor="middle"
              class="hp__val"
            >{{ p.overall }}</text>
          </g>
        </svg>

        <!-- tooltip -->
        <div
          v-if="hover !== null && points[hover]"
          class="hp__tip"
          :style="tipStyle"
          role="tooltip"
        >
          <b>Avaliação #{{ points[hover].n }}<span v-if="points[hover].id === stats.current?.id"> · atual</span><span v-else-if="points[hover].id === referenceId"> · referência</span></b>
          <span>{{ fmt(points[hover].date, true) }}</span>
          <span>Pontuação: <strong>{{ points[hover].overall }}/100</strong></span>
          <span v-if="points[hover].deltaPts !== null" :class="signClass(points[hover].deltaPts)">
            {{ signed(points[hover].deltaPts) }} pontos vs anterior<template v-if="points[hover].deltaPct !== null"> ({{ signed(points[hover].deltaPct) }}%)</template>
          </span>
          <span v-else class="hp__muted">Primeira avaliação registrada</span>
          <em v-if="points[hover].id !== stats.current?.id && points[hover].id !== referenceId">Clique para usar como referência</em>
        </div>
      </div>

      <p v-if="points.length === 1" class="hp__note">
        Só há uma avaliação registrada: ainda não existe evolução para comparar.
      </p>
      <p v-if="invalidDates" class="hp__note hp__note--warn">
        {{ invalidDates }} registro(s) com data inválida ou ausente não aparecem no gráfico.
      </p>

      <!-- lista: mais recente primeiro -->
      <ul class="hp__log" aria-label="Avaliações registradas">
        <li
          v-for="p in reversed"
          :key="'l' + p.id"
          class="hp__item"
          :class="{ 'is-ref': p.id === referenceId, 'is-now': p.id === stats.current?.id }"
        >
          <span class="hp__n">#{{ p.n }}</span>
          <span class="hp__when">{{ fmt(p.date, true) }}</span>
          <span class="hp__who" :class="{ 'is-empty': !p.responsavel }">{{ p.responsavel || 'não informado' }}</span>
          <span class="hp__score">{{ p.overall }}/100</span>
          <span class="hp__d" :class="signClass(p.deltaPts)">{{ p.deltaPts === null ? '—' : signed(p.deltaPts) + ' pts' }}</span>
          <span class="hp__act">
            <span v-if="p.id === stats.current?.id" class="hp__badge">Atual</span>
            <span v-else-if="p.id === referenceId" class="hp__badge hp__badge--ref">Referência</span>
            <button v-else type="button" class="hp__use" @click="choose(p)">Comparar</button>
          </span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import { prepareHistory, historyStats, formatDate, labelStep } from '../utils/history.js'

export default {
  name: 'HistoryPanel',
  props: {
    entries: { type: Array, required: true },
    currentId: { type: String, default: '' },
    referenceId: { type: String, default: '' }
  },
  emits: ['select-reference'],
  data() {
    return { hover: null, compact: false, mq: null, H: 230, PL: 40, PR: 24, PT: 24, PB: 34 }
  },
  mounted() {
    try {
      this.mq = window.matchMedia('(max-width: 700px)')
      this.compact = this.mq.matches
      this.mq.addEventListener('change', this.onMq)
    } catch { /* sem matchMedia */ }
  },
  beforeUnmount() {
    if (this.mq) this.mq.removeEventListener('change', this.onMq)
  },
  computed: {
    // no celular o viewBox fica estreito: textos continuam legíveis
    W() { return this.compact ? 380 : 720 },
    prepared() { return prepareHistory(this.entries) },
    points() { return this.prepared.points },
    invalidDates() { return this.prepared.invalidDates },
    stats() { return historyStats(this.points, this.currentId) },
    reversed() { return this.points.slice().reverse() },
    step() { return labelStep(this.points.length, this.compact ? 4 : 8) },
    showValues() { return this.points.length <= (this.compact ? 6 : 12) },
    linePoints() { return this.points.map((p, i) => `${this.x(i)},${this.y(p.overall)}`).join(' ') },
    tipStyle() {
      const p = this.points[this.hover]
      const left = (this.x(this.hover) / this.W) * 100
      const top = (this.y(p.overall) / this.H) * 100
      return {
        left: `clamp(8px, ${left}%, calc(100% - 228px))`,
        top: top + '%',
        transform: top < 40 ? 'translate(-10px, 22px)' : 'translate(-10px, calc(-100% - 18px))'
      }
    },
    ariaLabel() {
      if (!this.points.length) return 'Histórico vazio'
      const list = this.points.map(p => `${formatDate(p.date)}: ${p.overall}`).join('; ')
      return `Evolução da pontuação geral, de 0 a 100, em ordem cronológica. ${list}`
    }
  },
  watch: {
    entries() { this.hover = null }
  },
  methods: {
    onMq(e) { this.compact = e.matches },
    fmt(iso, t) { return formatDate(iso, t) },
    // ordinal: avaliações do mesmo dia ficam lado a lado, nenhuma é escondida
    x(i) {
      const n = this.points.length
      const w = this.W - this.PL - this.PR
      return n <= 1 ? this.PL + w / 2 : this.PL + 14 + (i / (n - 1)) * (w - 28)
    },
    y(v) {
      return this.PT + (1 - v / 100) * (this.H - this.PT - this.PB)
    },
    signed(n) { return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '±0' },
    signClass(n) { return n === null || n === undefined ? '' : n > 0 ? 'is-up' : n < 0 ? 'is-down' : 'is-flat' },
    pctText(pct, pts) {
      if (pts === null) return 'sem comparação'
      if (pct === null) return 'percentual indisponível (base 0)'
      return `${this.signed(pct)}% relativo`
    },
    pointLabel(p) {
      let s = `Avaliação ${p.n}, ${formatDate(p.date, true)}, ${p.overall} de 100`
      if (p.deltaPts !== null) s += `, ${this.signed(p.deltaPts)} pontos em relação à anterior`
      if (p.id === this.stats.current?.id) s += ', avaliação atual'
      else if (p.id === this.referenceId) s += ', referência selecionada'
      return s
    },
    choose(p) {
      if (p.id !== this.stats.current?.id) this.$emit('select-reference', p.id)
    },
    move(i, d) {
      const next = Math.max(0, Math.min(this.points.length - 1, i + d))
      const nodes = this.$el.querySelectorAll('.hp__pt')
      if (nodes[next]) nodes[next].focus()
    }
  }
}
</script>

<style scoped>
.hp__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--line-soft);
  border-bottom: 1px solid var(--line-soft);
}

.hp__stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px 16px;
  border-right: 1px solid var(--line-soft);
  min-width: 0;
}

.hp__stat:last-child { border-right: none; }

.hp__k {
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-lo);
}

.hp__v {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.05em;
  color: var(--ink);
  line-height: 1.15;
}

.hp__v small {
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.06em;
  color: var(--ink-lo);
  margin-left: 3px;
}

.hp__s {
  font-size: 9.5px;
  letter-spacing: 0.08em;
  color: var(--ink-lo);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.is-up { color: var(--safe) !important; }
.is-down { color: var(--crit) !important; }
.is-flat { color: var(--ink-lo) !important; }

.hp__empty,
.hp__note {
  margin: 0;
  padding: 14px 18px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ink-lo);
}

.hp__note--warn { color: var(--warn); }

.hp__chartwrap {
  position: relative;
  padding: 10px 10px 0;
}

.hp__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  font-family: 'Azeret Mono', ui-monospace, monospace;
}

.hp__grid line {
  stroke: var(--line-soft);
  stroke-width: 1;
  stroke-dasharray: 2 4;
}

.hp__grid line.is-base { stroke: var(--line-strong); stroke-dasharray: none; }

.hp__grid text,
.hp__xlab text {
  font-size: 10px;
  fill: var(--ink-lo);
}

.hp__line {
  fill: none;
  stroke: var(--ink-mid);
  stroke-width: 2;
  stroke-linejoin: round;
}

.hp__pt { cursor: pointer; outline: none; }
.hp__hit { fill: transparent; }

.hp__dot {
  fill: var(--panel-deep);
  stroke: var(--ink);
  stroke-width: 2;
}

.hp__pt.is-current .hp__dot { fill: var(--ink); }

.hp__refring {
  fill: none;
  stroke: var(--ref);
  stroke-width: 2;
  stroke-dasharray: 3 2;
}

.hp__pt.is-hover .hp__dot,
.hp__pt:focus-visible .hp__dot { stroke-width: 3; }

.hp__pt:focus-visible .hp__hit {
  stroke: var(--ink);
  stroke-width: 1.5;
  stroke-dasharray: 2 2;
}

.hp__val {
  font-size: 11px;
  font-weight: 600;
  fill: var(--ink);
  paint-order: stroke;
  stroke: var(--panel-deep);
  stroke-width: 3px;
}

.hp__tip {
  position: absolute;
  z-index: 3;
  width: 220px;
  display: grid;
  gap: 3px;
  padding: 10px 12px;
  background: var(--panel-deep);
  border: 1px solid var(--line-strong);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: var(--ink-mid);
  pointer-events: none;
}

.hp__tip b {
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink);
}

.hp__tip strong { color: var(--ink); }
.hp__tip em { font-style: normal; color: var(--ref); }
.hp__muted { color: var(--ink-lo); }

.hp__log {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 290px;
  overflow-y: auto;
  border-top: 1px solid var(--line-soft);
}

.hp__item {
  display: grid;
  grid-template-columns: 36px 128px minmax(0, 1fr) 64px 70px 96px;
  gap: 12px;
  align-items: center;
  padding: 9px 18px;
  border-bottom: 1px solid var(--line-soft);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.hp__item.is-ref { box-shadow: inset 3px 0 0 var(--ref); }
.hp__item.is-now { box-shadow: inset 3px 0 0 var(--ink); }

.hp__n { color: var(--ink-faint); }
.hp__when { color: var(--ink-lo); font-variant-numeric: tabular-nums; }
.hp__who { color: var(--ink-mid); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hp__who.is-empty { color: var(--ink-lo); font-style: italic; }
.hp__score { color: var(--ink); font-weight: 600; text-align: right; }
.hp__d { text-align: right; color: var(--ink-lo); }
.hp__act { text-align: right; }

.hp__badge {
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink);
  border: 1px solid var(--line-strong);
  padding: 2px 6px;
}

.hp__badge--ref { color: var(--ref); border-color: var(--ref); }

.hp__use {
  font: inherit;
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-lo);
  background: none;
  border: 1px dashed var(--line);
  padding: 3px 7px;
  cursor: pointer;
}

.hp__use:hover,
.hp__use:focus-visible {
  color: var(--ref);
  border-color: var(--ref);
  outline: none;
}

@media (max-width: 700px) {
  .hp__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hp__stat:nth-child(2) { border-right: none; }
  .hp__stat:nth-child(-n + 2) { border-bottom: 1px solid var(--line-soft); }
  .hp__item {
    grid-template-columns: 30px minmax(0, 1fr) auto;
    gap: 4px 10px;
    padding: 10px 14px;
  }
  .hp__who, .hp__d { display: none; }
  .hp__act { grid-column: 2 / -1; text-align: left; }
  .hp__tip { width: 200px; }
}
</style>
