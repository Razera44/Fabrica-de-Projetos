<template>
  <section class="results">
    <div class="results__inner container">
      <!--
        Uma linguagem de caixa só: todo bloco é a mesma moldura de 2px com
        cabeçalho numerado e um led. Antes a tela misturava moldura, card
        vermelho, grade de cards e painéis — quatro caixas diferentes.
      -->

      <!-- 00 + 01: cabeçalho do relatório. Lado a lado no desktop, onde
           cabem confortavelmente como um par — identificação explica o
           medidor ao lado, em vez de rolar a tela entre os dois. -->
      <div class="results__row">
        <!-- 00 · identificação -->
        <div class="frame mod rise" style="--i: 0">
          <span class="frame__led frame__led--solo"></span>
          <div class="frame__in">
            <div class="mhead">
              <span class="index">00</span>
              <span class="mhead__t" v-scramble="120">Relatório de diagnóstico</span>
              <span class="mhead__fill"></span>
              <span class="mhead__meta">Concluído</span>
            </div>
            <div class="hatch"></div>
            <div class="mbody">
              <h2 class="display results__company" v-scramble="{ delay: 300, duration: 1900 }">{{ companyName }}</h2>
              <div class="results__meta">
                <div class="readout">
                  <span class="readout__k">Emitido</span><span class="readout__dots"></span><span class="readout__v">{{ issuedAt }}</span>
                </div>
                <div class="readout">
                  <span class="readout__k">Itens</span><span class="readout__dots"></span><span class="readout__v">20/20</span>
                </div>
                <div v-if="responsavel" class="readout results__resp">
                  <span class="readout__k">Responsável</span><span class="readout__dots"></span><span class="readout__v">{{ responsavel }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 01 · índice geral (o medidor não muda) -->
        <div class="frame mod results__gauge rise" style="--i: 1">
          <span class="frame__led frame__led--solo" data-led="1"></span>
          <div class="frame__in">
            <div class="mhead">
              <span class="index">01</span>
              <span class="mhead__t">Índice geral</span>
              <span class="mhead__fill"></span>
              <span class="mhead__meta">0 – 100</span>
            </div>
            <div class="hatch"></div>
            <GaugeChart :score="overall" :delta="overallDelta" :delta-ref="previousDate" />
            <!-- os pesos viram rodapé da caixa, em vez de um parágrafo solto -->
            <div class="mfoot">
              <span>Pesos no cálculo:</span>
              <span v-for="theme in themes" :key="theme"><b>{{ theme }} {{ weightLabel(theme) }}</b></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 02 · radar comparativo -->
      <div class="frame mod" v-reveal>
        <span class="frame__led frame__led--solo" data-led="2"></span>
        <div class="frame__in">
          <div class="mhead">
            <span class="index">02</span>
            <span class="mhead__t" v-scramble>Radar comparativo</span>
            <span class="mhead__fill"></span>
            <label v-if="compareOptions.length" class="cmp">
              <span class="cmp__k">Comparar com</span>
              <select v-model="compareDate" class="cmp__sel">
                <option v-for="o in compareOptions" :key="o.date" :value="o.date">{{ o.label }}</option>
              </select>
            </label>
            <span v-else class="mhead__meta">Sem referência</span>
          </div>
          <RadarChart
            :scores="themeScores"
            :previous="previousScores"
            :previous-date="previousDate"
            :questions="questions"
            :answers="answers"
          />
        </div>
      </div>

      <!-- 03 + 04: análise. Notas por tema explicam de onde vêm as
           prioridades do plano ao lado. -->
      <div class="results__row">
        <!-- 03 · notas por tema -->
        <div class="frame mod" v-reveal>
          <span class="frame__led frame__led--solo" data-led="3"></span>
          <div class="frame__in">
            <div class="mhead">
              <span class="index">03</span>
              <span class="mhead__t" v-scramble>Notas por tema</span>
              <span class="mhead__fill"></span>
              <span class="mhead__meta mhead__meta--long">Do mais frágil ao mais forte</span>
            </div>
            <div class="rows">
              <ThemeCard
                v-for="(theme, i) in rankedThemes"
                :key="theme"
                :theme="theme"
                :score="themeScores[theme]"
                :is-weakest="theme === weakestTheme"
                :index="i"
              />
            </div>
          </div>
        </div>

        <!-- 04 · plano de ação (o 1º item absorve o antigo card de atenção) -->
        <div class="frame mod" v-reveal>
          <span class="frame__led frame__led--solo" data-led="4"></span>
          <div class="frame__in">
            <div class="mhead">
              <span class="index">04</span>
              <span class="mhead__t" v-scramble>Plano de ação</span>
              <span class="mhead__fill"></span>
              <span class="mhead__meta">{{ actionPlan.length }} itens</span>
            </div>
            <ActionPlanList :items="actionPlan" />
          </div>
        </div>
      </div>

      <!-- 05 · mudanças nas respostas (só existe com referência) -->
      <div v-if="previousEntry" class="frame mod" v-reveal>
        <span class="frame__led frame__led--solo" data-led="5"></span>
        <div class="frame__in">
          <div class="mhead">
            <span class="index">05</span>
            <span class="mhead__t" v-scramble>Mudanças nas respostas</span>
            <span class="mhead__fill"></span>
            <span class="mhead__meta mhead__meta--long">vs {{ previousDate }}</span>
          </div>
          <AnswerChanges
            :questions="questions"
            :answers="answers"
            :previous-answers="previousEntry.answers || null"
          />
        </div>
      </div>

      <!-- 06 · histórico -->
      <div class="frame mod" v-reveal>
        <span class="frame__led frame__led--solo" data-led="6"></span>
        <div class="frame__in">
          <div class="mhead">
            <span class="index">{{ previousEntry ? '06' : '05' }}</span>
            <span class="mhead__t" v-scramble>Histórico</span>
            <span class="mhead__fill"></span>
            <span class="mhead__meta">{{ historyLabel }}</span>
          </div>
          <HistoryPanel
            :entries="history"
            :company-name="companyName"
            :compare-date="compareDate"
            :question-count="questions.length"
            @compare="compareDate = $event"
            @updated="$emit('history-updated', $event)"
          />
        </div>
      </div>

      <!-- ações -->
      <footer class="results__foot" v-reveal>
        <button class="btn btn--ghost" @click="downloadPdf" :disabled="generatingPdf">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-scramble>{{ generatingPdf ? 'Gerando relatório...' : 'Baixar PDF' }}</span>
        </button>

        <button class="btn btn--ghost" @click="$emit('home')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 4v6h6M4 10a8 8 0 0 1 14-5.3M20 20v-6h-6M20 14a8 8 0 0 1-14 5.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Voltar ao início
        </button>

        <button class="btn btn--ghost results__restart" @click="$emit('restart')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 4v6h6M20 20v-6h-6M4.5 15a8 8 0 0 0 14 3.5M19.5 9a8 8 0 0 0-14-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Refazer avaliação
        </button>
      </footer>
    </div>
  </section>
</template>

<script>
import GaugeChart from './GaugeChart.vue'
import ThemeCard from './ThemeCard.vue'
import ActionPlanList from './ActionPlanList.vue'
import HistoryPanel from './HistoryPanel.vue'
import RadarChart from './RadarChart.vue'
import AnswerChanges from './AnswerChanges.vue'
import { THEME_WEIGHTS, getWeakestTheme, buildActionPlan } from '../utils/scoring.js'

export default {
  name: 'ResultsView',
  components: { GaugeChart, ThemeCard, ActionPlanList, HistoryPanel, RadarChart, AnswerChanges },
  props: {
    companyName: {
      type: String,
      required: true
    },
    responsavel: {
      type: String,
      default: ''
    },
    themeScores: {
      type: Object,
      required: true
    },
    overall: {
      type: Number,
      required: true
    },
    history: {
      type: Array,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    answers: {
      type: Array,
      required: true
    }
  },
  emits: ['restart', 'home', 'history-updated'],
  data() {
    const n = this.history.length
    return {
      // por padrão compara com a avaliação imediatamente anterior
      compareDate: n >= 2 ? this.history[n - 2].date : '',
      themes: Object.keys(THEME_WEIGHTS),
      generatingPdf: false
    }
  },
  computed: {
    issuedAt() {
      const d = new Date()
      const p = n => String(n).padStart(2, '0')
      return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    // mesma ordem do plano de ação logo abaixo: a lista de cima explica a de baixo
    rankedThemes() {
      return this.actionPlan.map(item => item.theme)
    },
    weakestTheme() {
      return getWeakestTheme(this.themeScores)
    },
    actionPlan() {
      return buildActionPlan(this.themeScores)
    },
    // o histórico já inclui a avaliação atual (salva antes de abrir esta
    // tela, sempre a última): as demais são candidatas a referência
    compareOptions() {
      return this.history
        .slice(0, -1)
        .map((e, i, arr) => ({
          date: e.date,
          label: `${this.fmtDate(e.date)} · ${e.overall}/100${i === arr.length - 1 ? ' · anterior' : ''}`
        }))
        .reverse()
    },
    previousEntry() {
      if (!this.compareDate) return null
      return this.history.slice(0, -1).find(e => e.date === this.compareDate) || null
    },
    overallDelta() {
      return this.previousEntry ? this.overall - this.previousEntry.overall : null
    },
    previousScores() {
      return this.previousEntry ? this.previousEntry.themeScores : null
    },
    previousDate() {
      return this.previousEntry ? this.fmtDate(this.previousEntry.date) : ''
    },
    historyLabel() {
      const n = this.history.length
      return n === 1 ? '1 avaliação' : `${n} avaliações`
    }
  },
  watch: {
    // depois de importar um histórico, a referência escolhida pode não existir
    // mais na lista (ou nem havia uma): volta para a anterior
    history() {
      if (!this.previousEntry) {
        const n = this.history.length
        this.compareDate = n >= 2 ? this.history[n - 2].date : ''
      }
    }
  },
  methods: {
    fmtDate(iso) {
      const d = new Date(iso)
      if (isNaN(d)) return ''
      const p = n => String(n).padStart(2, '0')
      return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`
    },
    weightLabel(theme) {
      return `${Math.round(THEME_WEIGHTS[theme] * 100)}%`
    },
    // import dinâmico: jsPDF só é baixado quando o botão é clicado, em vez
    // de engordar o bundle inicial do app. O pequeno atraso é só pra dar
    // tempo do texto do botão decodificar (v-scramble) antes de disparar
    // o download — o PDF em si não anima, é um arquivo estático.
    async downloadPdf() {
      if (this.generatingPdf) return
      this.generatingPdf = true

      const [{ exportResultsPdf }] = await Promise.all([
        import('../utils/pdfExport.js'),
        new Promise(resolve => setTimeout(resolve, 650))
      ])

      exportResultsPdf({
        companyName: this.companyName,
        responsavel: this.responsavel,
        issuedAt: this.issuedAt,
        overall: this.overall,
        themeScores: this.themeScores,
        actionPlan: this.actionPlan,
        previousScores: this.previousScores,
        previousDate: this.previousDate,
        previousOverall: this.previousEntry ? this.previousEntry.overall : null
      })

      this.generatingPdf = false
    }
  }
}
</script>

<style scoped>
.results {
  padding: clamp(28px, 5vh, 48px) 0 clamp(56px, 9vh, 88px);
}

.mod {
  --cut: 18px;
}

/* no mobile o par não existe visualmente (display: contents): os módulos
   continuam empilhados, um por vez, como sempre. */
.results__row {
  display: contents;
}

.results__company {
  font-size: clamp(19px, 4.4vw, 27px);
  letter-spacing: -0.05em;
  margin-bottom: 16px;
  overflow-wrap: anywhere;
}

.results__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 26px;
  padding-top: 13px;
  border-top: 1px solid var(--line);
}

/* nome livre: ocupa a linha toda e quebra em vez de vazar */
.results__resp {
  grid-column: 1 / -1;
}

.results__resp .readout__v {
  white-space: normal;
  text-align: right;
  overflow-wrap: anywhere;
}

.results__gauge :deep(.gauge) {
  padding: clamp(14px, 2.5vh, 22px) 0 clamp(16px, 2.5vh, 24px);
}

/* seletor de referência no cabeçalho do radar */
.cmp {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.cmp__k { white-space: nowrap; }

.cmp__sel {
  font: inherit;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--crit);
  background: var(--panel-deep);
  border: 1px solid var(--line-strong);
  border-radius: 0;
  padding: 4px 8px;
  max-width: 220px;
  cursor: pointer;
}

.cmp__sel:focus-visible {
  outline: 1px solid var(--crit);
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .cmp__k { display: none; }
  .cmp__sel { max-width: 150px; }
}

.results__foot {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 34px;
  padding-top: 26px;
  border-top: 1px solid var(--line);
}

@media (max-width: 560px) {
  .results__meta {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* desktop: mesma rolagem vertical de sempre, só com um pouco mais de
   respiro e textos maiores agora que sobra largura */
@media (min-width: 980px) {
  .results {
    padding-top: clamp(28px, 5vh, 56px);
  }

  .results__company {
    font-size: clamp(21px, 1.8vw, 28px);
  }

  .mbody {
    padding: 26px 22px;
  }
}
</style>
