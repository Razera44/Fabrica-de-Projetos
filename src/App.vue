<template>
  <div class="app">
    <!-- ambiente global: montado uma única vez, nunca reinicia entre telas -->
    <AmbientBackground />

    <div class="app-shell">
      <AppHeader :company-name="companyName" :show-home="view !== 'intro'" @home="goHome" />

      <ProgressBand
        v-if="view === 'quiz'"
        :theme="currentQuestion.theme"
        :current="current + 1"
        :total="questions.length"
      />

      <main class="app-main">
        <Transition :name="transitionName" mode="out-in">
          <IntroScreen
            v-if="view === 'intro'"
            key="intro"
            :initial-name="companyName"
            @start="handleStart"
          />

          <QuestionCard
            v-else-if="view === 'quiz'"
            :key="'q-' + current"
            :question="currentQuestion"
            :index="current"
            :total="questions.length"
            :answers="answers"
            @select="selectAnswer"
            @back="goBack"
            @next="goNext"
          />

          <DoneScreen
            v-else-if="view === 'done'"
            key="done"
            :total="questions.length"
            @calculate="calculate"
          />

          <ResultsView
            v-else-if="view === 'results'"
            key="results"
            :company-name="companyName"
            :theme-scores="themeScores"
            :overall="overall"
            :history="history"
            @restart="restart"
            @home="goHome"
          />
        </Transition>
      </main>
    </div>
  </div>
</template>

<script>
import AmbientBackground from './components/AmbientBackground.vue'
import AppHeader from './components/AppHeader.vue'
import ProgressBand from './components/ProgressBand.vue'
import IntroScreen from './components/IntroScreen.vue'
import QuestionCard from './components/QuestionCard.vue'
import DoneScreen from './components/DoneScreen.vue'
import ResultsView from './components/ResultsView.vue'

import { questions } from './data/questions.js'
import { computeThemeScores, computeOverallScore } from './utils/scoring.js'
import { loadCompanyName, saveCompanyName, loadHistory, saveAssessment } from './utils/storage.js'

export default {
  name: 'App',
  components: { AmbientBackground, AppHeader, ProgressBand, IntroScreen, QuestionCard, DoneScreen, ResultsView },
  data() {
    return {
      view: 'intro',
      questions,
      companyName: '',
      current: 0,
      answers: new Array(questions.length).fill(null),
      history: [],
      themeScores: {},
      overall: 0,
      // sentido da última navegação: define de que lado o próximo card entra
      navDirection: 'fwd'
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.current]
    },
    // dentro do questionário a troca é direcional; entre telas, vertical
    transitionName() {
      if (this.view !== 'quiz') return 'screen'
      return this.navDirection === 'back' ? 'q-back' : 'q-fwd'
    }
  },
  mounted() {
    this.companyName = loadCompanyName()
    this.history = loadHistory(this.companyName)
  },
  methods: {
    handleStart(name) {
      this.companyName = name
      saveCompanyName(name)
      this.history = loadHistory(name)
      this.answers = new Array(this.questions.length).fill(null)
      this.current = 0
      this.navDirection = 'fwd'
      this.view = 'quiz'
    },
    selectAnswer(optionIndex) {
      this.answers[this.current] = optionIndex
    },
    // em telas baixas o painel pode rolar: cada item começa do topo,
    // sem animação de rolagem (que seria lida como a tela "pulando")
    toTop() {
      if (window.scrollY > 0) window.scrollTo(0, 0)
    },
    goNext() {
      if (this.current === this.questions.length - 1) {
        this.view = 'done'
        this.toTop()
        return
      }
      this.navDirection = 'fwd'
      this.current += 1
      this.toTop()
    },
    goBack() {
      if (this.current === 0) return
      this.navDirection = 'back'
      this.current -= 1
      this.toTop()
    },
    calculate() {
      this.themeScores = computeThemeScores(this.questions, this.answers)
      this.overall = computeOverallScore(this.themeScores)
      this.history = saveAssessment({
        date: new Date().toISOString(),
        overall: this.overall,
        themeScores: this.themeScores,
        companyName: this.companyName
      })
      this.view = 'results'
    },
    restart() {
      this.answers = new Array(this.questions.length).fill(null)
      this.current = 0
      this.navDirection = 'fwd'
      this.view = 'quiz'
    },
    goHome() {
      this.view = 'intro'
    }
  }
}
</script>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
}

.app-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* piso de altura: mesmo no instante em que uma tela sai e a outra ainda não
     entrou, o container não encolhe — é o que evitaria qualquer salto da
     página (e o consequente reposicionamento da barra de rolagem) */
  min-height: 60vh;
  /* impede o navegador de reajustar o scroll sozinho quando o conteúdo troca */
  overflow-anchor: none;
}
</style>
