import { gsap } from 'gsap'

const GLYPHS = '01'
let initialMount = true

export function finishInitialScrambleRegistration() {
  initialMount = false
}

function options(value) {
  if (typeof value === 'number') return { delay: value }
  return value && typeof value === 'object' ? value : {}
}

export const scramble = {
  mounted(el, binding) {
    const finalText = el.textContent || ''
    if (!initialMount || !finalText.trim() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const opts = options(binding.value)
    const chars = [...finalText]
    const progress = { value: 0 }
    let lastStep = -1
    el.textContent = chars.map((char, index) => char === ' ' || char === '\n' ? char : GLYPHS[index % GLYPHS.length]).join('')

    const tween = gsap.to(progress, {
      value: 1,
      duration: Math.max(0.3, Number(opts.duration || 900) / 1000),
      delay: Math.max(0, Number(opts.delay || 0) / 1000),
      ease: 'power2.out',
      onStart: () => el.classList.add('is-scrambling'),
      onUpdate: () => {
        const step = Math.floor(progress.value * 18)
        if (step === lastStep) return
        lastStep = step
        const settled = Math.floor(progress.value * chars.length)
        el.textContent = chars.map((char, index) => {
          if (char === ' ' || char === '\n' || index < settled) return char
          return GLYPHS[(index + step) % GLYPHS.length]
        }).join('')
      },
      onComplete: () => {
        el.textContent = finalText
        el.classList.remove('is-scrambling')
      }
    })
    el.__scrambleTween = tween
  },
  unmounted(el) {
    el.__scrambleTween?.kill()
    delete el.__scrambleTween
  }
}
