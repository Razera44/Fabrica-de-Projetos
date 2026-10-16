<template>
  <!-- só o corpo: moldura e cabeçalho ficam no ResultsView -->
  <div v-if="!diff" class="chg__empty">
    A avaliação de referência foi registrada antes de o app guardar as respostas
    individuais, então só dá para comparar as notas por tema (no radar acima).
  </div>

  <div v-else-if="!diff.improved.length && !diff.worsened.length" class="chg__empty">
    Todas as {{ diff.same }} respostas são iguais às da referência.
  </div>

  <div v-else class="chg">
    <div class="chg__sum">
      <span class="chg__pill is-down"><b>{{ diff.worsened.length }}</b> pioraram</span>
      <span class="chg__pill is-up"><b>{{ diff.improved.length }}</b> melhoraram</span>
      <span class="chg__pill is-flat"><b>{{ diff.same }}</b> iguais</span>
    </div>

    <template v-for="group in groups" :key="group.key">
      <div v-if="group.items.length" class="chg__group">
        <div class="chg__gh" :class="group.cls">
          <span>{{ group.icon }}</span>{{ group.label }}
        </div>
        <ul class="rows">
          <li v-for="item in group.items" :key="item.index" class="row chg__row" v-reveal>
            <span class="rnum">{{ String(item.index + 1).padStart(2, '0') }}</span>
            <div class="chg__body">
              <span class="chg__theme">{{ item.theme }}</span>
              <p class="chg__q">{{ item.text }}</p>
              <div class="chg__ans">
                <span class="chg__before">{{ item.before }}</span>
                <span class="chg__arrow" :class="group.cls" aria-hidden="true">→</span>
                <span class="chg__now">{{ item.now }}</span>
              </div>
            </div>
            <span class="chg__pts" :class="group.cls">{{ item.points > 0 ? '+' : '−' }}{{ Math.abs(item.points) }}</span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script>
import { diffAnswers } from '../utils/scoring.js'

export default {
  name: 'AnswerChanges',
  props: {
    questions: { type: Array, required: true },
    answers: { type: Array, required: true },
    previousAnswers: { type: Array, default: null }
  },
  computed: {
    diff() {
      return diffAnswers(this.questions, this.answers, this.previousAnswers)
    },
    // o que piorou vem primeiro: é o que pede ação
    groups() {
      if (!this.diff) return []
      return [
        { key: 'w', label: 'Pioraram', icon: '▼', cls: 'is-down', items: this.diff.worsened },
        { key: 'i', label: 'Melhoraram', icon: '▲', cls: 'is-up', items: this.diff.improved }
      ]
    }
  }
}
</script>

<style scoped>
.chg__empty {
  padding: 20px 18px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--ink-lo);
}

.chg__sum {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid var(--line-soft);
}

.chg__pill {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 4px 9px;
  border: 1px solid currentColor;
}

.chg__pill b {
  font-size: 12px;
  margin-right: 4px;
}

.is-up { color: var(--safe); }
.is-down { color: var(--crit); }
.is-flat { color: var(--ink-lo); }

.chg__gh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-top: 1px solid var(--line-soft);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  background: rgba(var(--fx), 0.015);
}

.chg__row {
  grid-template-columns: 26px minmax(0, 1fr) 52px;
  align-items: start;
}

.chg__theme {
  font-size: 9.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-lo);
}

.chg__q {
  margin: 3px 0 8px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--ink);
}

.chg__ans {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  font-size: 11px;
  line-height: 1.5;
}

.chg__before {
  color: var(--ink-lo);
  text-decoration: line-through;
  text-decoration-color: var(--line-strong);
}

.chg__now { color: var(--ink-mid); }

.chg__pts {
  text-align: right;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.03em;
}
</style>
