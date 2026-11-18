<template>
  <Teleport to="body">
  <div class="chat-widget">
    <section v-if="open" id="chat-panel" class="chat-panel" aria-label="Assistente de IA">
      <header class="chat-header"><div><strong>Assistente de IA</strong><small>Ajuda sobre sua avaliação</small></div><button type="button" aria-label="Fechar chat" @click="open = false">×</button></header>
      <div ref="log" class="chat-messages" role="log" aria-live="polite">
        <p v-if="!messages.length" class="chat-intro">Pergunte sobre suas notas e os próximos passos para melhorar a segurança.</p>
        <p v-for="(message, index) in messages" :key="index" :class="['chat-message', `chat-message--${message.role}`]">
          <strong>{{ message.role === 'user' ? 'Você' : 'Assistente' }}</strong><span>{{ message.text }}</span>
        </p>
        <p v-if="loading" class="chat-intro">O assistente está respondendo…</p>
      </div>
      <p v-if="error" class="chat-error" role="alert">{{ error }}</p>
      <form class="chat-form" @submit.prevent="send">
        <label class="sr-only" for="chat-question">Sua mensagem</label>
        <textarea id="chat-question" ref="input" v-model="question" maxlength="1000" rows="2" placeholder="Escreva sua pergunta…" :disabled="loading" @keydown.enter.exact.prevent="send" />
        <button type="submit" :disabled="loading || !question.trim()" aria-label="Enviar mensagem">➤</button>
      </form>
      <small class="chat-hint">Enter envia · Shift+Enter quebra a linha</small>
    </section>
    <button class="chat-toggle" type="button" :aria-expanded="open" aria-controls="chat-panel" :aria-label="open ? 'Fechar assistente de IA' : 'Abrir assistente de IA'" @click="toggle">
      <span aria-hidden="true">{{ open ? '×' : '✦' }}</span><span>{{ open ? 'Fechar' : 'Fale com a IA' }}</span>
    </button>
  </div>
  </Teleport>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { askAssistant } from '../utils/backend.js'
const props = defineProps({ scores: { type: Object, required: true }, companyName: { type: String, required: true } })
const open = ref(false)
const question = ref('')
const loading = ref(false)
const error = ref('')
const messages = ref([])
const input = ref(null)
const log = ref(null)
async function toggle() {
  open.value = !open.value
  if (open.value) { await nextTick(); input.value?.focus() }
}
async function scrollToEnd() {
  await nextTick()
  if (log.value) log.value.scrollTop = log.value.scrollHeight
}
async function send() {
  const text = question.value.trim()
  if (!text || loading.value) return
  messages.value.push({ role: 'user', text })
  question.value = ''
  error.value = ''
  loading.value = true
  await scrollToEnd()
  try {
    const result = await askAssistant(text, props.scores, props.companyName)
    messages.value.push({ role: 'assistant', text: result.resposta || 'Não foi possível gerar uma resposta.' })
  } catch (cause) { error.value = cause.message || 'Não foi possível consultar o assistente.' }
  finally { loading.value = false; await scrollToEnd(); input.value?.focus() }
}
</script>

<style scoped>
.chat-widget { position: fixed; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); z-index: 100; display: grid; justify-items: end; gap: 12px; isolation: isolate; }
.chat-toggle { display: flex; align-items: center; gap: 10px; padding: 13px 18px; border: 1px solid var(--line-strong); background: var(--ink); color: var(--bg); box-shadow: 0 10px 32px #0006; font: inherit; font-weight: 700; cursor: pointer; }
.chat-toggle span:first-child { font-size: 20px; line-height: 1; }
.chat-panel { width: min(520px, calc(100vw - 32px)); height: min(640px, calc(100dvh - 100px)); display: flex; flex-direction: column; border: 1px solid var(--line-strong); background: var(--panel-deep); color: var(--ink); box-shadow: 0 16px 48px #0009; contain: paint; }
.chat-widget, .chat-widget * { animation: none !important; }
.chat-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid var(--line-soft); }
.chat-header div { display: grid; gap: 3px; }.chat-header small,.chat-hint { color: var(--ink-lo); }.chat-header button { border: 0; background: transparent; color: inherit; font-size: 26px; cursor: pointer; }
.chat-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 16px; }
.chat-intro { color: var(--ink-mid); margin: 0; line-height: 1.5; }
.chat-message { display: grid; gap: 5px; max-width: 90%; margin: 0; padding: 10px 12px; border: 1px solid var(--line-soft); white-space: pre-wrap; overflow-wrap: anywhere; font-size: 13px; line-height: 1.5; }
.chat-message--user { align-self: end; background: var(--panel); }.chat-message--assistant { align-self: start; }.chat-message strong { font-size: 11px; }
.chat-error { margin: 0; padding: 8px 16px; color: var(--g-crit); font-size: 12px; }
.chat-form { display: flex; align-items: end; gap: 8px; padding: 12px 12px 2px; border-top: 1px solid var(--line-soft); }
.chat-form textarea { flex: 1; min-width: 0; max-height: 100px; resize: vertical; padding: 10px; border: 1px solid var(--line-strong); background: var(--bg); color: var(--ink); font: inherit; }
.chat-form button { padding: 10px 13px; border: 1px solid var(--line-strong); background: var(--ink); color: var(--bg); cursor: pointer; }.chat-form button:disabled { opacity: .5; cursor: default; }
.chat-hint { padding: 0 12px 12px; font-size: 10px; }.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
</style>
