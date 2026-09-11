// Diretiva v-reveal: revelação bidirecional ligada ao scroll.
//
// O elemento aparece (fade + deslocamento) quando entra na viewport e volta a
// desaparecer quando sai — descendo ou subindo. O sentido do deslocamento é
// decidido pela posição do elemento em relação à tela: quem está abaixo entra
// de baixo, quem está acima entra de cima. Assim o movimento acompanha o
// scroll em vez de brigar com ele.
//
// Uso:
//   v-reveal            -> revela e esconde conforme o scroll
//   v-reveal="120"      -> mesma coisa, com 120ms de atraso na entrada (cascata)
//   v-reveal.once       -> revela uma única vez e não esconde mais

const SHIFT = 26 // px de deslocamento no estado oculto

const prefersReduced = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let observer = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const el = entry.target
        const opts = el.__reveal || {}

        // de que lado da tela o elemento está: define para onde ele foge
        const isBelow = entry.boundingClientRect.top > window.innerHeight * 0.5
        el.style.setProperty('--reveal-shift', `${isBelow ? SHIFT : -SHIFT}px`)

        if (entry.isIntersecting) {
          // atraso só na entrada; saída é sempre imediata para acompanhar o scroll
          el.style.transitionDelay = opts.delay ? `${opts.delay}ms` : '0ms'
          el.classList.add('is-visible')
          if (opts.once) observer.unobserve(el)
        } else if (!opts.once) {
          el.style.transitionDelay = '0ms'
          el.classList.remove('is-visible')
        }
      })
    },
    {
      threshold: 0,
      // margem negativa: o elemento só some quando já saiu de fato da área útil
      rootMargin: '-6% 0px -6% 0px'
    }
  )
  return observer
}

export const reveal = {
  mounted(el, binding) {
    el.classList.add('reveal')

    if (prefersReduced()) {
      el.classList.add('is-visible')
      return
    }

    el.__reveal = {
      delay: Number(binding.value) || 0,
      once: Boolean(binding.modifiers.once)
    }

    getObserver().observe(el)
  },

  unmounted(el) {
    if (observer) observer.unobserve(el)
    delete el.__reveal
  }
}
