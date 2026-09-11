<template>
  <section class="query">
    <div class="query__inner container">
      <div class="qframe query__frame">
        <!-- oito traços partindo dos cantos: encontram-se na metade de cada lado -->
        <span class="qframe__ln qframe__ln--tl"></span>
        <span class="qframe__ln qframe__ln--tr"></span>
        <span class="qframe__ln qframe__ln--bl"></span>
        <span class="qframe__ln qframe__ln--br"></span>
        <span class="qframe__ln qframe__ln--lt"></span>
        <span class="qframe__ln qframe__ln--lb"></span>
        <span class="qframe__ln qframe__ln--rt"></span>
        <span class="qframe__ln qframe__ln--rb"></span>
        <span class="qframe__diag qframe__diag--tl"></span>
        <span class="qframe__diag qframe__diag--br"></span>

        <!-- um led só: com a borda de 2px os quatro cantos ficavam pesados -->
        <span class="frame__led frame__led--solo"></span>

        <div class="qframe__panel query__panel">
          <div class="frame__sweep"></div>
          <!-- faixa de identificação do item -->
          <header class="qhead qstep" style="--d: 400ms">
            <span class="qhead__badge">{{ pad(index + 1) }}</span>
            <span class="qhead__theme">{{ question.theme }}</span>
            <span class="qhead__dots"></span>
            <span class="qhead__id">Q{{ pad(index + 1) }}<i>/</i>{{ pad(total) }}</span>
          </header>

          <div class="hatch"></div>

          <!-- enunciado -->
          <div class="qbody">
            <div class="qbody__main">
              <!-- o enunciado entra sozinho e se decodifica a partir de 1001 -->
              <h2 class="display qprompt qstep" style="--d: 480ms">
                <span class="qprompt__caret" aria-hidden="true">&gt;&gt;</span>
                <span
                  :key="index"
                  class="qprompt__text"
                  v-scramble="{ delay: 500, duration: 1100 }"
                >{{ question.text }}</span>
              </h2>

              <!-- lista de opções, cada uma em sua própria moldura -->
              <div class="qopts" role="radiogroup" :aria-label="question.text">
                <div class="rail" aria-hidden="true"></div>

                <div class="qopts__list">
                  <button
                    v-for="(option, i) in question.options"
                    :key="i"
                    type="button"
                    class="opt qstep"
                    :class="{ 'opt--on': selected === i }"
                    :style="{ '--d': (640 + i * 70) + 'ms' }"
                    role="radio"
                    :aria-checked="selected === i"
                    @click="$emit('select', i)"
                  >
                    <span class="opt__mark" aria-hidden="true">
                      <span class="opt__fill"></span>
                    </span>
                    <span class="opt__idx" aria-hidden="true">{{ pad(i + 1) }}</span>
                    <span class="opt__label">{{ option }}</span>
                    <span class="opt__line" aria-hidden="true"></span>
                    <span class="key opt__key" aria-hidden="true">{{ i + 1 }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- ficha de contexto do item: só aparece no desktop, onde sobra largura -->
            <aside class="qspecs qstep" style="--d: 560ms">
              <div class="qspecs__title">Contexto</div>
              <div class="readout">
                <span class="readout__k">Módulo</span><span class="readout__dots"></span><span class="readout__v">{{ question.theme }}</span>
              </div>
              <div class="readout">
                <span class="readout__k">Peso</span><span class="readout__dots"></span><span class="readout__v">{{ weightLabel }}</span>
              </div>
              <div class="readout">
                <span class="readout__k">Progresso</span><span class="readout__dots"></span><span class="readout__v">{{ pad(index + 1) }}/{{ pad(total) }}</span>
              </div>
              <div class="qspecs__hatch hatch"></div>
              <div class="readout">
                <span class="readout__k">Opções</span><span class="readout__dots"></span><span class="readout__v">{{ question.options.length }}</span>
              </div>
            </aside>
          </div>

          <!-- rodapé: atalhos e navegação dentro do próprio painel -->
          <footer class="qfoot" :class="{ 'is-alert': nudge }">
            <div class="qfoot__hints qstep" style="--d: 880ms">
              <span class="hint">
                <span class="key">1</span><span class="key">2</span><span class="key">3</span>
                <em>selecionar</em>
              </span>
              <span class="hint hint--enter" :class="{ 'is-ready': selected !== null }">
                <span class="key key--wide">ENTER</span>
                <em>{{ selected === null ? 'escolha uma opção' : (isLast ? 'ver resultado' : 'confirmar') }}</em>
              </span>
            </div>

            <div class="qfoot__nav qstep" style="--d: 940ms">
              <button class="btn btn--ghost" :disabled="index === 0" @click="$emit('back')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Voltar
              </button>

              <button class="btn btn--primary" :disabled="selected === null" @click="$emit('next')">
                {{ isLast ? 'Ver resultado' : 'Confirmar' }}
                <span class="btn__arrow">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { THEME_WEIGHTS } from '../utils/scoring.js'

export default {
  name: 'QuestionCard',
  props: {
    question: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    answers: {
      type: Array,
      required: true
    }
  },
  emits: ['select', 'back', 'next'],
  data() {
    return {
      nudge: false,
      nudgeTimer: null
    }
  },
  computed: {
    selected() {
      return this.answers[this.index]
    },
    isLast() {
      return this.index === this.total - 1
    },
    weightLabel() {
      return `${Math.round((THEME_WEIGHTS[this.question.theme] || 0) * 100)}%`
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
    clearTimeout(this.nudgeTimer)
  },
  methods: {
    pad(n) {
      return String(n).padStart(2, '0')
    },

    // Enter confirma, 1..3 escolhem, setas navegam entre opções e perguntas
    onKey(event) {
      const tag = (event.target.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const count = this.question.options.length
      const num = parseInt(event.key, 10)

      if (!Number.isNaN(num) && num >= 1 && num <= count) {
        event.preventDefault()
        this.$emit('select', num - 1)
        return
      }

      switch (event.key) {
        case 'Enter':
          event.preventDefault()
          if (this.selected === null) {
            this.flagNudge()
          } else {
            this.$emit('next')
          }
          break

        case 'ArrowRight':
          if (this.selected !== null) {
            event.preventDefault()
            this.$emit('next')
          }
          break

        case 'ArrowLeft':
          if (this.index > 0) {
            event.preventDefault()
            this.$emit('back')
          }
          break

        case 'ArrowDown':
          event.preventDefault()
          this.$emit('select', this.selected === null ? 0 : (this.selected + 1) % count)
          break

        case 'ArrowUp':
          event.preventDefault()
          this.$emit('select', this.selected === null ? count - 1 : (this.selected - 1 + count) % count)
          break
      }
    },

    // Enter sem resposta escolhida: destaca o rodapé em vez de sacudir a tela
    flagNudge() {
      clearTimeout(this.nudgeTimer)
      this.nudge = true
      this.nudgeTimer = setTimeout(() => { this.nudge = false }, 900)
    }
  }
}
</script>

<style scoped>
.query {
  flex: 1;
  display: flex;
  align-items: center;
  /* margens verticais enxutas: com o topo de duas fileiras, o quiz precisa
     continuar cabendo na janela — se sobrar rolagem, volta a tremida */
  padding: clamp(14px, 2.6vh, 36px) 0 clamp(14px, 2.2vh, 30px);
  --rise-step: 38ms;
}

.query__inner {
  width: 100%;
}

.query__frame {
  --cut: 20px;
}

/* o piso de altura vai para o painel, que agora é quem tem fundo */

.query__panel {
  display: flex;
  flex-direction: column;
}

/* ---------- cabeçalho ---------- */
.qhead {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px 12px;
  font-size: 10.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.qhead__badge {
  padding: 3px 9px;
  border: 1px solid var(--accent-line);
  color: var(--ink);
  font-weight: 500;
  letter-spacing: 0.12em;
}

.qhead__theme {
  color: var(--ink);
}

.qhead__dots {
  flex: 1;
  height: 1px;
  background: repeating-linear-gradient(90deg, var(--line-strong) 0 1px, transparent 1px 6px);
}

.qhead__id {
  color: var(--ink-lo);
}

.qhead__id i {
  font-style: normal;
  color: var(--ink-faint);
}

/* ---------- enunciado ---------- */
.qbody {
  position: relative;
  z-index: 1;
  padding: 26px 22px 24px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 30px;
}

.qbody__main {
  min-width: 0;
}

/* ficha lateral: some no mobile/tablet, some é onde a coluna única
   já preenche bem a largura disponível */
.qspecs {
  display: none;
}

.qprompt {
  display: flex;
  gap: 14px;
  font-size: clamp(17px, 2.9vw, 23px);
  line-height: 1.44;
  letter-spacing: -0.035em;
  /* três linhas reservadas: todas as perguntas ocupam a mesma altura,
     então a moldura não muda de tamanho de um item para o outro */
  min-height: calc(3 * 1.44em);
  margin-bottom: 26px;
}

.qprompt__caret {
  color: var(--ink-faint);
  font-weight: 400;
  flex-shrink: 0;
}

.qprompt__text {
  flex: 1;
}

/* ---------- opções ---------- */
.qopts {
  display: flex;
  gap: 16px;
}

.qopts__list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.opt {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  text-align: left;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-mid);
  cursor: pointer;
  padding: 14px 16px;
  background: var(--panel);
  border: 1px solid var(--line);
  /* canto cortado: as fichas deixam de ser retângulos puros */
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  transition: background var(--dur) var(--ease), color var(--dur) var(--ease),
    border-color var(--dur) var(--ease), transform var(--dur) var(--ease);
}

.opt:hover {
  background: var(--panel-hover);
  border-color: var(--line-strong);
  color: var(--ink);
  transform: translateX(4px);
}

/* quadrado que preenche em branco ao ser escolhido */
.opt__mark {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 1px solid var(--ink-faint);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--dur) var(--ease);
}

.opt__fill {
  width: 100%;
  height: 100%;
  background: var(--accent);
  transform: scale(0);
  transition: transform 200ms var(--ease);
}

.opt__idx {
  font-size: 10.5px;
  letter-spacing: 0.14em;
  color: var(--ink-faint);
  flex-shrink: 0;
  transition: color var(--dur) var(--ease);
}

.opt__label {
  min-width: 0;
}

.opt__line {
  flex: 1;
  min-width: 10px;
  height: 1px;
  background: repeating-linear-gradient(90deg, var(--line) 0 1px, transparent 1px 5px);
}

.opt__key {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--dur) var(--ease);
}

.opt:hover .opt__key {
  opacity: 1;
}

.opt--on {
  background: var(--panel-hover);
  border-color: var(--accent-line);
  color: var(--ink);
}

/* faixa de luz atravessando a ficha no instante da escolha */
.opt--on::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
  transform: translateX(-100%);
  animation: slot-flash 0.55s var(--ease) 1;
  pointer-events: none;
}

@keyframes slot-flash {
  to { transform: translateX(100%); }
}

.opt--on .opt__mark {
  border-color: var(--accent);
}

.opt--on .opt__fill {
  transform: scale(1);
}

.opt--on .opt__idx {
  color: var(--ink);
}

.opt--on .opt__key {
  opacity: 1;
}

/* ---------- rodapé ---------- */
.qfoot {
  position: relative;
  z-index: 1;
  margin-top: auto;
  border-top: 1px solid var(--line);
}

.qfoot__hints {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding: 11px 22px;
  border-bottom: 1px solid var(--line-soft);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.hint em {
  font-style: normal;
  margin-left: 4px;
}

.hint--enter.is-ready {
  color: var(--ink-mid);
}

.hint--enter.is-ready .key {
  border-color: var(--accent-line);
  color: var(--ink);
}

.key--wide {
  min-width: 46px;
}

.qfoot.is-alert .hint--enter {
  color: var(--ink);
}

.qfoot.is-alert .hint--enter .key {
  animation: alert 0.9s steps(1) 3;
  border-color: var(--accent);
}

@keyframes alert {
  0%, 50% { background: var(--accent); color: var(--accent-ink); }
  51%, 100% { background: transparent; color: var(--ink); }
}

.qfoot__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px 12px 8px;
}

/* ---------- desktop: ficha de contexto ao lado das opções ---------- */
@media (min-width: 900px) {
  .qbody {
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 36px;
    padding: 32px 26px 28px;
  }

  .qspecs {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 16px;
    border: 1px solid var(--line);
    background: var(--panel);
    clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
    align-self: start;
  }

  .qspecs__title {
    font-size: 9.5px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 6px;
  }

  .qspecs__hatch {
    margin: 4px 0;
    opacity: 0.6;
  }

  .qprompt {
    font-size: clamp(19px, 1.7vw, 26px);
  }

  .opt {
    font-size: 13.5px;
    padding: 15px 18px;
  }

  .qhead,
  .qfoot__hints {
    padding-left: 26px;
    padding-right: 26px;
  }

  .qfoot__nav {
    padding-right: 26px;
  }
}

@media (max-width: 560px) {
  /* em telas baixas o painel é mais alto que o espaço disponível: ancorado no
     topo ele rola normalmente, centralizado ficaria cortado em cima */
  .query {
    align-items: flex-start;
  }

  .qopts {
    gap: 10px;
  }

  .rail {
    display: none;
  }

  .qhead,
  .qbody {
    padding-left: 16px;
    padding-right: 16px;
  }

  .qbody {
    padding-top: 20px;
    padding-bottom: 18px;
  }

  .qfoot__hints {
    padding-left: 16px;
    padding-right: 16px;
    gap: 12px;
  }

  .opt__key,
  .opt__line {
    display: none;
  }

  /* em telas estreitas o enunciado quebra em mais linhas e as opções passam a
     ocupar duas: reservo esse espaço para a moldura não mudar de tamanho */
  .qprompt {
    font-size: clamp(15px, 4.3vw, 19px);
    min-height: calc(4 * 1.44em);
    margin-bottom: 20px;
  }

  .opt {
    padding: 12px 14px;
    gap: 11px;
    align-items: flex-start;
  }

  .opt__mark,
  .opt__idx {
    margin-top: 2px;
  }

  /* reserva medida nos 20 itens: a lista varia de 155 a 213px nesta faixa */
  .qopts__list {
    min-height: 214px;
  }
}

@media (max-width: 420px) {
  .qprompt {
    gap: 9px;
    min-height: calc(5 * 1.44em);
  }

}

/* medido nos 20 itens a 320px: o enunciado chega a 5 linhas e uma opção a 4.
   Reservar esse espaço mantém a moldura do mesmo tamanho em todos os itens. */
@media (max-width: 360px) {
  .qprompt {
    font-size: 14.5px;
    min-height: calc(5 * 1.44em);
  }

  /* a 320px a lista chega a 240px */
  .qopts__list {
    min-height: 242px;
  }

  .qbody {
    padding-top: 16px;
    padding-bottom: 14px;
  }

  .opt {
    padding: 10px 12px;
  }

  .qfoot__nav {
    flex-direction: column-reverse;
    align-items: stretch;
    padding: 12px 16px;
  }
}
</style>
