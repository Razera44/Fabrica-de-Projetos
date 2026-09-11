<template>
  <header class="bar">
    <!-- fileira 1: identificação -->
    <div class="bar__top">
      <button
        v-if="showHome"
        class="bar__badge bar__badge--btn"
        type="button"
        title="Voltar ao início"
        @click="$emit('home')"
      >SEGURA<span class="bar__slash">//</span>DIAG</button>
      <span v-else class="bar__badge">SEGURA<span class="bar__slash">//</span>DIAG</span>

      <span class="bar__tag">Diagnóstico de segurança digital</span>
      <span class="bar__strip"></span>
      <span class="bar__leds"><i></i><i></i><i></i></span>
    </div>

    <!-- fileira 2: leituras -->
    <div class="bar__bottom">
      <span class="bar__seg">
        Sessão <span class="bar__dots"></span> <b>{{ sessionId }}</b>
      </span>
      <span class="bar__seg bar__seg--time">
        Início <span class="bar__dots"></span> <b>{{ startedAt }}</b>
      </span>
      <span class="bar__seg bar__seg--company">
        Empresa <span class="bar__dots"></span> <b>{{ companyName || '—' }}</b>
      </span>
      <span class="bar__seg bar__seg--end">
        <span class="bar__led"></span> Online
      </span>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    companyName: {
      type: String,
      default: ''
    },
    showHome: {
      type: Boolean,
      default: false
    }
  },
  emits: ['home'],
  data() {
    const d = new Date()
    const p = n => String(n).padStart(2, '0')
    return {
      // identificador da execução: decorativo, dá contexto de sessão
      sessionId: '0x' + Math.floor(Math.random() * 0xfff).toString(16).toUpperCase().padStart(3, '0'),
      startedAt: `${p(d.getHours())}:${p(d.getMinutes())}`
    }
  }
}
</script>

<style scoped>
/* a barra ocupa a largura da janela: é a moldura do instrumento,
   não faz parte da coluna de leitura */
.bar {
  position: relative;
  z-index: 2;
  /* fundo próprio: sem ele os fios e os sinais do fundo animado passavam
     por trás da barra e piscavam no meio das leituras */
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}

/* ---------- fileira 1 ---------- */
.bar__top {
  display: flex;
  align-items: stretch;
  gap: 14px;
  height: 40px;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-lo);
}

.bar__badge {
  display: flex;
  align-items: center;
  background: var(--accent);
  color: var(--accent-ink);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0 26px 0 var(--gutter);
  border: none;
  white-space: nowrap;
  /* corte diagonal na saída do bloco */
  clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
}

.bar__badge--btn {
  cursor: pointer;
}

.bar__slash {
  opacity: 0.45;
  font-weight: 400;
}

.bar__tag {
  align-self: center;
  padding: 3px 9px;
  border: 1px solid var(--line-strong);
  color: var(--ink-mid);
  letter-spacing: 0.12em;
  white-space: nowrap;
}

/* hachura correndo para a direita, preenchendo o vão.
   Mesma técnica da .hatch global: o desenho anda numa camada própria por
   transform. Animar background-position redesenhava os traços de 1px a
   cada quadro e a faixa inteira cintilava — e como ela atravessa o topo
   de ponta a ponta, o topo inteiro parecia piscar. */
.bar__strip {
  align-self: center;
  flex: 1;
  min-width: 20px;
  height: 9px;
  position: relative;
  overflow: hidden;
}

.bar__strip::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: -9.9px;
  background-image: repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.30) 0 1px, transparent 1px 7px);
  background-size: 9.9px 9.9px;
  will-change: transform;
  animation: hatch-run 3.2s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .bar__strip::before {
    animation: none;
    transform: none;
  }
}

.bar__leds {
  align-self: center;
  display: flex;
  gap: 4px;
  padding-right: var(--gutter);
  flex-shrink: 0;
}

.bar__leds i {
  width: 4px;
  height: 4px;
  background: var(--accent);
  opacity: 0.22;
  animation: led-seq-bar 3.6s steps(1) infinite;
}

.bar__leds i:nth-child(2) { animation-delay: 1.2s; }
.bar__leds i:nth-child(3) { animation-delay: 2.4s; }

@keyframes led-seq-bar {
  0%, 22% { opacity: 1; box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.9); }
  23%, 100% { opacity: 0.22; box-shadow: none; }
}

/* ---------- fileira 2 ---------- */
.bar__bottom {
  display: flex;
  align-items: stretch;
  border-top: 1px solid var(--line);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-lo);
}

.bar__seg {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 18px;
  border-right: 1px solid var(--line);
  white-space: nowrap;
  min-width: 0;
}

.bar__seg:first-child {
  padding-left: var(--gutter);
}

.bar__seg b {
  color: var(--ink);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar__dots {
  width: 34px;
  height: 1px;
  border-bottom: 1px dotted var(--line-strong);
  transform: translateY(-3px);
}

.bar__seg--company {
  min-width: 0;
  flex-shrink: 1;
}

.bar__seg--end {
  border-right: none;
  margin-left: auto;
  align-items: center;
  padding-right: var(--gutter);
}

.bar__led {
  width: 5px;
  height: 5px;
  background: var(--accent);
  animation: led-pulse 2.4s steps(1) infinite;
}

@keyframes led-pulse {
  0%, 55% { opacity: 1; }
  56%, 100% { opacity: 0.2; }
}

@media (max-width: 820px) {
  .bar__tag { display: none; }
}

@media (max-width: 620px) {
  .bar__seg--time { display: none; }
  .bar__seg { padding: 8px 12px; }
  .bar__dots { width: 20px; }
}

@media (max-width: 420px) {
  .bar__badge { font-size: 10.5px; padding-right: 20px; }
  .bar__seg--company .bar__dots { display: none; }
}
</style>
