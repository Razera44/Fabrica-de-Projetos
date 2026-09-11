<template>
  <section class="done">
    <div class="done__inner container">
      <div class="frame done__frame">
        <span class="frame__led frame__led--tl"></span>
        <span class="frame__led frame__led--tr"></span>
        <span class="frame__led frame__led--br"></span>
        <span class="frame__led frame__led--bl"></span>
<div class="frame__in done__panel">
          <div class="frame__sweep"></div>
        <header class="done__head rise" style="--i: 0">
          <span class="index">OK</span>
          <span class="done__headline">Coleta concluída</span>
          <span class="done__fill"></span>
          <span class="done__count">{{ total }}/{{ total }}</span>
        </header>

        <div class="hatch"></div>

        <div class="done__body">
          <p class="display done__title rise" style="--i: 1">
            <span class="done__caret" aria-hidden="true">&gt;</span>Todos os {{ total }} itens respondidos
          </p>

          <div class="done__log rise" style="--i: 2">
            <div class="readout">
              <span class="readout__k">Respostas</span><span class="readout__dots"></span><span class="readout__v">{{ total }} registradas</span>
            </div>
            <div class="readout">
              <span class="readout__k">Próxima etapa</span><span class="readout__dots"></span><span class="readout__v">cálculo da nota</span>
            </div>
            <div class="readout readout--accent">
              <span class="readout__k">Saída</span><span class="readout__dots"></span><span class="readout__v">nota + plano de ação</span>
            </div>
          </div>
        </div>

        <footer class="done__foot rise" style="--i: 3">
          <span class="hint">
            <span class="key key--wide">ENTER</span>
            <em>executar cálculo</em>
          </span>
        </footer>
        </div>
      </div>

      <div class="frame done__actions rise" style="--i: 4">
        <div class="frame__in done__actions-in">
          <button class="btn btn--primary done__cta" @click="$emit('calculate')">
            Calcular nota
            <span class="btn__arrow">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DoneScreen',
  props: {
    total: {
      type: Number,
      required: true
    }
  },
  emits: ['calculate'],
  mounted() {
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    onKey(event) {
      if (event.key !== 'Enter' && event.key !== 'ArrowRight') return
      const tag = (event.target.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      event.preventDefault()
      this.$emit('calculate')
    }
  }
}
</script>

<style scoped>
.done {
  flex: 1;
  display: flex;
  align-items: center;
  padding: clamp(28px, 6vh, 70px) 0;
}

.done__frame {
  --cut: 20px;
}

.done__panel {
  display: flex;
  flex-direction: column;
}

.done__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px 12px;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.done__headline {
  color: var(--ink);
}

.done__fill {
  flex: 1;
  height: 1px;
  background: repeating-linear-gradient(90deg, var(--line-strong) 0 1px, transparent 1px 5px);
}

.done__count {
  color: var(--ink-lo);
}

.done__body {
  padding: 26px 22px 22px;
}

.done__title {
  font-size: clamp(15px, 3vw, 19px);
  line-height: 1.45;
  letter-spacing: -0.03em;
  margin-bottom: 18px;
}

.done__caret {
  color: var(--ink-faint);
  margin-right: 10px;
}

.done__log {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding-top: 15px;
  border-top: 1px solid var(--line-soft);
}

.readout--accent .readout__v {
  color: var(--accent);
  font-weight: 600;
}

.done__foot {
  display: flex;
  align-items: center;
  padding: 12px 22px;
  border-top: 1px solid var(--line);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-mid);
}

.hint {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.hint em {
  font-style: normal;
}

.key--wide {
  min-width: 44px;
}

.done__actions {
  --cut: 14px;
  margin-top: 14px;
}

.done__actions-in {
  display: flex;
}

.done__cta,
.done__cta:hover,
.done__cta:focus-visible {
  border-color: transparent;
  clip-path: none;
}

.done__cta {
  width: 100%;
  min-height: 48px;
  justify-content: space-between;
}
</style>
