<template>
  <!-- só o corpo: a moldura e o cabeçalho do módulo ficam no ResultsView -->
  <div v-if="entries.length < 2" class="hist__empty">
    Essa é a primeira avaliação registrada. Refaça o questionário depois de um tempo
    pra começar a acompanhar a evolução aqui.
  </div>

  <div v-else class="hist">
    <div class="hist__plot">
      <!-- a linha é desenhada esticada; os pontos são HTML posicionado em %,
           senão o preserveAspectRatio="none" achataria os círculos -->
      <svg class="hist__line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline :points="linePoints" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="0.6" vector-effect="non-scaling-stroke" />
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
  </div>
</template>

<script>
import { getTier } from '../utils/scoring.js'

export default {
  name: 'HistoryPanel',
  props: {
    entries: {
      type: Array,
      required: true
    }
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

.hist__delta {
  text-align: right;
}

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
