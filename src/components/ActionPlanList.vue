<template>
  <!--
    Só as linhas: a moldura, o cabeçalho e o número do módulo ficam no
    ResultsView, para que plano, temas e histórico usem a mesma régua.
    O primeiro item é o tema mais frágil (buildActionPlan já ordena por
    nota), então ele absorve o antigo card "principal ponto de atenção".
  -->
  <div class="rows">
    <div
      v-for="(item, i) in items"
      :key="item.theme"
      class="row row--plan"
      :class="{ 'row--first': i === 0 }"
      v-reveal="i * 60"
    >
      <span class="rnum" v-scramble="i * 60">{{ String(i + 1).padStart(2, '0') }}</span>

      <div class="plan__body">
        <div class="plan__meta">
          <span v-if="i === 0" class="plan__flag">Principal ponto de atenção</span>
          <span v-else class="tag" :class="`tag--${item.tone}`"><i></i>{{ tierLabel(item.tone) }}</span>
          <span class="plan__theme">{{ item.theme }} · {{ item.score }}</span>
        </div>
        <h3 class="plan__title" v-scramble="i * 60 + 120">{{ item.title }}</h3>
        <p class="plan__desc">{{ item.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionPlanList',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  methods: {
    // mesmo vocabulário do getTier: nada de "crítico/importante" aqui e
    // "risco alto/moderado" no medidor para dizer a mesma coisa
    tierLabel(tone) {
      if (tone === 'crit') return 'Risco alto'
      if (tone === 'warn') return 'Risco moderado'
      return 'Risco baixo'
    }
  }
}
</script>

<style scoped>
.row--plan {
  grid-template-columns: 26px minmax(0, 1fr);
  align-items: start;
  padding: 16px 18px;
  transition: background var(--dur) var(--ease);
}

.row--plan:hover {
  background: rgba(255, 255, 255, 0.018);
}

/* o item mais frágil ganha tarja lateral em vez de uma caixa própria */
.row--first {
  background: rgba(226, 112, 122, 0.055);
  box-shadow: inset 3px 0 0 var(--crit);
}

.row--first:hover {
  background: rgba(226, 112, 122, 0.08);
}

.rnum {
  line-height: 1.9;
}

.plan__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.plan__flag {
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--crit);
  border: 1px solid rgba(226, 112, 122, 0.45);
  padding: 1px 6px;
}

.plan__theme {
  font-size: 9.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-lo);
}

.plan__title {
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--ink);
  line-height: 1.4;
  margin-bottom: 4px;
}

.plan__desc {
  font-size: 12.5px;
  color: var(--ink-lo);
  line-height: 1.65;
  max-width: 60ch;
}

@media (max-width: 420px) {
  .row--plan {
    grid-template-columns: 22px minmax(0, 1fr);
    gap: 12px;
    padding: 15px 14px;
  }
}
</style>
