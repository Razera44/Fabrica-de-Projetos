<template>
  <!--
    Uma linha, não um card. Em grade 2×2 as quatro notas ficavam em
    zigue-zague; empilhadas numa coluna só dá para comparar de cima
    para baixo, que é a ordem em que o plano de ação vem logo abaixo.
  -->
  <div
    class="row row--theme"
    :class="{ 'row--weak': isWeakest }"
    v-reveal="index * 70"
  >
    <span class="rnum">{{ String(index + 1).padStart(2, '0') }}</span>

    <span class="theme__name">
      {{ theme }}
      <small>Peso {{ weightLabel }}</small>
    </span>

    <span class="theme__track">
      <span class="theme__fill" :style="{ width: score + '%', background: toneColor }"></span>
    </span>

    <span class="theme__score" v-scramble="index * 70 + 140">{{ score }}</span>

    <span class="tag" :class="`tag--${tier.tone}`"><i></i>{{ tier.label }}</span>
  </div>
</template>

<script>
import { getTier, THEME_WEIGHTS } from '../utils/scoring.js'

export default {
  name: 'ThemeCard',
  props: {
    theme: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    isWeakest: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number,
      default: 0
    }
  },
  computed: {
    tier() {
      return getTier(this.score)
    },
    toneColor() {
      return `var(--${this.tier.tone})`
    },
    weightLabel() {
      return `${Math.round(THEME_WEIGHTS[this.theme] * 100)}%`
    }
  }
}
</script>

<style scoped>
.row--theme {
  grid-template-columns: 26px minmax(0, 1fr) 170px 44px 134px;
  transition: background var(--dur) var(--ease);
}

.row--theme:hover {
  background: rgba(255, 255, 255, 0.018);
}

/* o tema mais frágil é marcado pela tarja, não por uma borda diferente */
.row--weak {
  background: rgba(255, 255, 255, 0.028);
  box-shadow: inset 3px 0 0 var(--crit);
}

.theme__name {
  font-size: 12.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink);
}

.theme__name small {
  display: block;
  font-size: 9.5px;
  letter-spacing: 0.16em;
  color: var(--ink-faint);
  margin-top: 2px;
}

.theme__track {
  display: block;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
}

/* span é inline por padrão: sem display block a barra fica com 0px */
.theme__fill {
  display: block;
  height: 100%;
  transition: width var(--dur-slow) var(--ease);
}

.theme__score {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.04em;
  text-align: right;
}

.tag {
  justify-self: end;
}

/* estreito: a barra sai e a etiqueta desce para a segunda linha */
@media (max-width: 640px) {
  .row--theme {
    grid-template-columns: 22px minmax(0, 1fr) 44px;
    gap: 6px 12px;
    padding: 13px 14px;
  }

  .theme__track {
    display: none;
  }

  .tag {
    grid-column: 2 / 4;
    justify-self: start;
  }
}
</style>
