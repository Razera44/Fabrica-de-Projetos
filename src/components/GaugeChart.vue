<template>
  <div class="gauge">
    <!--
      Geometria única: centro (140, 146), raio 112, semicírculo de 180° a 0°.
      Arco preenchido e marcador derivam do MESMO valor (display), então ficam
      sempre sincronizados e terminam exatamente na pontuação real.
    -->
    <svg class="gauge__svg" viewBox="0 0 280 176" role="img" :aria-label="`Nota ${score} de 100 — ${tier.label}`">
      <defs>
        <linearGradient id="gaugeScale" gradientUnits="userSpaceOnUse" x1="28" y1="0" x2="252" y2="0">
          <stop offset="0%" stop-color="#e2707a" />
          <stop offset="48%" stop-color="#e5bb63" />
          <stop offset="100%" stop-color="#4fdd76" />
        </linearGradient>
        <filter id="gaugeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- marcações da escala -->
      <g class="gauge__ticks">
        <line
          v-for="tick in ticks"
          :key="tick.value"
          :x1="tick.x1"
          :y1="tick.y1"
          :x2="tick.x2"
          :y2="tick.y2"
          :class="{ 'is-major': tick.major }"
        />
      </g>

      <!-- trilha -->
      <path
        class="gauge__track"
        d="M 28 146 A 112 112 0 0 1 252 146"
        fill="none"
        stroke-width="9"
        stroke-linecap="round"
      />

      <!-- preenchimento até a pontuação -->
      <path
        d="M 28 146 A 112 112 0 0 1 252 146"
        fill="none"
        stroke="url(#gaugeScale)"
        stroke-width="9"
        stroke-linecap="round"
        pathLength="100"
        stroke-dasharray="100 100"
        :stroke-dashoffset="100 - display"
        filter="url(#gaugeGlow)"
      />

      <!-- marcador na posição exata da nota -->
      <circle :cx="marker.x" :cy="marker.y" r="7" class="gauge__marker-halo" :style="{ fill: tierColor }" />
      <circle :cx="marker.x" :cy="marker.y" r="4" :style="{ fill: tierColor }" />
      <circle :cx="marker.x" :cy="marker.y" r="1.6" fill="#0a0a0a" />

      <!-- leitura principal -->
      <text class="gauge__score" x="140" y="124" text-anchor="middle">{{ Math.round(display) }}</text>
      <text class="gauge__unit" x="140" y="142" text-anchor="middle">DE 100 PONTOS</text>

      <!-- extremos da escala -->
      <text class="gauge__bound" x="28" y="168" text-anchor="middle">0</text>
      <text class="gauge__bound" x="252" y="168" text-anchor="middle">100</text>
    </svg>

    <div class="gauge__tier" :style="{ color: tierColor }">
      <span class="gauge__dot" :style="{ background: tierColor }"></span>
      <!-- o texto fica isolado num span: v-scramble reescreve textContent e
           apagaria o ponto colorido se aplicado no elemento inteiro -->
      <span v-scramble="{ delay: 700, duration: 1700 }">{{ tier.label.toUpperCase() }}</span>
    </div>
  </div>
</template>

<script>
import { getTier } from '../utils/scoring.js'

const CX = 140
const CY = 146
const R = 112

export default {
  name: 'GaugeChart',
  props: {
    score: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      display: 0,
      frame: null
    }
  },
  computed: {
    tier() {
      // classificação sempre pela nota real, nunca pelo valor animado
      return getTier(this.score)
    },
    tierColor() {
      return `var(--${this.tier.tone})`
    },
    // ponto exato sobre o arco para o valor atualmente exibido
    marker() {
      const rad = ((180 - (this.display / 100) * 180) * Math.PI) / 180
      return {
        x: +(CX + R * Math.cos(rad)).toFixed(2),
        y: +(CY - R * Math.sin(rad)).toFixed(2)
      }
    },
    ticks() {
      const list = []
      for (let i = 0; i <= 10; i += 1) {
        const value = i * 10
        const rad = ((180 - (value / 100) * 180) * Math.PI) / 180
        const major = value % 50 === 0
        const inner = 122
        const outer = major ? 133 : 128
        list.push({
          value,
          major,
          x1: +(CX + inner * Math.cos(rad)).toFixed(2),
          y1: +(CY - inner * Math.sin(rad)).toFixed(2),
          x2: +(CX + outer * Math.cos(rad)).toFixed(2),
          y2: +(CY - outer * Math.sin(rad)).toFixed(2)
        })
      }
      return list
    }
  },
  mounted() {
    this.animate()
  },
  beforeUnmount() {
    if (this.frame) cancelAnimationFrame(this.frame)
  },
  methods: {
    animate() {
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        this.display = this.score
        return
      }

      const duration = 1200
      const start = performance.now()
      const step = now => {
        const t = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        this.display = this.score * eased
        if (t < 1) {
          this.frame = requestAnimationFrame(step)
        } else {
          // termina exatamente na pontuação real
          this.display = this.score
          this.frame = null
        }
      }
      this.frame = requestAnimationFrame(step)
    }
  }
}
</script>

<style scoped>
.gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.gauge__svg {
  width: 100%;
  max-width: 300px;
  height: auto;
  display: block;
  overflow: visible;
  /* texto dentro de SVG não herda a família do body: precisa ser declarada */
  font-family: 'Azeret Mono', ui-monospace, monospace;
}

.gauge__track {
  stroke: rgba(244, 244, 239, 0.08);
}

.gauge__ticks line {
  stroke: rgba(244, 244, 239, 0.16);
  stroke-width: 1;
}

.gauge__ticks line.is-major {
  stroke: rgba(244, 244, 239, 0.32);
  stroke-width: 1.4;
}

.gauge__marker-halo {
  opacity: 0.22;
}

.gauge__score {
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.06em;
  fill: var(--ink);
}

.gauge__unit {
  font-size: 9px;
  letter-spacing: 0.18em;
  fill: var(--ink-lo);
}

.gauge__bound {
  font-size: 9px;
  letter-spacing: 0.1em;
  fill: var(--ink-faint);
}

.gauge__tier {
  font-size: 11.5px;
  letter-spacing: 0.16em;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.gauge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>
