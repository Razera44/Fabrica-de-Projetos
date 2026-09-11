// Diretiva v-scramble: o texto entra como sequência binária "1001..." e vai
// sendo decodificado da esquerda para a direita até revelar o conteúdo real.
//
// Uso:
//   v-scramble                      -> decodifica assim que o elemento aparece
//   v-scramble="180"                -> mesma coisa, com 180ms de atraso
//   v-scramble="{ delay: 120, duration: 700 }"
//
// O texto final é lido do próprio DOM depois que o Vue renderiza, então não é
// preciso duplicar o conteúdo em nenhuma prop.

const SEED = '1001'
const GLYPHS = '01'

// duração padrão da decodificação
const DURATION = 1500
// intervalo de troca dos dígitos ainda não resolvidos: a 60fps o texto piscava
// rápido demais para ser lido, então os glifos só trocam a cada 3 quadros
const FLICKER = 90

const prefersReduced = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// um observer só para todos os elementos: a decodificação começa quando
// o elemento entra na tela, não no mount (evita animar o que está fora da view)
let observer = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const state = entry.target.__scramble
        observer.unobserve(entry.target)
        if (state) start(entry.target, state)
      })
    },
    { threshold: 0.2, rootMargin: '0px 0px -5% 0px' }
  )
  return observer
}

function parseOptions(value) {
  if (typeof value === 'number') return { delay: value }
  if (value && typeof value === 'object') return value
  return {}
}

// texto provisório: "1001" repetido no comprimento do texto final,
// preservando espaços para o layout não saltar
function seedText(finalText) {
  let out = ''
  let k = 0
  for (const char of finalText) {
    if (char === ' ' || char === '\n') {
      out += char
    } else {
      out += SEED[k % SEED.length]
      k += 1
    }
  }
  return out
}

function start(el, state) {
  const run = () => {
    const finalText = state.finalText
    const chars = [...finalText]
    const total = chars.length
    if (!total) return

    // cada caractere tem seu instante de resolução: avança da esquerda para a
    // direita, com uma pequena variação para o efeito não ficar mecânico
    const settle = chars.map((_, i) => {
      const base = (i / total) * state.duration * 0.62
      return base + Math.random() * state.duration * 0.22
    })

    const began = performance.now()
    el.classList.add('is-scrambling')

    let lastFlicker = -Infinity
    let noise = chars.map(() => GLYPHS[(Math.random() * GLYPHS.length) | 0])

    const frame = now => {
      const elapsed = now - began

      // os dígitos aleatórios só mudam a cada FLICKER ms; entre uma troca e
      // outra a mesma sequência permanece na tela e dá tempo de ser lida
      if (now - lastFlicker >= FLICKER) {
        noise = chars.map(() => GLYPHS[(Math.random() * GLYPHS.length) | 0])
        lastFlicker = now
      }

      let out = ''
      let done = 0

      for (let i = 0; i < total; i += 1) {
        const char = chars[i]
        if (char === ' ' || char === '\n') {
          out += char
          done += 1
        } else if (elapsed >= settle[i]) {
          out += char
          done += 1
        } else {
          out += noise[i]
        }
      }

      el.textContent = out
      state.lastWritten = out

      if (done === total) {
        el.classList.remove('is-scrambling')
        state.raf = null
        state.running = false
        state.settled = true
        return
      }
      state.raf = requestAnimationFrame(frame)
    }

    state.running = true
    state.settled = false
    state.raf = requestAnimationFrame(frame)
  }

  const seed = seedText(state.finalText)
  el.textContent = seed
  state.lastWritten = seed
  state.settled = false
  if (state.delay > 0) {
    state.timer = setTimeout(run, state.delay)
  } else {
    run()
  }
}

function stop(el) {
  const state = el.__scramble
  if (!state) return
  if (state.raf) cancelAnimationFrame(state.raf)
  if (state.timer) clearTimeout(state.timer)
  state.raf = null
  state.timer = null
  state.running = false
}

export const scramble = {
  mounted(el, binding) {
    const opts = parseOptions(binding.value)
    const finalText = el.textContent

    if (prefersReduced() || !finalText.trim()) return

    const seed = seedText(finalText)

    el.__scramble = {
      finalText,
      delay: Number(opts.delay) || 0,
      duration: Number(opts.duration) || DURATION,
      raf: null,
      timer: null,
      running: false,
      settled: false,
      // último texto que ESTA diretiva escreveu; serve para distinguir uma
      // alteração real de dados de uma reescrita nossa
      lastWritten: seed
    }

    // já entra “codificado”, para não haver um flash do texto final
    el.textContent = seed
    getObserver().observe(el)
  },

  // Só reage quando o Vue realmente troca o valor. Enquanto a animação está
  // pendente ou rodando, o texto no DOM é nosso — comparar com ele aqui faria
  // a diretiva se reiniciar a cada re-render do componente pai (o gauge, por
  // exemplo, re-renderiza a cada frame durante a contagem).
  updated(el) {
    const state = el.__scramble
    if (!state || state.running || !state.settled) return

    const current = el.textContent
    if (current !== state.lastWritten && current !== state.finalText) {
      state.finalText = current
      stop(el)
      start(el, state)
    }
  },

  unmounted(el) {
    stop(el)
    if (observer) observer.unobserve(el)
    delete el.__scramble
  }
}
