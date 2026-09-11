<template>
  <section class="intro">
    <div class="intro__inner container">
      <div class="frame intro__frame">
        <span class="frame__led frame__led--tl"></span>
        <span class="frame__led frame__led--tr"></span>
        <span class="frame__led frame__led--br"></span>
        <span class="frame__led frame__led--bl"></span>

        <div class="frame__in intro__panel">
          <div class="frame__sweep"></div>
          <!-- faixa de identificação do módulo -->
          <header class="ihead rise" style="--i: 0">
            <span class="ihead__badge">00</span>
            <span class="ihead__name">Módulo de entrada</span>
            <span class="ihead__dots"></span>
            <span class="ihead__state">Aguardando</span>
          </header>

          <div class="hatch"></div>

          <div class="ibody">
            <!-- coluna principal -->
            <div class="ibody__main">
              <div class="eyebrow rise" style="--i: 1">Autoavaliação · 20 itens</div>

              <h1 class="display intro__title rise" style="--i: 2">
                Diagnóstico de <em>segurança digital</em> da sua empresa
              </h1>

              <p class="intro__desc rise" style="--i: 3">
                Itens objetivos sobre backup, senhas, antivírus e LGPD. Ao final o
                sistema devolve uma nota de 0 a 100 e um plano de ação priorizado.
              </p>
            </div>

            <!-- ficha técnica da execução -->
            <aside class="specs rise" style="--i: 4">
              <div class="specs__title">Parâmetros</div>
              <div class="readout">
                <span class="readout__k">Módulos</span><span class="readout__dots"></span><span class="readout__v">04</span>
              </div>
              <div class="readout">
                <span class="readout__k">Itens</span><span class="readout__dots"></span><span class="readout__v">20</span>
              </div>
              <div class="readout">
                <span class="readout__k">Duração</span><span class="readout__dots"></span><span class="readout__v">~5 min</span>
              </div>
              <div class="readout">
                <span class="readout__k">Escala</span><span class="readout__dots"></span><span class="readout__v">0—100</span>
              </div>
              <div class="specs__hatch hatch"></div>
              <div class="readout readout--accent">
                <span class="readout__k">Saída</span><span class="readout__dots"></span><span class="readout__v">nota + plano</span>
              </div>
            </aside>
          </div>

          <div class="hatch intro__divider"></div>

          <!-- entrada de dados -->
          <div class="ifield rise" style="--i: 5">
            <label class="ifield__label" for="company">
              <span class="ifield__num">01</span> Identificação da empresa
            </label>
            <div class="ifield__wrap">
              <span class="ifield__prefix" aria-hidden="true">&gt;</span>
              <input
                id="company"
                ref="input"
                v-model="name"
                class="ifield__input"
                type="text"
                autocomplete="organization"
                placeholder="ex: padaria bom trigo ltda"
                @keyup.enter="handleStart"
              >
              <span class="ifield__caret" :class="{ 'is-idle': !name }" aria-hidden="true"></span>
            </div>
          </div>

          <footer class="ifoot rise" style="--i: 6">
            <span class="hint">
              <span class="key key--wide">ENTER</span>
              <em>iniciar diagnóstico</em>
            </span>

            <button class="btn btn--primary intro__cta" :disabled="!name.trim()" @click="handleStart">
              Iniciar
              <span class="btn__arrow">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'IntroScreen',
  props: {
    initialName: {
      type: String,
      default: ''
    }
  },
  emits: ['start'],
  data() {
    return {
      name: this.initialName
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    handleStart() {
      if (!this.name.trim()) return
      this.$emit('start', this.name.trim())
    },
    // Enter inicia mesmo com o foco fora do campo; sem nome, foca o campo
    onKey(event) {
      if (event.key !== 'Enter' || event.metaKey || event.ctrlKey) return
      const tag = (event.target.tagName || '').toLowerCase()
      if (tag === 'input') return
      if (this.name.trim()) {
        event.preventDefault()
        this.handleStart()
      } else if (this.$refs.input) {
        event.preventDefault()
        this.$refs.input.focus()
      }
    }
  }
}
</script>

<style scoped>
.intro {
  flex: 1;
  display: flex;
  align-items: center;
  padding: clamp(18px, 3.5vh, 44px) 0;
}

.intro__inner {
  width: 100%;
}

.intro__frame {
  --cut: 20px;
}

/* ---------- cabeçalho ---------- */
.ihead {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px 12px;
  font-size: 10.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.ihead__badge {
  padding: 3px 9px;
  border: 1px solid var(--accent-line);
  color: var(--ink);
  letter-spacing: 0.12em;
}

.ihead__name {
  color: var(--ink);
}

.ihead__dots {
  flex: 1;
  height: 1px;
  background: repeating-linear-gradient(90deg, var(--line-strong) 0 1px, transparent 1px 6px);
}

.ihead__state {
  color: var(--ink-lo);
}

/* ---------- corpo em duas colunas ---------- */
.ibody {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 26px;
  padding: 28px 22px 24px;
}

.intro__title {
  font-size: clamp(19px, 2.4vw, 34px);
  line-height: 1.3;
  letter-spacing: -0.05em;
  margin: 14px 0 14px;
}

.intro__title em {
  font-style: normal;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 2px;
}

.intro__desc {
  font-size: 12.5px;
  color: var(--ink-mid);
  line-height: 1.75;
  max-width: 48ch;
}

/* ficha lateral */
.specs {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 17px 16px;
  border: 1px solid var(--line);
  background: var(--panel);
  clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
  align-self: start;
}

.specs__title {
  font-size: 9.5px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin-bottom: 6px;
}

.specs__hatch {
  margin: 4px 0;
  opacity: 0.6;
}

.readout--accent .readout__v {
  color: var(--accent);
  font-weight: 600;
}

/* separador secundário entre a explicação do módulo e o campo de entrada:
   mesma textura do cabeçalho, com menos presença pra não competir com ela */
.intro__divider {
  opacity: 0.55;
}

/* ---------- campo ---------- */
.ifield {
  padding: 20px 22px 20px;
}

.ifield__label {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-lo);
  margin-bottom: 10px;
}

.ifield__num {
  padding: 2px 6px;
  border: 1px solid var(--line-strong);
  color: var(--ink-mid);
  letter-spacing: 0.1em;
}

.ifield__wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line);
  background: var(--panel);
  padding: 0 16px;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease);
}

.ifield__wrap:focus-within {
  border-color: var(--accent-line);
  background: var(--panel-hover);
}

.ifield__prefix {
  color: var(--ink-faint);
  flex-shrink: 0;
}

.ifield__input {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  padding: 16px 0;
  border: none;
  background: none;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.ifield__input::placeholder {
  color: var(--ink-faint);
}

.ifield__input:focus {
  outline: none;
}

/* cursor piscando enquanto o campo está vazio */
.ifield__caret {
  width: 7px;
  height: 15px;
  background: var(--accent);
  flex-shrink: 0;
  opacity: 0;
}

.ifield__caret.is-idle {
  animation: caret 1.1s steps(1) infinite;
}

@keyframes caret {
  0%, 50% { opacity: 0.85; }
  51%, 100% { opacity: 0; }
}

/* ---------- rodapé ---------- */
.ifoot {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 12px 16px 12px 22px;
  border-top: 1px solid var(--line);
}

.hint {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.hint em {
  font-style: normal;
  margin-left: 4px;
}

.key--wide {
  min-width: 46px;
}

.intro__cta {
  min-width: 200px;
  min-height: 48px;
  justify-content: space-between;
}

@media (min-width: 880px) {
  .ibody {
    grid-template-columns: minmax(0, 1fr) 260px;
    gap: 34px;
    padding: 30px 26px 26px;
  }

  .ifield,
  .ifoot {
    padding-left: 26px;
  }
}

@media (min-width: 1200px) {
  .ibody {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 48px;
    padding: 38px 32px 30px;
  }

  .intro__desc {
    font-size: 13.5px;
    max-width: 56ch;
  }

  .specs {
    padding: 20px 18px;
    gap: 8px;
  }

  .ifield,
  .ifoot {
    padding-left: 32px;
  }

  .ihead,
  .ifield,
  .ifoot {
    padding-right: 32px;
  }
}

@media (max-width: 520px) {
  .ihead,
  .ibody,
  .ifield,
  .ifoot {
    padding-left: 16px;
    padding-right: 16px;
  }

  .hint {
    display: none;
  }

  .intro__cta {
    width: 100%;
  }
}
</style>
