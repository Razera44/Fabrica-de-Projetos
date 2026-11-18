import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const reveal = {
  mounted(el, binding) {
    const media = gsap.matchMedia()
    const delay = Math.max(0, Number(binding.value) || 0) / 1000
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.fromTo(el,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1, y: 0, duration: 0.8, delay,
          ease: 'power3.out', overwrite: 'auto',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: binding.modifiers.once
              ? 'play none none none'
              : 'play none none reverse'
          }
        }
      )
      return () => tween.kill()
    })
    media.add('(prefers-reduced-motion: reduce)', () => gsap.set(el, { autoAlpha: 1, y: 0 }))
    el.__revealMedia = media
    requestAnimationFrame(() => ScrollTrigger.refresh())
  },
  unmounted(el) {
    el.__revealMedia?.revert()
    delete el.__revealMedia
  }
}
