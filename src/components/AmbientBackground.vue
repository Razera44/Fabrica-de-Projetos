<template>
  <!--
    Camada de ambiente única da aplicação.
    Fica fixa atrás de todo o conteúdo e nunca é remontada ao trocar de tela,
    então a animação nunca reinicia entre intro → perguntas → resultado.
  -->
  <div class="ambient" aria-hidden="true">
    <div class="ambient__glow ambient__glow--a"></div>
    <div class="ambient__glow ambient__glow--b"></div>

    <svg
      class="ambient__lines"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <!-- traço com as pontas esmaecendo, em vez de terminar em corte seco -->
        <linearGradient id="lineFadeH" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0" />
          <stop offset="16%" stop-color="currentColor" stop-opacity="1" />
          <stop offset="84%" stop-color="currentColor" stop-opacity="1" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- ---------- camada A ---------- -->
      <g class="ambient__drift ambient__drift--a">
        <path
          class="ambient__line ambient__line--a"
          :d="P.a"
          fill="none"
          stroke="url(#lineFadeH)"
          stroke-width="1"
          stroke-linecap="round"
        />
        <path
          class="ambient__line ambient__line--b"
          :d="P.b"
          fill="none"
          stroke="url(#lineFadeH)"
          stroke-width="0.7"
          stroke-linecap="round"
        />

        <g v-for="s in signalsA" :key="s.id" class="signal" :class="s.id" :style="s.style">
          <path v-if="s.w >= 1.2" class="signal__halo" :d="s.d" fill="none" stroke="var(--accent)" :stroke-width="s.w * 4.5" stroke-linecap="round" pathLength="100" :stroke-dasharray="`${s.len} ${300 - s.len}`" />
          <path class="signal__tail" :d="s.d" fill="none" stroke="var(--accent)" :stroke-width="s.w * 2.4" stroke-linecap="round" pathLength="100" :stroke-dasharray="`${s.len} ${300 - s.len}`" />
          <path class="signal__head" :d="s.d" fill="none" stroke="var(--accent)" :stroke-width="s.w" stroke-linecap="round" pathLength="100" stroke-dasharray="3.5 296.5" />
        </g>

        <circle class="ambient__node ambient__node--1" cx="640" cy="600" r="2.2" fill="var(--accent)" />
        <circle class="ambient__node ambient__node--2" cx="1240" cy="340" r="1.8" fill="var(--accent)" />
        <circle class="ambient__node ambient__node--6" cx="580" cy="130" r="1.6" fill="var(--accent)" />
      </g>

      <!-- ---------- camada B ---------- -->
      <g class="ambient__drift ambient__drift--b">
        <path
          class="ambient__line ambient__line--c"
          :d="P.c"
          fill="none"
          stroke="url(#lineFadeH)"
          stroke-width="0.85"
          stroke-linecap="round"
        />
        <path
          class="ambient__line ambient__line--d"
          :d="P.d"
          fill="none"
          stroke="url(#lineFadeH)"
          stroke-width="0.65"
          stroke-linecap="round"
        />

        <g v-for="s in signalsB" :key="s.id" class="signal" :class="s.id" :style="s.style">
          <path v-if="s.w >= 1.2" class="signal__halo" :d="s.d" fill="none" stroke="var(--accent)" :stroke-width="s.w * 4.5" stroke-linecap="round" pathLength="100" :stroke-dasharray="`${s.len} ${300 - s.len}`" />
          <path class="signal__tail" :d="s.d" fill="none" stroke="var(--accent)" :stroke-width="s.w * 2.4" stroke-linecap="round" pathLength="100" :stroke-dasharray="`${s.len} ${300 - s.len}`" />
          <path class="signal__head" :d="s.d" fill="none" stroke="var(--accent)" :stroke-width="s.w" stroke-linecap="round" pathLength="100" stroke-dasharray="3 297" />
        </g>

        <circle class="ambient__node ambient__node--3" cx="660" cy="220" r="2" fill="var(--accent)" />
        <circle class="ambient__node ambient__node--4" cx="1240" cy="400" r="1.6" fill="var(--accent)" />
        <circle class="ambient__node ambient__node--7" cx="720" cy="780" r="1.7" fill="var(--accent)" />
      </g>

      <!-- ---------- camada C (verticais) ---------- -->
      <g class="ambient__drift ambient__drift--c">
        <path
          class="ambient__line ambient__line--e"
          :d="P.e"
          fill="none"
          stroke="url(#lineFadeH)"
          stroke-width="0.75"
          stroke-linecap="round"
        />
        <path
          class="ambient__line ambient__line--f"
          :d="P.f"
          fill="none"
          stroke="url(#lineFadeH)"
          stroke-width="0.6"
          stroke-linecap="round"
        />

        <g v-for="s in signalsC" :key="s.id" class="signal" :class="s.id" :style="s.style">
          <path v-if="s.w >= 1.2" class="signal__halo" :d="s.d" fill="none" stroke="var(--accent)" :stroke-width="s.w * 4.5" stroke-linecap="round" pathLength="100" :stroke-dasharray="`${s.len} ${300 - s.len}`" />
          <path class="signal__tail" :d="s.d" fill="none" stroke="var(--accent)" :stroke-width="s.w * 2.4" stroke-linecap="round" pathLength="100" :stroke-dasharray="`${s.len} ${300 - s.len}`" />
          <path class="signal__head" :d="s.d" fill="none" stroke="var(--accent)" :stroke-width="s.w" stroke-linecap="round" pathLength="100" stroke-dasharray="3 297" />
        </g>

        <circle class="ambient__node ambient__node--5" cx="220" cy="620" r="1.8" fill="var(--accent)" />
        <circle class="ambient__node ambient__node--8" cx="1220" cy="620" r="1.6" fill="var(--accent)" />
      </g>
    </svg>

    <div class="ambient__scan"></div>
    <div class="ambient__grain"></div>
    <div class="ambient__vignette"></div>
  </div>
</template>

<script>
// traçados dos fios (viewBox 1440x900)
const P = {
  a: 'M -100 640 C 220 540, 380 760, 640 600 S 1020 240, 1240 340 S 1480 180, 1560 220',
  b: 'M -100 120 C 160 200, 340 40, 580 130 S 940 300, 1180 210 S 1440 90, 1560 140',
  c: 'M -100 260 C 180 340, 420 120, 660 220 S 1040 480, 1240 400 S 1460 560, 1560 500',
  d: 'M -100 820 C 200 700, 460 900, 720 780 S 1080 620, 1300 700 S 1500 800, 1560 760',
  e: 'M 120 -50 C 260 220, 60 420, 220 620 S 480 900, 380 1000',
  f: 'M 1300 -50 C 1180 220, 1360 420, 1220 620 S 1000 900, 1080 1000'
}

// cada sinal é um LED viajando por um fio: duração, atraso e tamanho próprios
const mk = (id, path, dur, delay, w, len, reverse = false) => ({
  id,
  d: P[path],
  w,
  len,
  style: {
    '--wire-dur': `${dur}s`,
    '--wire-delay': `${delay}s`,
    '--wire-dir': reverse ? 'reverse' : 'normal'
  }
})

export default {
  name: 'AmbientBackground',
  data() {
    return {
      P,
      reduced: false,
      // 9 LEDs distribuídos pelos 6 fios, com ciclos propositalmente
      // dessincronizados para nunca formarem um padrão perceptível
      signalsA: [
        mk('s1', 'a', 19, 0.4, 1.5, 17),
        mk('s2', 'a', 26, 11, 1.1, 11, true),
        mk('s3', 'b', 22, 6, 1.2, 13)
      ],
      signalsB: [
        mk('s4', 'c', 21, 2.5, 1.4, 15),
        mk('s5', 'c', 29, 15, 1, 10, true),
        mk('s6', 'd', 24, 8.5, 1.2, 13)
      ],
      signalsC: [
        mk('s7', 'e', 23, 4.5, 1.2, 14),
        mk('s8', 'f', 27, 13, 1.1, 12, true),
        mk('s9', 'e', 31, 19, 0.9, 9)
      ]
    }
  },
  mounted() {
    this.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
}
</script>

<style scoped>
.ambient {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: var(--bg);
}

/* --- halos lentos, muito discretos --- */
.ambient__glow {
  position: absolute;
  border-radius: 50%;
  /* sem filter: blur — o próprio gradiente radial faz a suavização,
     por uma fração do custo de pintura */
  will-change: transform;
}

.ambient__glow--a {
  width: 62vmax;
  height: 62vmax;
  top: -26vmax;
  left: -18vmax;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.022) 38%, transparent 70%);
  animation: drift-a 34s ease-in-out infinite alternate;
}

.ambient__glow--b {
  width: 54vmax;
  height: 54vmax;
  bottom: -24vmax;
  right: -16vmax;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.016) 38%, transparent 70%);
  animation: drift-b 42s ease-in-out infinite alternate;
}

@keyframes drift-a {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(5vw, 4vh, 0); }
}

@keyframes drift-b {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-4vw, -5vh, 0); }
}

/* --- traçado vetorial contínuo, em camadas com profundidade --- */
.ambient__lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--accent);
}

.ambient__line--a { opacity: 0.2; }
.ambient__line--b { opacity: 0.1; }
.ambient__line--c { opacity: 0.15; }
.ambient__line--d { opacity: 0.075; }
.ambient__line--e { opacity: 0.13; }
.ambient__line--f { opacity: 0.07; }

/*
  --- LED percorrendo o fio ---
  Duas camadas sobre o mesmo traçado: o rastro (largo, difuso, atrás) e a
  cabeça (curta, nítida, à frente). A cabeça anda 13 unidades adiantada em
  relação ao rastro do início ao fim, então a leitura é sempre "luz viajando".
*/
.signal__halo,
.signal__tail,
.signal__head {
  opacity: 0;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-duration: var(--wire-dur, 24s);
  animation-delay: var(--wire-delay, 0s);
  animation-direction: var(--wire-dir, normal);
}

.signal__halo {
  animation-name: wire-halo;
}

.signal__tail {
  animation-name: wire-tail;
}

.signal__head {
  animation-name: wire-head;
}

@keyframes wire-halo {
  0%   { stroke-dashoffset: 100; opacity: 0; }
  7%   { opacity: 0.05; }
  62%  { opacity: 0.05; }
  76%  { opacity: 0; }
  100% { stroke-dashoffset: -300; opacity: 0; }
}

@keyframes wire-tail {
  0%   { stroke-dashoffset: 100; opacity: 0; }
  7%   { opacity: 0.16; }
  62%  { opacity: 0.16; }
  76%  { opacity: 0; }
  100% { stroke-dashoffset: -300; opacity: 0; }
}

@keyframes wire-head {
  0%   { stroke-dashoffset: 87; opacity: 0; }
  7%   { opacity: 0.92; }
  62%  { opacity: 0.92; }
  76%  { opacity: 0; }
  100% { stroke-dashoffset: -313; opacity: 0; }
}

/* --- nós da malha: acendem devagar nos pontos de conexão --- */
.ambient__node {
  opacity: 0.14;
  animation: node-pulse 9s ease-in-out infinite;
}

.ambient__node--1 { animation-delay: 0s; }
.ambient__node--2 { animation-delay: 2.4s; }
.ambient__node--3 { animation-delay: 4.1s; }
.ambient__node--4 { animation-delay: 6.3s; }
.ambient__node--5 { animation-delay: 7.8s; }
.ambient__node--6 { animation-delay: 1.3s; }
.ambient__node--7 { animation-delay: 5.2s; }
.ambient__node--8 { animation-delay: 3.4s; }

@keyframes node-pulse {
  0%, 100% { opacity: 0.1; }
  50%      { opacity: 0.42; }
}

/* --- varredura horizontal lenta --- */
.ambient__scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 240px;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.028), transparent);
  animation: scan 22s linear infinite;
  will-change: transform;
}

@keyframes scan {
  from { transform: translateY(-260px); }
  to { transform: translateY(100vh); }
}

/* --- grão fino --- */
.ambient__grain {
  position: absolute;
  inset: 0;
  opacity: 0.028;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}

/* --- vinheta para manter o texto legível --- */
.ambient__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 100% 80% at 50% 40%, transparent 40%, rgba(5, 5, 5, 0.74) 100%);
}

/* telas pequenas costumam ter GPU mais modesta: menos sinais simultâneos */
@media (max-width: 700px) {
  .signal.s2,
  .signal.s5,
  .signal.s9 {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient__scan {
    display: none;
  }

  .signal__halo,
  .signal__tail,
  .signal__head,
  .ambient__node {
    animation: none;
  }
}
</style>
