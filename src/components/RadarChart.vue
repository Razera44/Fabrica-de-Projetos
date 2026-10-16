<template>
  <div class="rdr" :class="{ 'has-active': active !== null, 'is-compact': compact }">
    <!-- ================= GRÁFICO ================= -->
    <div class="rdr__stage">
      <div class="rdr__plot">
      <svg
        class="rdr__svg"
        :viewBox="`0 0 ${W} ${H}`"
        role="img"
        :aria-label="ariaLabel"
        @mouseleave="active = null"
      >
        <defs>
          <radialGradient :id="uid('fill')" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color: rgb(var(--ink-rgb)); stop-opacity: 0.22" />
            <stop offset="100%" style="stop-color: rgb(var(--ink-rgb)); stop-opacity: 0.05" />
          </radialGradient>
          <filter :id="uid('glow')" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker :id="uid('arr-up')" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L8 4 L0 8 z" class="rdr__arrow rdr__arrow--up" />
          </marker>
          <marker :id="uid('arr-down')" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L8 4 L0 8 z" class="rdr__arrow rdr__arrow--down" />
          </marker>
        </defs>

        <!-- cantoneiras e leituras de HUD -->
        <g class="rdr__hud">
          <path :d="`M 8 26 V 8 H 26`" />
          <path :d="`M ${W - 26} 8 H ${W - 8} V 26`" />
          <path :d="`M 8 ${H - 26} V ${H - 8} H 26`" />
          <path :d="`M ${W - 26} ${H - 8} H ${W - 8} V ${H - 26}`" />
          <text x="16" y="24" class="rdr__hudtxt">SCAN // 4 EIXOS</text>
          <text :x="W - 16" y="24" text-anchor="end" class="rdr__hudtxt">
            REF ▸ <tspan :class="previous ? 'rdr__hud--prev' : ''">{{ previous ? previousDate || 'ANTERIOR' : 'SEM REFERÊNCIA' }}</tspan>
          </text>
          <text x="16" :y="H - 16" class="rdr__hudtxt">ÁREA {{ coverage }}%</text>
          <text :x="W - 16" :y="H - 16" text-anchor="end" class="rdr__hudtxt">ESCALA 0–100</text>
        </g>

        <!-- moldura circular com graduação -->
        <g class="rdr__bezel">
          <circle :cx="CX" :cy="CY" :r="R + 16" class="rdr__ring" />
          <line
            v-for="t in bezelTicks"
            :key="'bt' + t.a"
            :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
            :class="t.major ? 'rdr__btick rdr__btick--major' : 'rdr__btick'"
          />
        </g>
        <circle :cx="CX" :cy="CY" :r="R + 10" class="rdr__ring rdr__ring--inner" />

        <!-- faixas de risco -->
        <path :d="band(70, 100)" class="rdr__band rdr__band--safe" fill-rule="evenodd" />
        <path :d="band(40, 70)" class="rdr__band rdr__band--warn" fill-rule="evenodd" />
        <path :d="band(0, 40)" class="rdr__band rdr__band--crit" fill-rule="evenodd" />

        <!-- grade -->
        <polygon
          v-for="lvl in [20, 40, 60, 80, 100]"
          :key="'g' + lvl"
          :points="ring(lvl)"
          :class="['rdr__grid', { 'rdr__grid--edge': lvl === 40 || lvl === 100 }]"
        />
        <polygon :points="ring(70)" class="rdr__grid rdr__grid--edge" />

        <!-- rótulos das faixas, ao longo da aresta superior-esquerda -->
        <g class="rdr__bandtxt">
          <text :transform="edgeLabel(20)">CRÍTICO</text>
          <text :transform="edgeLabel(55)">MODERADO</text>
          <text :transform="edgeLabel(85)">BAIXO</text>
        </g>

        <!-- escala numérica no eixo superior -->
        <g class="rdr__scale">
          <text
            v-for="lvl in [20, 40, 60, 80]"
            :key="'s' + lvl"
            :x="CX + 6"
            :y="pt(0, lvl).y + 3"
          >{{ lvl }}</text>
        </g>

        <!-- eixos com réguas -->
        <g v-for="(t, i) in themes" :key="'ax' + t" :class="['rdr__axisg', { 'is-active': active === i }]">
          <line :x1="CX" :y1="CY" :x2="pt(i, 100).x" :y2="pt(i, 100).y" class="rdr__axis" />
          <line
            v-for="tk in axisTicks(i)"
            :key="tk.v"
            :x1="tk.x1" :y1="tk.y1" :x2="tk.x2" :y2="tk.y2"
            class="rdr__tick"
          />
        </g>

        <!-- avaliação de referência -->
        <g v-if="previous" class="rdr__prev">
          <polygon :points="poly(previous)" class="rdr__area--prev" />
          <g v-for="(t, i) in themes" :key="'p' + t">
            <circle :cx="pt(i, previous[t]).x" :cy="pt(i, previous[t]).y" r="3.2" class="rdr__pdot" />
          </g>
        </g>

        <!-- avaliação atual -->
        <polygon :points="poly(shown)" class="rdr__area--cur" :filter="`url(#${uid('glow')})`" />

        <!-- vetores de mudança: da posição anterior até a atual -->
        <g v-if="previous && settled" class="rdr__vectors">
          <template v-for="(t, i) in themes" :key="'v' + t">
            <line
              v-if="Math.abs(delta(t)) >= 4"
              :x1="vec(i, t).x1" :y1="vec(i, t).y1"
              :x2="vec(i, t).x2" :y2="vec(i, t).y2"
              :class="delta(t) > 0 ? 'rdr__vec rdr__vec--up' : 'rdr__vec rdr__vec--down'"
              :marker-end="`url(#${uid(delta(t) > 0 ? 'arr-up' : 'arr-down')})`"
            />
          </template>
        </g>

        <!-- vértices -->
        <g v-for="(t, i) in themes" :key="'n' + t" :class="['rdr__nodeg', { 'is-weak': t === weakest, 'is-active': active === i }]">
          <rect
            :x="pt(i, shown[t]).x - 9" :y="pt(i, shown[t]).y - 9"
            width="18" height="18"
            :class="`rdr__halo rdr__fill--${tone(scores[t])}`"
          />
          <rect
            :x="pt(i, shown[t]).x - 5" :y="pt(i, shown[t]).y - 5"
            width="10" height="10"
            :class="`rdr__node rdr__fill--${tone(scores[t])}`"
          />
        </g>

        <!-- mira central -->
        <g class="rdr__cross">
          <line :x1="CX - 6" :y1="CY" :x2="CX + 6" :y2="CY" />
          <line :x1="CX" :y1="CY - 6" :x2="CX" :y2="CY + 6" />
        </g>

        <!-- rótulos dos eixos: nome · nota · peso/Δ · respostas -->
        <g
          v-for="(t, i) in themes"
          :key="'l' + t"
          :class="['rdr__lbl', { 'is-active': active === i }]"
          :transform="`translate(${labelPos(i).x} ${labelPos(i).y})`"
          :text-anchor="labelPos(i).anchor"
        >
          <text y="0" class="rdr__lname">
            <tspan>{{ t.toUpperCase() }}</tspan>
            <tspan class="rdr__lval" dx="7">{{ scores[t] }}</tspan>
          </text>
          <text :y="compact ? 22 : 15" class="rdr__lmeta">
            <tspan>PESO {{ weight(t) }}</tspan>
            <tspan v-if="previous" :class="deltaClass(t)"> · {{ deltaText(t) }}</tspan>
          </text>
          <!-- uma célula por pergunta do tema, na cor da resposta -->
          <g :transform="`translate(${stripOffset(i)} ${compact ? 32 : 22})`">
            <rect
              v-for="(c, k) in strip(t)"
              :key="k"
              :x="k * cellStep" y="0" :width="cellStep - 3" :height="compact ? 7 : 5"
              :class="`rdr__cell rdr__cell--${c}`"
            />
          </g>
        </g>

        <!-- áreas de toque/hover por eixo (por cima de tudo, invisíveis) -->
        <g class="rdr__hits">
          <path
            v-for="(t, i) in themes"
            :key="'h' + t"
            :d="hitPath(i)"
            tabindex="0"
            role="button"
            :aria-label="`${t}: ${scores[t]} de 100, peso ${weight(t)}${previous ? `, referência ${previous[t]}` : ', sem referência'}. Use as setas para trocar de eixo.`"
            @mouseenter="active = i"
            @focus="active = i"
            @blur="active = null"
            @keydown.right.prevent="focusAxis(i + 1)"
            @keydown.down.prevent="focusAxis(i + 1)"
            @keydown.left.prevent="focusAxis(i - 1)"
            @keydown.up.prevent="focusAxis(i - 1)"
            @keydown.esc="$event.target.blur()"
          />
        </g>
      </svg>

      <!-- tooltip do eixo em foco (mouse ou teclado) -->
      <div
        v-if="active !== null"
        class="rdr__tip"
        :class="`rdr__tip--${tipSide}`"
        :style="tipStyle"
        role="tooltip"
      >
        <div class="rdr__tiph">
          <b>{{ themes[active] }}</b>
          <span class="tag" :class="`tag--${tone(scores[themes[active]])}`"><i></i>{{ tierLabel(scores[themes[active]]) }}</span>
        </div>
        <div class="readout"><span class="readout__k">Atual</span><span class="readout__dots"></span><span class="readout__v">{{ scores[themes[active]] }}/100</span></div>
        <div class="readout"><span class="readout__k">Peso</span><span class="readout__dots"></span><span class="readout__v">{{ weight(themes[active]) }}</span></div>
        <template v-if="previous">
          <div class="readout"><span class="readout__k">Ref. {{ previousDate }}</span><span class="readout__dots"></span><span class="readout__v rdr__refv">{{ previous[themes[active]] }}/100</span></div>
          <div class="readout"><span class="readout__k">Variação</span><span class="readout__dots"></span><span class="readout__v" :class="deltaClass(themes[active])">{{ signed(delta(themes[active])) }} pts</span></div>
        </template>
        <div v-else class="readout"><span class="readout__k">Referência</span><span class="readout__dots"></span><span class="readout__v">Sem referência</span></div>
      </div>
      </div>
    </div>

    <!-- ================= PAINEL DE LEITURA ================= -->
    <div class="rdr__panel">
      <div class="rdr__stats">
        <div class="rdr__stat">
          <span class="rdr__sk">Área coberta</span>
          <span class="rdr__sv">{{ coverage }}<small>%</small></span>
          <span v-if="previous" class="rdr__sd" :class="signClass(coverage - prevCoverage)">{{ signed(coverage - prevCoverage) }} pp</span>
        </div>
        <div class="rdr__stat">
          <span class="rdr__sk">Dispersão</span>
          <span class="rdr__sv">{{ spread }}<small>pts</small></span>
          <!-- dispersão menor é melhor: o sinal da cor é invertido -->
          <span v-if="previous" class="rdr__sd" :class="signClass(prevSpread - spread)">{{ signed(spread - prevSpread) }} pts</span>
        </div>
        <div class="rdr__stat">
          <span class="rdr__sk">Evolução</span>
          <span v-if="previous" class="rdr__sv rdr__sv--trend">
            <b class="is-up">▲{{ trend.up }}</b><b class="is-down">▼{{ trend.down }}</b><b class="is-flat">■{{ trend.flat }}</b>
          </span>
          <span v-else class="rdr__sv rdr__sv--muted">—</span>
          <span class="rdr__sd rdr__sd--muted">{{ previous ? 'temas' : 'sem referência' }}</span>
        </div>
      </div>

      <ul class="rdr__list">
        <li
          v-for="(t, i) in themes"
          :key="t"
          :class="['rdr__item', { 'is-active': active === i, 'is-weak': t === weakest }]"
          @mouseenter="active = i"
          @mouseleave="active = null"
        >
          <span class="rdr__iname">
            {{ t }}
            <small>Peso {{ weight(t) }} · {{ answeredLine(t) }}</small>
          </span>

          <span class="rdr__track">
            <span class="rdr__zone rdr__zone--crit"></span>
            <span class="rdr__zone rdr__zone--warn"></span>
            <span class="rdr__zone rdr__zone--safe"></span>
            <span class="rdr__bar" :class="`rdr__bg--${tone(scores[t])}`" :style="{ width: shown[t] + '%' }"></span>
            <span v-if="previous" class="rdr__pmark" :style="{ left: previous[t] + '%' }" :title="`Referência: ${previous[t]}`"></span>
          </span>

          <span class="rdr__ival">
            {{ scores[t] }}
            <small v-if="previous" :class="deltaClass(t)">{{ deltaText(t) }}</small>
          </span>
        </li>
      </ul>

      <p class="rdr__insight">
        <span class="rdr__ik">Leitura</span>
        {{ insight }}
      </p>

      <div class="rdr__legend">
        <span><i class="rdr__sw rdr__sw--cur"></i>Atual (linha contínua)</span>
        <span v-if="previous"><i class="rdr__sw rdr__sw--prev"></i>Referência {{ previousDate }} (tracejada)</span>
        <span v-else class="rdr__nolegend">Sem referência</span>
        <span><i class="rdr__lk rdr__lk--safe"></i>Baixo ≥70</span>
        <span><i class="rdr__lk rdr__lk--warn"></i>Moderado 40–69</span>
        <span><i class="rdr__lk rdr__lk--crit"></i>Crítico &lt;40</span>
      </div>
    </div>
  </div>
</template>

<script>
import { THEME_WEIGHTS, getTier, radarCoverage, scoreSpread } from '../utils/scoring.js'

let seq = 0
const TONE_BY_OPTION = ['safe', 'warn', 'crit']

export default {
  name: 'RadarChart',
  props: {
    scores: { type: Object, required: true },
    previous: { type: Object, default: null },
    previousDate: { type: String, default: '' },
    questions: { type: Array, default: () => [] },
    answers: { type: Array, default: () => [] }
  },
  data() {
    const themes = Object.keys(THEME_WEIGHTS)
    return {
      id: `rdr${++seq}`,
      W: 560,
      H: 470,
      CX: 280,
      CY: 238,
      compact: false,
      mq: null,
      themes,
      active: null,
      reduced: false,
      // valores exibidos (animados) do polígono atual
      shown: Object.fromEntries(themes.map(t => [t, 0])),
      settled: false,
      frame: null
    }
  },
  computed: {
    // no celular o raio encolhe para sobrar espaço aos rótulos, que crescem
    R() { return this.compact ? 112 : 148 },
    cellStep() { return this.compact ? 15 : 11 },
    coverage() { return radarCoverage(this.scores) },
    prevCoverage() { return radarCoverage(this.previous) },
    spread() { return scoreSpread(this.scores) },
    prevSpread() { return scoreSpread(this.previous) },
    weakest() {
      return this.themes.reduce((w, t) => (this.scores[t] < this.scores[w] ? t : w), this.themes[0])
    },
    trend() {
      const r = { up: 0, down: 0, flat: 0 }
      this.themes.forEach(t => {
        const d = this.delta(t)
        if (d > 0) r.up += 1
        else if (d < 0) r.down += 1
        else r.flat += 1
      })
      return r
    },
    insight() {
      if (!this.previous) {
        const s = this.scores[this.weakest]
        return `${this.weakest} é o eixo mais curto (${s}). Refaça a avaliação depois de aplicar o plano para ver o polígono crescer.`
      }
      const deltas = this.themes.map(t => ({ t, d: this.delta(t) }))
      const best = deltas.reduce((a, b) => (b.d > a.d ? b : a))
      const worst = deltas.reduce((a, b) => (b.d < a.d ? b : a))
      const parts = []
      if (best.d > 0) parts.push(`maior avanço em ${best.t} (${this.signed(best.d)})`)
      if (worst.d < 0) parts.push(`queda em ${worst.t} (${this.signed(worst.d)})`)
      if (!parts.length) return 'Nenhum tema mudou em relação à referência.'
      const s = parts.join('; ')
      const cov = this.coverage - this.prevCoverage
      const tail = cov === 0 ? '' : ` A área do radar ${cov > 0 ? 'cresceu' : 'encolheu'} ${Math.abs(cov)} pp.`
      return s.charAt(0).toUpperCase() + s.slice(1) + '.' + tail
    },
    bezelTicks() {
      const list = []
      for (let a = 0; a < 360; a += 5) {
        const major = a % 45 === 0
        const r1 = this.R + 16
        const r2 = r1 + (major ? 9 : 4)
        const rad = (a * Math.PI) / 180
        list.push({
          a,
          major,
          x1: this.CX + r1 * Math.cos(rad), y1: this.CY + r1 * Math.sin(rad),
          x2: this.CX + r2 * Math.cos(rad), y2: this.CY + r2 * Math.sin(rad)
        })
      }
      return list
    },
    tipSide() {
      if (this.active === null) return 'r'
      const c = Math.cos(this.angle(this.active))
      return c < -0.3 ? 'r' : c > 0.3 ? 'l' : 'r'
    },
    // ancorado no vértice atual do eixo, em % do viewBox (escala com o SVG)
    tipStyle() {
      const t = this.themes[this.active]
      const p = this.pt(this.active, this.scores[t])
      return { left: (p.x / this.W) * 100 + '%', top: (p.y / this.H) * 100 + '%' }
    },
    ariaLabel() {
      const now = this.themes.map(t => `${t} ${this.scores[t]}`).join(', ')
      if (!this.previous) return `Radar por tema: ${now}`
      const before = this.themes.map(t => `${t} ${this.previous[t]}`).join(', ')
      return `Radar por tema. Atual: ${now}. Referência ${this.previousDate}: ${before}`
    }
  },
  watch: {
    previous() { this.animate() },
    scores() { this.animate() }
  },
  mounted() {
    try {
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      this.mq = window.matchMedia('(max-width: 560px)')
      this.compact = this.mq.matches
      this.mq.addEventListener('change', this.onMq)
    } catch { /* sem matchMedia */ }
    this.animate()
  },
  beforeUnmount() {
    if (this.mq) this.mq.removeEventListener('change', this.onMq)
    if (this.frame) cancelAnimationFrame(this.frame)
  },
  methods: {
    onMq(e) { this.compact = e.matches },
    focusAxis(i) {
      const n = this.themes.length
      const nodes = this.$el.querySelectorAll('.rdr__hits path')
      const el = nodes[(i + n) % n]
      if (el) el.focus()
    },
    uid(name) { return `${this.id}-${name}` },
    weight(t) { return `${Math.round(THEME_WEIGHTS[t] * 100)}%` },
    tone(score) { return getTier(score).tone },
    tierLabel(score) { return getTier(score).label },
    delta(t) { return this.previous ? (this.scores[t] ?? 0) - (this.previous[t] ?? 0) : 0 },
    signed(n) { return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '±0' },
    signClass(n) { return n > 0 ? 'is-up' : n < 0 ? 'is-down' : 'is-flat' },
    deltaText(t) {
      const d = this.delta(t)
      return d > 0 ? `▲${d}` : d < 0 ? `▼${Math.abs(d)}` : '■0'
    },
    deltaClass(t) { return this.signClass(this.delta(t)) },

    // Se há referência, o polígono "migra" da forma anterior para a atual;
    // sem referência, cresce do centro.
    animate() {
      if (this.frame) cancelAnimationFrame(this.frame)
      const from = Object.fromEntries(this.themes.map(t => [t, this.previous ? this.previous[t] ?? 0 : 0]))
      const to = this.scores
      if (this.reduced) {
        this.themes.forEach(t => { this.shown[t] = to[t] })
        this.settled = true
        return
      }
      this.settled = false
      const start = performance.now()
      const dur = this.previous ? 1300 : 1000
      const delay = this.previous ? 350 : 0
      const step = now => {
        const k = Math.max(0, Math.min(1, (now - start - delay) / dur))
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
        this.themes.forEach(t => { this.shown[t] = from[t] + (to[t] - from[t]) * e })
        if (k < 1) this.frame = requestAnimationFrame(step)
        else { this.frame = null; this.settled = true }
      }
      this.frame = requestAnimationFrame(step)
    },

    // eixo i: 0 = topo, sentido horário
    angle(i) { return -Math.PI / 2 + (i * 2 * Math.PI) / this.themes.length },
    pt(i, v, extra = 0) {
      const r = (this.R * Math.max(0, Math.min(100, v ?? 0))) / 100 + extra
      const a = this.angle(i)
      return { x: this.CX + r * Math.cos(a), y: this.CY + r * Math.sin(a) }
    },
    ring(lvl) {
      return this.themes.map((_, i) => { const p = this.pt(i, lvl); return `${p.x},${p.y}` }).join(' ')
    },
    ringPath(lvl) {
      if (lvl <= 0) return ''
      return 'M ' + this.themes.map((_, i) => { const p = this.pt(i, lvl); return `${p.x} ${p.y}` }).join(' L ') + ' Z'
    },
    band(lo, hi) { return `${this.ringPath(hi)} ${this.ringPath(lo)}` },
    poly(obj) {
      return this.themes.map((t, i) => { const p = this.pt(i, obj?.[t] ?? 0); return `${p.x},${p.y}` }).join(' ')
    },
    // ponto médio da aresta topo→esquerda no nível dado, girado ao longo dela
    edgeLabel(lvl) {
      const a = this.pt(0, lvl)
      const b = this.pt(3, lvl)
      const x = (a.x + b.x) / 2
      const y = (a.y + b.y) / 2
      return `translate(${x - 3} ${y - 3}) rotate(-45)`
    },
    axisTicks(i) {
      const list = []
      const a = this.angle(i)
      const nx = -Math.sin(a)
      const ny = Math.cos(a)
      for (let v = 10; v <= 100; v += 10) {
        const p = this.pt(i, v)
        const len = v % 50 === 0 ? 5 : 2.5
        list.push({ v, x1: p.x - nx * len, y1: p.y - ny * len, x2: p.x + nx * len, y2: p.y + ny * len })
      }
      return list
    },
    vec(i, t) {
      // encurta um pouco nas pontas para a seta não ficar sob o vértice
      const d = this.delta(t)
      const pad = 7
      const s = d > 0 ? 1 : -1
      const a = this.pt(i, this.previous[t], s * 4)
      const b = this.pt(i, this.scores[t], -s * pad)
      return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
    },
    labelPos(i) {
      const a = this.angle(i)
      const c = Math.cos(a)
      const s = Math.sin(a)
      const r = this.R + (this.compact ? 26 : 40)
      let x = this.CX + r * c
      let y = this.CY + r * s
      let anchor = 'middle'
      if (c > 0.3) { anchor = 'start'; x -= 4; y -= 10 }
      else if (c < -0.3) { anchor = 'end'; x += 4; y -= 10 }
      else if (s < 0) { y -= this.compact ? 34 : 22 }
      else { y += 6 }
      return { x, y, anchor }
    },
    stripOffset(i) {
      const n = this.strip(this.themes[i]).length
      const w = n * this.cellStep - 3
      const anchor = this.labelPos(i).anchor
      return anchor === 'middle' ? -w / 2 : anchor === 'end' ? -w : 0
    },
    strip(t) {
      const out = []
      this.questions.forEach((q, idx) => {
        if (q.theme !== t) return
        const a = this.answers[idx]
        out.push(a === null || a === undefined ? 'none' : TONE_BY_OPTION[a])
      })
      return out
    },
    answeredLine(t) {
      const s = this.strip(t)
      const ok = s.filter(c => c === 'safe').length
      return `${ok}/${s.length} ok`
    },
    // fatia do losango que pertence a cada eixo (para hover/toque)
    hitPath(i) {
      const n = this.themes.length
      const half = Math.PI / n
      const a = this.angle(i)
      const r = this.R + 70
      const p1 = { x: this.CX + r * Math.cos(a - half), y: this.CY + r * Math.sin(a - half) }
      const p2 = { x: this.CX + r * Math.cos(a + half), y: this.CY + r * Math.sin(a + half) }
      return `M ${this.CX} ${this.CY} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z`
    }
  }
}
</script>

<style scoped>
.rdr {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  border-top: 1px solid var(--line-soft);
}

/* ---------- palco ---------- */
.rdr__stage {
  position: relative;
  padding: 10px 8px;
  border-right: 1px solid var(--line-soft);
  background:
    radial-gradient(circle at 50% 50%, rgba(var(--fx), 0.025), transparent 65%);
}

.rdr__svg {
  display: block;
  width: 100%;
  max-width: 620px;
  height: auto;
  margin: 0 auto;
  overflow: visible;
  font-family: 'Azeret Mono', ui-monospace, monospace;
}

.rdr__hud path {
  fill: none;
  stroke: var(--line-strong);
  stroke-width: 1.2;
}

.rdr__hudtxt {
  font-size: 9.5px;
  letter-spacing: 0.16em;
  fill: var(--ink-lo);
}

.rdr__hud--prev { fill: var(--ref); }

.rdr__ring {
  fill: none;
  stroke: var(--line);
  stroke-width: 1;
}

.rdr__ring--inner {
  stroke: var(--line-soft);
  stroke-dasharray: 1 3;
}

.rdr__btick { stroke: var(--line); stroke-width: 1; }
.rdr__btick--major { stroke: var(--line-strong); stroke-width: 1.4; }


@media (prefers-reduced-motion: no-preference) {
  .rdr__nodeg.is-weak .rdr__halo { animation: rdr-pulse 1.8s ease-in-out infinite; }
}

@keyframes rdr-pulse {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.45; }
}

.rdr__band { stroke: none; }
/* faixas neutras: o tom só escurece em direção ao centro (mais risco);
   a cor fica reservada aos dados */
.rdr__band--crit { fill: rgba(var(--fx), 0.075); }
.rdr__band--warn { fill: rgba(var(--fx), 0.045); }
.rdr__band--safe { fill: rgba(var(--fx), 0.02); }

.rdr__grid {
  fill: none;
  stroke: var(--line-soft);
  stroke-width: 1;
  stroke-dasharray: 2 4;
}

.rdr__grid--edge {
  stroke: var(--line);
  stroke-dasharray: none;
}

/* textos internos: contorno na cor do fundo para não se perderem
   sobre a grade e os polígonos */
.rdr__bandtxt text,
.rdr__scale text {
  paint-order: stroke;
  stroke: var(--panel-deep);
  stroke-width: 3.5px;
  stroke-linejoin: round;
}

.rdr__bandtxt text {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
  fill: var(--ink-mid);
  text-anchor: middle;
}

.rdr__scale text {
  font-size: 10px;
  font-weight: 500;
  fill: var(--ink-mid);
}

.rdr__axis {
  stroke: var(--line);
  stroke-width: 1;
}

.rdr__tick {
  stroke: var(--line-strong);
  stroke-width: 1;
}

.rdr__axisg { transition: opacity var(--dur) var(--ease); }
.rdr__axisg.is-active .rdr__axis { stroke: var(--ink-mid); }

.rdr__area--prev {
  fill: rgba(var(--ref-rgb), 0.08);
  stroke: var(--ref);
  stroke-width: 1.6;
  stroke-dasharray: 6 4;
  stroke-linejoin: round;
}

.rdr__pdot {
  fill: var(--bg);
  stroke: var(--ref);
  stroke-width: 1.6;
}

.rdr__area--cur {
  fill: rgba(var(--ink-rgb), 0.1);
  stroke: var(--ink);
  stroke-width: 2.2;
  stroke-linejoin: round;
}

.rdr__vec {
  stroke-width: 2;
  stroke-linecap: round;
}

.rdr__vec--up { stroke: var(--safe); }
.rdr__vec--down { stroke: var(--crit); }
.rdr__arrow--up { fill: var(--safe); }
.rdr__arrow--down { fill: var(--crit); }

.rdr__vectors {
  animation: rdr-fade var(--dur-slow) var(--ease) both;
}

@keyframes rdr-fade { from { opacity: 0; } }

.rdr__fill--crit { fill: var(--g-crit); }
.rdr__fill--warn { fill: var(--g-warn); }
.rdr__fill--safe { fill: var(--g-safe); }

.rdr__halo { opacity: 0.16; }
.rdr__node { stroke: var(--bg); stroke-width: 1.5; }
.rdr__nodeg.is-active .rdr__halo { opacity: 0.4; }

.rdr__cross line {
  stroke: var(--ink-faint);
  stroke-width: 1;
}

.rdr__lbl { transition: opacity var(--dur) var(--ease); }

.rdr__lname {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.12em;
  fill: var(--ink-mid);
}

.rdr__lval {
  fill: var(--ink);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0;
}

.rdr__lmeta {
  font-size: 9.5px;
  letter-spacing: 0.14em;
  fill: var(--ink-lo);
}

.rdr__cell--safe { fill: var(--g-safe); background: var(--g-safe); }
.rdr__cell--warn { fill: var(--g-warn); background: var(--g-warn); }
.rdr__cell--crit { fill: var(--g-crit); background: var(--g-crit); }
.rdr__cell--none { fill: var(--line-strong); background: var(--line-strong); }

/* foco: o eixo em destaque mantém brilho total, os outros recuam */
.has-active .rdr__lbl:not(.is-active),
.has-active .rdr__axisg:not(.is-active) {
  opacity: 0.35;
}

.rdr__lbl.is-active .rdr__lname { fill: var(--ink); }

.rdr__hits path {
  fill: transparent;
  outline: none;
  cursor: crosshair;
}

/* foco por teclado: a fatia do eixo ganha contorno visível */
.rdr__hits path:focus-visible {
  fill: rgba(var(--ref-rgb), 0.06);
  stroke: var(--ref);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}

/* ---------- painel ---------- */
.rdr__panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.rdr__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid var(--line-soft);
}

.rdr__stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px 16px 13px;
  border-right: 1px solid var(--line-soft);
}

.rdr__stat:last-child { border-right: none; }

.rdr__sk {
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-lo);
}

.rdr__sv {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.05em;
  color: var(--ink);
  line-height: 1.15;
}

.rdr__sv small {
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: var(--ink-lo);
  margin-left: 3px;
}

.rdr__sv--trend {
  display: flex;
  gap: 8px;
  font-size: 15px;
  letter-spacing: 0;
  padding-top: 5px;
}

.rdr__sv--muted { color: var(--ink-faint); }

.rdr__sd {
  font-size: 10px;
  letter-spacing: 0.08em;
}

.rdr__sd--muted { color: var(--ink-lo); text-transform: uppercase; letter-spacing: 0.14em; font-size: 9px; }

.is-up { color: var(--safe); fill: var(--safe); }
.is-down { color: var(--crit); fill: var(--crit); }
.is-flat { color: var(--ink-lo); fill: var(--ink-lo); }

.rdr__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rdr__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(90px, 1.1fr) 56px;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line-soft);
  transition: background var(--dur) var(--ease);
  cursor: default;
}

.rdr__item.is-active { background: rgba(var(--fx), 0.04); }
.rdr__item.is-weak { box-shadow: inset 3px 0 0 var(--crit); }

.rdr__iname {
  font-size: 11.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink);
  min-width: 0;
}

.rdr__iname small {
  display: block;
  margin-top: 3px;
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--ink-lo);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* trilha com as três faixas de risco + barra atual + marca da referência */
.rdr__track {
  position: relative;
  display: block;
  height: 12px;
}

.rdr__zone {
  position: absolute;
  top: 4px;
  height: 4px;
  opacity: 0.55;
}

.rdr__zone--crit { left: 0; width: 40%; background: rgba(var(--fx), 0.12); }
.rdr__zone--warn { left: 40%; width: 30%; background: rgba(var(--fx), 0.08); border-left: 1px solid var(--panel-deep); }
.rdr__zone--safe { left: 70%; width: 30%; background: rgba(var(--fx), 0.05); border-left: 1px solid var(--panel-deep); }

.rdr__bar {
  position: absolute;
  left: 0;
  top: 4px;
  height: 4px;
}

.rdr__bg--crit { background: var(--g-crit); }
.rdr__bg--warn { background: var(--g-warn); }
.rdr__bg--safe { background: var(--g-safe); }

.rdr__pmark {
  position: absolute;
  top: 0;
  width: 2px;
  height: 12px;
  margin-left: -1px;
  background: var(--ref);
  box-shadow: 0 0 0 1px var(--bg);
}

.rdr__ival {
  text-align: right;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.04em;
  color: var(--ink);
  line-height: 1.1;
}

.rdr__ival small {
  display: block;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.rdr__insight {
  margin: 0;
  padding: 14px 16px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--ink-mid);
  border-bottom: 1px solid var(--line-soft);
  flex: 1;
}

.rdr__ik {
  display: inline-block;
  margin-right: 8px;
  padding: 1px 6px;
  border: 1px solid var(--line-strong);
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink);
}

.rdr__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  padding: 11px 16px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-lo);
  background: rgba(var(--fx), 0.015);
}

.rdr__legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.rdr__sw {
  display: inline-block;
  width: 16px;
  border-top: 2px solid var(--ink);
}

.rdr__sw--prev { border-top: 2px dashed var(--ref); }

.rdr__nolegend { color: var(--ink-lo); font-style: italic; text-transform: none; letter-spacing: 0.04em; }

/* chave das faixas: mesma forma das etiquetas (cor + glifo) */
.rdr__lk { width: 7px; height: 7px; display: inline-block; }
.rdr__lk--crit { background: var(--g-crit); clip-path: polygon(50% 0, 100% 100%, 0 100%); }
.rdr__lk--warn { background: var(--g-warn); clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
.rdr__lk--safe { background: var(--g-safe); border-radius: 50%; }



/* ---------- tooltip ---------- */
.rdr__plot { position: relative; }

.rdr__tip {
  position: absolute;
  z-index: 3;
  width: 210px;
  padding: 10px 12px 8px;
  background: var(--panel-deep);
  border: 1px solid var(--line-strong);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  pointer-events: none;
  display: grid;
  gap: 4px;
}

.rdr__tip--r { transform: translate(14px, -50%); }
.rdr__tip--l { transform: translate(calc(-100% - 14px), -50%); }

.rdr__tiph {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink);
}

.rdr__tip .readout { font-size: 9.5px; }
.rdr__refv { color: var(--ref) !important; }

@media (max-width: 560px) {
  .rdr__tip { width: 180px; }
  .rdr__tip--r, .rdr__tip--l { left: 50% !important; transform: translate(-50%, 18px); }
}

.rdr__cellkey {
  display: inline-block;
  width: 7px;
  height: 4px;
  margin-right: -3px;
}

.rdr__cellkey:last-of-type { margin-right: 2px; }

/* ---------- responsivo ---------- */
/* compacto: o SVG é reduzido a ~350px, então os textos crescem em
   unidades do viewBox para continuarem legíveis */
.is-compact .rdr__lname { font-size: 21px; }
.is-compact .rdr__lval { font-size: 24px; }
.is-compact .rdr__lmeta { font-size: 15px; letter-spacing: 0.08em; }
.is-compact .rdr__hudtxt { font-size: 15px; letter-spacing: 0.08em; }
.is-compact .rdr__bandtxt,
.is-compact .rdr__scale { display: none; }

@media (max-width: 980px) {
  .rdr { grid-template-columns: minmax(0, 1fr); }
  .rdr__stage { border-right: none; border-bottom: 1px solid var(--line-soft); }
}

@media (max-width: 560px) {
  .rdr__stage { padding: 4px 0; }
  .rdr__stat { padding: 12px 12px 11px; }
  .rdr__sv { font-size: 20px; }
  .rdr__item { grid-template-columns: minmax(0, 1fr) 70px 48px; gap: 10px; padding: 11px 14px; }
}
</style>

<style>
/* regras do tema claro fora do scoped: o seletor do tema fica no <html> */
/* no claro: sem brilho, grade e faixas no cinza neutro (#64748B) e área
   atual translúcida, para não esconder a grade nem a referência */
:root[data-theme='light'] .rdr .rdr__area--cur {
  filter: none;
  fill: rgba(var(--neutral-rgb), 0.12);
  stroke: #0f172a;
}
:root[data-theme='light'] .rdr .rdr__band--crit { fill: rgba(var(--neutral-rgb), 0.1); }
:root[data-theme='light'] .rdr .rdr__band--warn { fill: rgba(var(--neutral-rgb), 0.06); }
:root[data-theme='light'] .rdr .rdr__band--safe { fill: rgba(var(--neutral-rgb), 0.03); }
:root[data-theme='light'] .rdr .rdr__grid,
:root[data-theme='light'] .rdr .rdr__axis,
:root[data-theme='light'] .rdr .rdr__ring { stroke: rgba(var(--neutral-rgb), 0.35); }
:root[data-theme='light'] .rdr .rdr__bandtxt text,
:root[data-theme='light'] .rdr .rdr__scale text,
:root[data-theme='light'] .rdr .rdr__lmeta,
:root[data-theme='light'] .rdr .rdr__hudtxt { fill: var(--neutral); }
</style>
