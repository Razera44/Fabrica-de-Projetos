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
            <GaugeChart :score="overall" />
            <!-- os pesos viram rodapé da caixa, em vez de um parágrafo solto -->
            <div class="mfoot">
              <span>Pesos no cálculo:</span>
              <span v-for="theme in themes" :key="theme"><b>{{ theme }} {{ weightLabel(theme) }}</b></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 02 + 03: análise. Notas por tema explicam de onde vêm as
           prioridades do plano ao lado. -->
      <div class="results__row">
        <!-- 02 · notas por tema -->
        <div class="frame mod" v-reveal>
          <span class="frame__led frame__led--solo" data-led="2"></span>
          <div class="frame__in">
            <div class="mhead">
              <span class="index">02</span>
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

        <!-- 03 · plano de ação (o 1º item absorve o antigo card de atenção) -->
        <div class="frame mod" v-reveal>
          <span class="frame__led frame__led--solo" data-led="3"></span>
          <div class="frame__in">
            <div class="mhead">
              <span class="index">03</span>
              <span class="mhead__t" v-scramble>Plano de ação</span>
              <span class="mhead__fill"></span>
              <span class="mhead__meta">{{ actionPlan.length }} itens</span>
            </div>
            <ActionPlanList :items="actionPlan" />
          </div>
        </div>
      </div>

      <!-- 04 · histórico -->
      <div class="frame mod" v-reveal>
        <span class="frame__led frame__led--solo" data-led="4"></span>
        <div class="frame__in">
          <div class="mhead">
            <span class="index">04</span>
            <span class="mhead__t" v-scramble>Histórico</span>
            <span class="mhead__fill"></span>
            <span class="mhead__meta">{{ historyLabel }}</span>
          </div>
          <HistoryPanel :entries="history" />
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
import { THEME_WEIGHTS, getWeakestTheme, buildActionPlan } from '../utils/scoring.js'

export default {
  name: 'ResultsView',
  components: { GaugeChart, ThemeCard, ActionPlanList, HistoryPanel },
  props: {
    companyName: {
      type: String,
      required: true
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
    }
  },
  emits: ['restart', 'home'],
  data() {
    return {
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
    historyLabel() {
      const n = this.history.length
      return n === 1 ? '1 avaliação' : `${n} avaliações`
    }
  },
  methods: {
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
        issuedAt: this.issuedAt,
        overall: this.overall,
        themeScores: this.themeScores,
        actionPlan: this.actionPlan
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

.results__gauge :deep(.gauge) {
  padding: clamp(14px, 2.5vh, 22px) 0 clamp(16px, 2.5vh, 24px);
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
