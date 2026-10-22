<template>
  <!-- só o corpo: moldura e cabeçalho ficam no ResultsView -->
  <div v-if="!diff" class="chg__empty">
    A avaliação de referência foi registrada antes de o app guardar as respostas
    individuais, então só dá para comparar as notas por tema (no radar acima).
  </div>

  <div v-else class="chg">
    <!-- os indicadores são também os filtros: só mudam o que é exibido -->
    <div class="chg__sum" role="group" aria-label="Filtrar mudanças nas respostas">
      <button
        type="button"
        class="chg__pill chg__pill--all"
        :class="{ 'is-on': filter === 'all' }"
        :aria-pressed="String(filter === 'all')"
        @click="filter = 'all'"
      >
        <b>{{ total }}</b> todas
      </button>
      <button
        v-for="f in filters"
        :key="f.key"
        type="button"
        class="chg__pill"
        :class="[f.cls, { 'is-on': filter === f.key, 'is-dim': filter !== 'all' && filter !== f.key }]"
        :aria-pressed="String(filter === f.key)"
        :title="filter === f.key ? 'Clique de novo para ver todas' : `Mostrar só as que ${f.label}`"
        @click="toggle(f.key)"
      >
        <span class="chg__mark" aria-hidden="true">{{ f.icon }}</span><b>{{ f.items.length }}</b> {{ f.label }}
      </button>
    </div>

    <div class="chg__status" aria-live="polite">
      <span v-if="filter === 'all'" class="chg__stxt">
        Todas as {{ total }} respostas
        <template v-if="!diff.improved.length && !diff.worsened.length"> · nenhuma mudou em relação à referência</template>
        <template v-if="diff.unrated.length"> · {{ diff.unrated.length }} sem comparação</template>
      </span>
      <span v-else class="chg__stxt">
        Filtro <b :class="activeFilter.cls">{{ activeFilter.icon }} {{ activeFilter.label }}</b>
        · {{ visibleCount }} de {{ total }} respostas
      </span>
      <button v-if="filter !== 'all'" type="button" class="chg__clear" @click="filter = 'all'">
        Ver todas
      </button>
    </div>

    <Transition name="chg-swap" mode="out-in">
      <div :key="filter" class="chg__list">
        <template v-for="group in visibleGroups" :key="group.key">
          <div class="chg__group">
            <div class="chg__gh" :class="group.cls">
              <span>{{ group.icon }}</span>{{ group.label }}
              <span class="chg__gn">{{ group.items.length }}</span>
            </div>
            <ul class="rows">
              <li v-for="item in group.items" :key="item.index" class="row chg__row" v-reveal>
                <span class="rnum">{{ String(item.index + 1).padStart(2, '0') }}</span>
                <div class="chg__body">
                  <span class="chg__theme">{{ item.theme }}</span>
                  <p class="chg__q">{{ item.text }}</p>
                  <div class="chg__ans">
                    <span class="chg__before" :class="{ 'is-struck': group.changed }">{{ item.before }}</span>
                    <span class="chg__arrow" :class="group.cls" aria-hidden="true">{{ group.changed ? '→' : '=' }}</span>
                    <span class="chg__now">{{ item.now }}</span>
                  </div>
                </div>
                <span class="chg__pts" :class="group.cls">{{ pointsText(item.points) }}</span>
              </li>
            </ul>
          </div>
        </template>

        <p v-if="!visibleCount" class="chg__empty chg__empty--filter">
          Nenhuma resposta encontrada nesta categoria.
        </p>
      </div>
    </Transition>
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
  data() {
    // abre mostrando tudo; o filtro escolhido sobrevive à troca de referência
    return { filter: 'all' }
  },
  computed: {
    diff() {
      return diffAnswers(this.questions, this.answers, this.previousAnswers)
    },
    total() {
      return this.questions.length
    },
    filters() {
      if (!this.diff) return []
      return [
        { key: 'worsened', label: 'pioraram', icon: '▼', cls: 'is-down', items: this.diff.worsened },
        { key: 'improved', label: 'melhoraram', icon: '▲', cls: 'is-up', items: this.diff.improved },
        { key: 'same', label: 'iguais', icon: '■', cls: 'is-flat', items: this.diff.unchanged }
      ]
    },
    activeFilter() {
      return this.filters.find(f => f.key === this.filter) || null
    },
    // o que piorou vem primeiro: é o que pede ação
    groups() {
      if (!this.diff) return []
      return [
        { key: 'worsened', label: 'Pioraram', icon: '▼', cls: 'is-down', changed: true, items: this.diff.worsened },
        { key: 'improved', label: 'Melhoraram', icon: '▲', cls: 'is-up', changed: true, items: this.diff.improved },
        { key: 'same', label: 'Iguais', icon: '■', cls: 'is-flat', changed: false, items: this.diff.unchanged },
        { key: 'unrated', label: 'Sem comparação · falta resposta', icon: '?', cls: 'is-flat', changed: false, items: this.diff.unrated }
      ]
    },
    visibleGroups() {
      return this.groups.filter(g => g.items.length && (this.filter === 'all' || g.key === this.filter))
    },
    visibleCount() {
      return this.visibleGroups.reduce((n, g) => n + g.items.length, 0)
    }
  },
  methods: {
    // clicar no filtro ativo volta para a visão completa
    toggle(key) {
      this.filter = this.filter === key ? 'all' : key
    },
    pointsText(p) {
      if (p === null) return '—'
      if (p === 0) return '±0'
      return `${p > 0 ? '+' : '−'}${Math.abs(p)}`
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

.chg__empty--filter {
  margin: 0;
  border-top: 1px solid var(--line-soft);
  font-size: 12px;
  letter-spacing: 0.04em;
}

.chg__sum {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid var(--line-soft);
}

.chg__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  margin: 0;
  padding: 6px 12px;
  font: inherit;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: inherit;
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 0;
  cursor: pointer;
  transition:
    background var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease),
    opacity var(--dur) var(--ease);
}

.chg__pill.is-up { --pill: var(--safe); }
.chg__pill.is-down { --pill: var(--crit); }
.chg__pill.is-flat { --pill: var(--ink-lo); }
.chg__pill--all { --pill: var(--ink-mid); }
.chg__pill { color: var(--pill); }

.chg__pill b {
  font-size: 12px;
}

.chg__mark { font-size: 9px; }

.chg__pill:hover { background: rgba(var(--fx), 0.05); }

/* selecionado: preenchido (não depende só da cor) */
.chg__pill.is-on,
.chg__pill.is-on:hover {
  color: var(--panel-deep);
  background: var(--pill);
  border-color: var(--pill);
}

.chg__pill.is-dim { opacity: 0.55; }
.chg__pill.is-dim:hover { opacity: 0.85; }

.chg__pill:focus-visible,
.chg__clear:focus-visible {
  outline: 1px solid var(--accent);
  outline-offset: 2px;
}

.chg__status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 12px;
  padding: 0 18px 12px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-lo);
}

.chg__stxt b { font-weight: 600; }

.chg__clear {
  min-height: 28px;
  padding: 4px 10px;
  font: inherit;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-mid);
  background: transparent;
  border: 1px solid var(--line-strong);
  border-radius: 0;
  cursor: pointer;
}

.chg__clear::before { content: '× '; }
.chg__clear:hover { color: var(--ink); border-color: var(--ink-mid); }

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

.chg__gn {
  margin-left: auto;
  color: var(--ink-lo);
  letter-spacing: 0.08em;
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

.chg__before { color: var(--ink-lo); }

.chg__before.is-struck {
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

/* troca de filtro: fade curto, sem deslocar o texto que está sendo lido */
.chg-swap-enter-active { transition: opacity 180ms var(--ease); }
.chg-swap-leave-active { transition: opacity 110ms var(--ease); }
.chg-swap-enter-from,
.chg-swap-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .chg-swap-enter-active,
  .chg-swap-leave-active { transition: none; }
}

@media (max-width: 560px) {
  .chg__sum {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 12px 14px;
  }
  .chg__pill { justify-content: center; min-height: 40px; }
  .chg__status { padding: 0 14px 12px; }
}
</style>
